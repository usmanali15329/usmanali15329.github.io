---
title: "Giving a D365 F&O VM a Custom URL: Entra ID, Certificates and IIS Bindings"
date: 2026-10-05 12:00:00 +0200
category: guide
tags: [dynamics-365, azure, pki, iis, sql-server]
excerpt: "Move a D365 Finance & Operations one-box off its default hostname: app registration, web.config / wif.config edits, a SHA-384 certificate with makecert, IIS binding, thumbprint swap, and user provisioning."
---
<p class="guide-credit">Written by Muhammad Usman Ali. This guide is based on the internal runbooks I followed and the D365 functional VMs I configured as Junior Infrastructure Administrator at Code Practitioners. Domains, tenant and application IDs, certificate names and passwords have been replaced with placeholders.</p>

Functional consultants each want a VM with a memorable URL (`https://fin-training01.contoso.com` rather than the image's default `usnconeboxax1aos.cloud.onebox.dynamics.com`). That means the URL has to be changed consistently in Entra ID, in three config files, in a certificate and in IIS. Miss one and you get a sign-in loop.

This picks up after the base build in [the LCS VHD guide]({% post_url 2026-10-05-d365-fo-dev-vm-from-lcs-vhd-hyper-v %}): VM renamed, IP assigned, SQL renamed, SSRS checked.

## Placeholders used

| Placeholder | Meaning |
|---|---|
| `fin-training01.contoso.com` | The new custom URL (hostname) |
| `<APP-ID>` | Entra ID Application (client) ID |
| `<TENANT-ID>` | Directory (tenant) ID |
| `<TENANT-DOMAIN>` | Tenant domain, for example `contoso.onmicrosoft.com` |
| `FIN-TRAINING01-CERT` | Certificate file base name |

## 1. Give a SQL login to the consultant who'll use the VM

SSMS (as administrator) → *Security → Logins → New Login* → search for the user → **Server Roles: sysadmin**. On a personal dev or training box this saves a lot of support tickets.

## 2. Register the app for the new URL

In the Azure portal → **App registrations → New registration**:

- Unique name, platform **Web**, redirect URI `https://fin-training01.contoso.com`
- **Authentication → Add URI:** `https://fin-training01.contoso.com/auth`
- **Certificates & secrets → New client secret** (into the vault)
- Record `<APP-ID>` and `<TENANT-ID>`

Then run the desktop **Generate Self-Signed Certificates** script with `<APP-ID>`, answering **N** to create new ones.

## 3. Point the AOS at the new URL

All three files are in `C:\AOSService\webroot`. **Back them up first.**

**`web.config`**

| Key | New value |
|---|---|
| `Aad.Realm` | `spn:<APP-ID>` |
| `Aad.TenantDomainGUID` | `<TENANT-ID>` |
| `Infrastructure.FullyQualifiedDomainName` | `fin-training01.contoso.com` |
| `Infrastructure.HostName` | `fin-training01.contoso.com` |
| `Infrastructure.HostUrl` | `https://fin-training01.contoso.com/` |
| `Infrastructure.SoapServicesUrl` | `https://fin-training01.contoso.com/` |

**`wif.config`**: replace the `spn:` audience value with `<APP-ID>`.

**`wif.services.config`**

| Attribute | New value |
|---|---|
| `issuer` | `https://sts.windows.net/<TENANT-DOMAIN>/` |
| `reply` | `https://fin-training01.contoso.com/` |
| `realm` | `spn:<APP-ID>` |
| `domain` | `fin-training01.contoso.com` |

## 4. Create a certificate for the new hostname

Install the **Windows SDK** (all features). It provides `makecert.exe` and `pvk2pfx.exe`:

```cmd
cd "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x86"

makecert.exe -n "CN=fin-training01.contoso.com" -r -pe -a sha384 -len 2048 -cy authority ^
  -sv "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.pvk" -m 60 ^
  "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.cer"

pvk2pfx.exe -pvk "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.pvk" ^
  -spc "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.cer" ^
  -pfx "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.pfx" -po <PFX-PASSWORD>
```

`makecert` prompts for a private-key password. Use the same vault-generated value for `-po`.

`makecert` is deprecated. On current Windows the same certificate is one line of PowerShell, and it lands straight in the machine store:

```powershell
$cert = New-SelfSignedCertificate -DnsName 'fin-training01.contoso.com' `
  -CertStoreLocation Cert:\LocalMachine\My -KeyAlgorithm RSA -KeyLength 2048 `
  -HashAlgorithm SHA384 -NotAfter (Get-Date).AddMonths(60) -KeyExportPolicy Exportable
```

**Import and trust it:**

1. Double-click the `.pfx` → **Local Machine** → enter the password → tick **Mark this key as exportable** → store **Personal**.
2. Open **Manage computer certificates** → *Personal → Certificates* → copy the new certificate → paste it into **Trusted Root Certification Authorities → Certificates** (it's self-signed, so it has to trust itself).

## 5. Bind it in IIS and swap the thumbprint

1. **IIS Manager → Sites → AOSService → Bindings → Add:** type **https**, host name `fin-training01.contoso.com`, port **443**, SSL certificate = the new one.
2. **View** the certificate → *Details* → copy the **Thumbprint** → strip the spaces and convert it to **upper case**.
3. In `web.config`, set **`Infrastructure.CsuClientCertThumbprint`** to the new thumbprint.
4. Remove the old bindings, then restart IIS:

```cmd
iisreset /restart
```

## 6. Resolve the name

Until the name exists in real DNS, add it to the hosts file on the VM (and on any client that needs it):

```text
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1    fin-training01.contoso.com
```

## 7. Provision the admin and open the environment

```text
C:\AOSService\PackagesLocalDirectory\bin\AdminUserProvisioning.exe
```

Enter the admin's email → **Submit**. Browse to `https://fin-training01.contoso.com`, sign in, and confirm the dashboard loads.

## 8. Add the consultants

In D365: **System administration → Users → New**:

| Field | Value |
|---|---|
| User ID | Short ID (for example the first name) |
| User name | Full name |
| Email | The user's organisational email |
| Company | `USMF` (demo data company) |
| Person | Select the matching person |

**Assign roles → System administrator → OK → Save.**

If the new user still can't sign in, the record's identity provider or Entra object ID is usually stale. Correct it in `AxDB`:

```sql
USE AxDB;
SELECT ID, NETWORKALIAS, IDENTITYPROVIDER, OBJECTID FROM USERINFO WHERE ID = '<USER-ID>';

UPDATE USERINFO
SET    IDENTITYPROVIDER = 'https://sts.windows.net/',
       OBJECTID         = '<ENTRA-OBJECT-ID-OF-THE-USER>'
WHERE  ID = '<USER-ID>';
```

Get the object ID from **Entra ID → Users → (user) → Object ID**.

## Troubleshooting

| Symptom | Check |
|---|---|
| Endless sign-in redirect | Redirect URIs in the app registration must match `HostUrl` exactly, including `/auth` |
| `AADSTS50011` reply URL mismatch | Same as above. Check for trailing slashes and http vs https |
| Browser certificate error | Certificate not in Trusted Root, or the CN doesn't match the URL |
| HTTP 500 after editing configs | Malformed XML. Diff against your backup |
| Works on the VM, not from clients | Clients lack the hosts entry or DNS record, or don't trust the certificate |

## Security notes

- **Self-signed certificates are for dev and training only.** Anything users reach from outside should use a certificate from a real CA, or at least an internal PKI whose root is deployed by policy.
- Keep `.pfx` files and their passwords out of user Documents folders once imported. Delete the working copies, or move them to the vault.
- Granting *System administrator* in D365 and *sysadmin* in SQL is normal on a personal sandbox. Record it, so that training VMs aren't later promoted into anything shared.
