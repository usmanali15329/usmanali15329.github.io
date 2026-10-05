---
title: "Standing Up a D365 F&O Development VM on Hyper-V from the LCS VHD"
date: 2026-10-05 11:00:00 +0200
category: guide
tags: [hyper-v, dynamics-365, azure, networking, powershell, sql-server]
excerpt: "Download the LCS VHD, build the VM, give it its own NAT network and a published RDP port, register it with Entra ID, and provision the first admin user."
---
<p class="guide-credit">Written by Muhammad Usman Ali. This guide is based on the internal runbooks I followed and the D365 Finance &amp; Operations VM deployments I carried out as Junior Infrastructure Administrator at Code Practitioners. Hostnames, addresses, ports, tenant details and credentials have been replaced with placeholders.</p>

Microsoft ships a ready-made Dynamics 365 Finance & Operations "one-box" as a downloadable VHD in Lifecycle Services (LCS). Running it on your own Hyper-V host instead of in Azure is far cheaper for a consultancy that needs many dev and training VMs, but you have to do the plumbing yourself: networking, naming, Entra ID (Azure AD) registration and access.

## At a glance

| Item | Value used here |
|---|---|
| Source | LCS → Shared asset library → **Downloadable VHD** (multi-part) |
| VM | Generation 1 · 6 vCPU · 24 GB RAM · fixed-size VHD |
| Network | Internal Hyper-V switch + host NAT `10.10.0.0/24` (placeholder) |
| VM name / IP | `D365DEV01` / `10.10.0.21` (placeholders) |
| Remote access | Host NAT static mapping, external port `50021` → VM `3389` |

## 1. Get the VHD from LCS

1. Sign in to [LCS](https://lcs.dynamics.com) with your organisation's account (a private browser window avoids cached-account confusion).
2. **Shared asset library → Downloadable VHD** → download **every part** of the release you need (`FinandOps10.0.x.part01.exe`, `.part02.rar`, …) into one folder.
3. Run `part01.exe`, accept the agreement, choose an output folder and **Extract**. The parts reassemble into a single `.vhd`.

## 2. Enable Hyper-V on the host

*Server Manager → Add Roles and Features → Hyper-V*. On the *Virtual Machine Migration* page I tick **CredSSP** for authentication. Then install and reboot.

```powershell
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart
```

## 3. Create the disk and the VM

**Disk.** Hyper-V Manager → **New → Hard Disk** → **VHD**, **Fixed size** → name and location → **Copy the contents of the specified virtual hard disk** and point it to the extracted LCS VHD. Each VM gets its own copy, so the downloaded master stays clean.

**VM.** **New → Virtual Machine**:

- **Generation 1** (the LCS VHD is MBR/BIOS)
- **24 GB** memory
- Connect to the internal switch from step 5 (or leave disconnected and attach later)
- **Use an existing virtual hard disk** → the copy you just made

Before first boot, open **Settings**: **6 virtual processors**; *Integration Services* → enable **Guest services**, disable **Backup**; *Checkpoints* → disable.

```powershell
New-VM -Name 'D365DEV01' -Generation 1 -MemoryStartupBytes 24GB `
       -VHDPath 'D:\VMs\D365DEV01\D365DEV01.vhd' -SwitchName 'D365-Internal'
Set-VMProcessor -VMName 'D365DEV01' -Count 6
Enable-VMIntegrationService  -VMName 'D365DEV01' -Name 'Guest Service Interface'
Disable-VMIntegrationService -VMName 'D365DEV01' -Name 'Backup'
Set-VM -Name 'D365DEV01' -CheckpointType Disabled
```

## 4. First boot and baseline configuration

1. **Start → Connect.** Use the VM window's **Action → Ctrl+Alt+Delete**, because the keyboard shortcut goes to your own machine.
2. Sign in with the default password Microsoft publishes for LCS VHDs, then **change it straight away** (*Ctrl+Alt+Del → Change a password*) to one from the password manager.
3. **Rename the machine** (*System → Advanced system settings → Computer Name → Change*) and reboot.
4. **Re-arm the evaluation licence** so Windows doesn't start shutting down mid-project:

```cmd
slmgr /rearm
```

Reboot after re-arming.

## 5. Give the VM its own network: internal switch + NAT

Rather than bridging every dev VM onto the office LAN, each host gets an **internal** switch, and the host itself NATs that subnet out to the internet.

On the **host** (PowerShell as admin):

```powershell
# 1. Internal switch – appears on the host as "vEthernet (D365-Internal)"
New-VMSwitch -Name 'D365-Internal' -SwitchType Internal

# 2. Give the host an address on it – this becomes the VMs' gateway
New-NetIPAddress -InterfaceAlias 'vEthernet (D365-Internal)' -IPAddress 10.10.0.1 -PrefixLength 24

# 3. NAT the subnet out through the host
New-NetNat -Name 'D365-NAT' -InternalIPInterfaceAddressPrefix '10.10.0.0/24'
```

Attach the VM's **Network Adapter** to `D365-Internal` (VM *Settings → Network Adapter → Virtual switch*).

Inside the **VM**: `ncpa.cpl` → adapter → **IPv4** → IP `10.10.0.21`, mask `255.255.255.0`, gateway `10.10.0.1`, DNS = your resolver (for example `1.1.1.1` or the internal DNS server).

## 6. Publish RDP through the host

To reach the VM from outside, map a unique external port on the host to the VM's 3389. Use **one port per VM** and keep a register of them.

```powershell
$natName  = 'D365-NAT'
$extPort  = 50021            # unique per VM
$vmIP     = '10.10.0.21'

New-NetFirewallRule -DisplayName "RDP-$extPort-TCP-In" -Direction Inbound -Action Allow `
  -Protocol TCP -LocalPort $extPort -Profile Any
New-NetFirewallRule -DisplayName "RDP-$extPort-UDP-In" -Direction Inbound -Action Allow `
  -Protocol UDP -LocalPort $extPort -Profile Any

Add-NetNatStaticMapping -NatName $natName -Protocol TCP -ExternalIPAddress '0.0.0.0' `
  -ExternalPort $extPort -InternalIPAddress $vmIP -InternalPort 3389
```

Users then connect to `<host-public-name>:50021`. Before you hand that out, read the hardening section of my [RDP guide]({% post_url 2026-10-05-secure-rdp-access-to-lab-vms %}). At minimum, scope the firewall rule with `-RemoteAddress` to known IPs, or put the hosts behind a VPN.

## 7. Fix SQL Server and SSRS after the rename

The LCS image's SQL Server still remembers the old machine name. In **SSMS** (as administrator, server = new machine name):

```sql
SELECT @@SERVERNAME, SERVERPROPERTY('ServerName');   -- the two will differ after a rename

EXEC sp_dropserver 'OLD-MACHINE-NAME';
EXEC sp_addserver  'D365DEV01', 'local';
-- restart the SQL Server service (or the VM), then re-run the SELECT
```

Then open **Report Server Configuration Manager**, connect to the new machine name and confirm the **Database** tab points to `localhost`.

Install Chrome and Notepad++ while you're here. You'll need a decent editor for the config files later.

## 8. Register the environment in Entra ID (Azure AD)

D365 F&O authenticates users against Entra ID, so each VM needs an app registration.

1. Find the environment's URL: **IIS Manager → Sites → AOSService → Browse website** and copy the `https://…` address.
2. [Azure portal](https://portal.azure.com) → **App registrations → New registration**: unique name, platform **Web**, redirect URI = the AOS URL.
3. **Authentication → Add URI**: the same URL with `/auth` appended.
4. **Certificates & secrets → New client secret**. Store it in the vault and treat it like a password.
5. Note the **Application (client) ID** and **Directory (tenant) ID**.

## 9. Generate the environment certificates

The LCS image includes a **Generate Self-Signed Certificates** script on the desktop. Run it, paste the **Application ID**, and answer **N** to create new certificates (rather than reuse existing ones). Wait for it to finish.

## 10. Provision the first administrator

```text
C:\AOSService\PackagesLocalDirectory\bin\AdminUserProvisioning.exe
```

Enter the admin's Entra ID email address → **Submit** → confirm it reports success. Browse to the AOS URL and sign in.

## 11. Trim services you don't need

On a dev VM, stop and disable these to free CPU and RAM:

- **Management Reporter 2012 Process Service**
- **Microsoft Dynamics 365 Unified Operations: Batch Management Service** (re-enable it when you actually need to test batch jobs)

```powershell
'MR2012ProcessService','DynamicsAxBatch' | ForEach-Object { Stop-Service $_ -Force; Set-Service $_ -StartupType Disabled }
```

## Security notes

- **Published RDP ports are the biggest risk here.** Restrict them by source IP, keep NLA on, and alert on failed logons.
- **Client secrets and certificate passwords** belong in a vault with an expiry reminder. Never put them in the runbook itself.
- **Change the published default password on first boot**, every time. Anyone who has seen the LCS docs knows it.
- Keep a simple register (VM → owner → internal IP → external port → expiry date) so that orphaned VMs, and their open ports, get cleaned up.

Next: [giving the VM a custom URL with its own certificate]({% post_url 2026-10-05-d365-fo-custom-url-certificates-iis %}).
