---
title: "D365 F&O Functional VM: Custom URL, Certificates, IIS Binding and User Provisioning"
date: 2026-10-05 12:00:00 +0200
category: guide
tags: [dynamics-365, azure, pki, iis, sql-server]
excerpt: "Full step-by-step configuration of a D365 Finance & Operations functional VM: rename, activation, IP, SQL/SSRS, Entra ID app, config file edits, makecert certificates, IIS binding, hosts file and user provisioning."
---
<p class="guide-credit">Compiled by Muhammad Usman Ali from the internal build runbooks used at Code Practitioners, which I followed for the D365 functional VMs I configured as Junior Infrastructure Administrator. Domains, tenant and application IDs, certificate names, emails and passwords are blurred in screenshots or replaced with placeholders in the text.</p>

This picks up after the base build in [the on-prem D365 guide]({% post_url 2026-10-05-d365-fo-dev-vm-from-lcs-vhd-hyper-v %}). Placeholders used below: custom URL `fin-training01.contoso.com`, certificate name `FIN-TRAINING01-CERT`, `<APP-ID>`, `<TENANT-ID>`.

**Contents:** [Machine setup](#machine-setup) · [OS activation](#activation-of-the-os) · [IP address](#assigning-the-ip-address) · [SQL Server](#configure-sql-server) · [Report Server](#configure-the-report-server) · [Software](#download-other-required-software) · [Azure app](#azure-app-registration) · [Certificates](#self-signed-certificate-generation) · [D365 URL](#configure-the-d365-url) · [Windows SDK](#certificate-creation-for-the-new-d365-domain) · [Create certificate](#create-the-certificate) · [IIS binding](#create-the-binding) · [Provision admin](#provision-the-admin-user-for-d365) · [Open D365](#open-dynamics-365-finance-and-operations) · [Add users](#how-to-provision-users-in-dynamics-365)

## Machine setup

**1.** Right-click **This PC** and go to **Properties**.

<img src="{{ '/assets/img/guides/custom-url/001.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1171" height="351">

**2.** Click **Advanced system settings**.

<img src="{{ '/assets/img/guides/custom-url/002.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1094" height="554">

**3.** Select the **Computer Name** tab and click **Change**.

<img src="{{ '/assets/img/guides/custom-url/003.png' | relative_url }}" alt="Screenshot" loading="lazy" width="888" height="462">

**4.** Enter a name for the VM.

<img src="{{ '/assets/img/guides/custom-url/004.png' | relative_url }}" alt="Screenshot" loading="lazy" width="873" height="579">

**5.** Open **Change a password**.

<img src="{{ '/assets/img/guides/custom-url/005.png' | relative_url }}" alt="Screenshot" loading="lazy" width="914" height="602">

**6.** Click **Change**.

<img src="{{ '/assets/img/guides/custom-url/006.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1066" height="507">

**7.** Set a new password according to the password SOP.

<img src="{{ '/assets/img/guides/custom-url/007.png' | relative_url }}" alt="Screenshot" loading="lazy" width="721" height="621">

**8.** Search for and open **Remote Desktop Connection**.

<img src="{{ '/assets/img/guides/custom-url/008.png' | relative_url }}" alt="Screenshot" loading="lazy" width="806" height="475">

**9.** Enter the machine name.

<img src="{{ '/assets/img/guides/custom-url/009.png' | relative_url }}" alt="Screenshot" loading="lazy" width="659" height="383">

**10.** Enter your login credentials (the machine must be reachable).

<img src="{{ '/assets/img/guides/custom-url/010.png' | relative_url }}" alt="Screenshot" loading="lazy" width="704" height="546">

## Activation of the OS

**1.** Search for **CMD** and run it as administrator.

<img src="{{ '/assets/img/guides/custom-url/011.png' | relative_url }}" alt="Screenshot" loading="lazy" width="803" height="500">

**2.** Run the following, click **OK** and restart the machine:

```cmd
slmgr /rearm
```

<img src="{{ '/assets/img/guides/custom-url/012.png' | relative_url }}" alt="Screenshot" loading="lazy" width="868" height="465">

## Assigning the IP address

**1.** Open the Run dialog and type `ncpa.cpl`.

<img src="{{ '/assets/img/guides/custom-url/013.png' | relative_url }}" alt="Screenshot" loading="lazy" width="535" height="461">

**2.** Open the adapter's **Properties**.

<img src="{{ '/assets/img/guides/custom-url/014.png' | relative_url }}" alt="Screenshot" loading="lazy" width="375" height="377">

**3.** Open the properties of **IPv4**.

<img src="{{ '/assets/img/guides/custom-url/015.png' | relative_url }}" alt="Screenshot" loading="lazy" width="461" height="413">

**4.** Set all IP settings according to your NAT switch and click **OK**.

<img src="{{ '/assets/img/guides/custom-url/016.png' | relative_url }}" alt="Screenshot" loading="lazy" width="466" height="613">

## Configure SQL Server

**1.** Search for **SSMS** and run it as administrator.

<img src="{{ '/assets/img/guides/custom-url/017.png' | relative_url }}" alt="Screenshot" loading="lazy" width="803" height="566">

<img src="{{ '/assets/img/guides/custom-url/018.png' | relative_url }}" alt="Screenshot" loading="lazy" width="818" height="408">

**2.** Enter your server name and click **Connect**.

<img src="{{ '/assets/img/guides/custom-url/019.png' | relative_url }}" alt="Screenshot" loading="lazy" width="660" height="379">

**3.** Verify all the SQL Server databases are there.

<img src="{{ '/assets/img/guides/custom-url/020.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1269" height="662">

**4.** Click the **New Query** button.

<img src="{{ '/assets/img/guides/custom-url/021.png' | relative_url }}" alt="Screenshot" loading="lazy" width="887" height="97">

**5.** Run the following to check the server's name:

```sql
SELECT @@SERVERNAME;
SELECT SERVERPROPERTY('ServerName');
```

<img src="{{ '/assets/img/guides/custom-url/022.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1253" height="655">

**6.** Run the following, replacing the old and new server names, then restart the machine:

```sql
sp_dropserver 'OLD-NAME';
GO
sp_addserver 'NEW-NAME', local;
GO
```

<img src="{{ '/assets/img/guides/custom-url/023.png' | relative_url }}" alt="Screenshot" loading="lazy" width="680" height="423">

**7.** Under **Security**, right-click **Logins → New Login** to give the user admin rights.

<img src="{{ '/assets/img/guides/custom-url/024.png' | relative_url }}" alt="Screenshot" loading="lazy" width="975" height="650">

<img src="{{ '/assets/img/guides/custom-url/025.png' | relative_url }}" alt="Screenshot" loading="lazy" width="770" height="626">

**8.** Click **Search**.

<img src="{{ '/assets/img/guides/custom-url/026.png' | relative_url }}" alt="Screenshot" loading="lazy" width="741" height="645">

**9.** Search for and add the user, then click **OK**.

<img src="{{ '/assets/img/guides/custom-url/027.png' | relative_url }}" alt="Screenshot" loading="lazy" width="526" height="405">

**10.** Go to **Server Roles** and give the user the **sysadmin** role.

<img src="{{ '/assets/img/guides/custom-url/028.png' | relative_url }}" alt="Screenshot" loading="lazy" width="698" height="386">

## Configure the Report Server

**1.** Search for and open **Report Server Configuration Manager**.

<img src="{{ '/assets/img/guides/custom-url/029.png' | relative_url }}" alt="Screenshot" loading="lazy" width="864" height="351">

**2.** Enter the machine name as the server name and click **Connect**.

<img src="{{ '/assets/img/guides/custom-url/030.png' | relative_url }}" alt="Screenshot" loading="lazy" width="784" height="376">

**3.** Go to the **Database** tab and verify the server name is `localhost`.

<img src="{{ '/assets/img/guides/custom-url/031.png' | relative_url }}" alt="Screenshot" loading="lazy" width="943" height="192">

## Download other required software

Install [Google Chrome](https://www.google.com/chrome/) and [Notepad++](https://notepad-plus-plus.org/downloads/).

## Azure App Registration

**1.** Open Notepad++ and write down your custom URL.

<img src="{{ '/assets/img/guides/custom-url/032.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1080" height="561">

**2.** Go to the [Azure portal](https://portal.azure.com/#home) and open **App registrations**.

<img src="{{ '/assets/img/guides/custom-url/033.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1032" height="395">

**3.** Click **New registration**.

<img src="{{ '/assets/img/guides/custom-url/034.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1035" height="287">

**4.** On this page: (A) set a unique name for the app, (B) select the platform **Web**, (C) add your custom URL, and (D) click **Register**.

<img src="{{ '/assets/img/guides/custom-url/035.png' | relative_url }}" alt="Screenshot" loading="lazy" width="901" height="647">

**5.** Note the **Application (client) ID** and **Directory (tenant) ID**.

<img src="{{ '/assets/img/guides/custom-url/036.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1358" height="543">

**6.** Go to **Certificates & secrets** and click **New client secret**.

<img src="{{ '/assets/img/guides/custom-url/037.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1210" height="588">

**7.** Add the new secret (store its value in the password manager).

<img src="{{ '/assets/img/guides/custom-url/038.png' | relative_url }}" alt="Screenshot" loading="lazy" width="526" height="618">

**8.** Go to **Authentication** and click **Add URI**.

<img src="{{ '/assets/img/guides/custom-url/039.png' | relative_url }}" alt="Screenshot" loading="lazy" width="761" height="586">

**9.** Enter the custom URL with `/auth` at the end and save.

<img src="{{ '/assets/img/guides/custom-url/040.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1194" height="648">

## Self-signed certificate generation

**1.** On the desktop, open the **Generate Self-Signed Certificates** PowerShell shortcut.

<img src="{{ '/assets/img/guides/custom-url/041.png' | relative_url }}" alt="Screenshot" loading="lazy" width="950" height="694">

**2.** Enter the App ID you copied earlier, press **Enter**, then press **N**.

<img src="{{ '/assets/img/guides/custom-url/042.png' | relative_url }}" alt="Screenshot" loading="lazy" width="987" height="549">

**3.** The self-signed certificates are generated.

<img src="{{ '/assets/img/guides/custom-url/043.png' | relative_url }}" alt="Screenshot" loading="lazy" width="963" height="491">

## Configure the D365 URL

**1.** Go to `C:\AOSService\webroot` and open these files in Notepad++ (back them up first):

- `web.config`
- `wif.config`
- `wif.services.config`

<img src="{{ '/assets/img/guides/custom-url/044.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1133" height="575">

**2.** Changes in `web.config`:

- (A) Search for `Aad.Realm` and enter your App ID.
- (B) Search for `Aad.TenantDomainGUID` and enter your Tenant ID.

<img src="{{ '/assets/img/guides/custom-url/045.png' | relative_url }}" alt="Screenshot" loading="lazy" width="855" height="75">

- (C) Search for `Infrastructure.FullyQualifiedDomainName` and enter your custom URL.
- (D) Search for `Infrastructure.HostName` and enter your custom URL.
- (E) Search for `Infrastructure.HostUrl` and enter your custom URL.
- (F) Search for `Infrastructure.SoapServicesUrl` and enter your custom URL.

<img src="{{ '/assets/img/guides/custom-url/046.png' | relative_url }}" alt="Screenshot" loading="lazy" width="834" height="106">

**3.** Changes in `wif.config`: search for `spn` and replace the value with your **Application ID**.

**4.** Changes in `wif.services.config`:

- (A) Search for `issuer` and replace it with your **tenant**.
- (B) Search for `reply` and replace it with your **custom URL**.
- (C) Search for `realm` and replace it with your **Application ID**.
- (D) Search for `domain` and replace it with your **custom URL**.

<img src="{{ '/assets/img/guides/custom-url/047.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1027" height="221">

## Certificate creation for the new D365 domain

**1.** Download the [Windows SDK](https://developer.microsoft.com/windows/downloads/windows-sdk/) and start the installer. Follow the steps below until it has installed completely.

**2.** Click **Next**.

<img src="{{ '/assets/img/guides/custom-url/048.png' | relative_url }}" alt="Screenshot" loading="lazy" width="734" height="538">

**3.** Click **Next**.

<img src="{{ '/assets/img/guides/custom-url/049.png' | relative_url }}" alt="Screenshot" loading="lazy" width="731" height="535">

**4.** Click **Accept**.

<img src="{{ '/assets/img/guides/custom-url/050.png' | relative_url }}" alt="Screenshot" loading="lazy" width="730" height="537">

**5.** Tick all features and click **Install**.

<img src="{{ '/assets/img/guides/custom-url/051.png' | relative_url }}" alt="Screenshot" loading="lazy" width="716" height="539">

**6.** When installation completes, click **Close**.

<img src="{{ '/assets/img/guides/custom-url/052.png' | relative_url }}" alt="Screenshot" loading="lazy" width="774" height="560">

## Create the certificate

**1.** Go to the following folder and verify `makecert.exe` is there:

```text
C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x86
```

<img src="{{ '/assets/img/guides/custom-url/053.png' | relative_url }}" alt="Screenshot" loading="lazy" width="641" height="75">

**2.** Open Command Prompt as administrator and change to that folder:

```cmd
cd "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x86"
```

<img src="{{ '/assets/img/guides/custom-url/054.png' | relative_url }}" alt="Screenshot" loading="lazy" width="981" height="215">

Change the file paths and certificate name if needed, then run:

```cmd
makecert.exe -n "CN=fin-training01.contoso.com" -r -pe -a sha384 -len 2048 -cy authority -sv "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.pvk" -m 60 "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.cer"
```

<img src="{{ '/assets/img/guides/custom-url/055.png' | relative_url }}" alt="Screenshot" loading="lazy" width="960" height="155">

**3.** Create a password for the private key.

<img src="{{ '/assets/img/guides/custom-url/056.png' | relative_url }}" alt="Screenshot" loading="lazy" width="302" height="222">

**4.** Enter the password you just set.

<img src="{{ '/assets/img/guides/custom-url/057.png' | relative_url }}" alt="Screenshot" loading="lazy" width="281" height="189">

**5.** Now run the following (replace `<PFX-PASSWORD>` with your own password for the certificate):

```cmd
pvk2pfx.exe -pvk "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.pvk" -spc "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.cer" -pfx "%USERPROFILE%\Documents\FIN-TRAINING01-CERT.pfx" -po <PFX-PASSWORD>
```

<img src="{{ '/assets/img/guides/custom-url/058.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1347" height="229">

**6.** Enter the password you created earlier, and verify the certificate files are created.

<img src="{{ '/assets/img/guides/custom-url/059.png' | relative_url }}" alt="Screenshot" loading="lazy" width="323" height="230">

**7.** Go to your user's **Documents** folder and double-click the `.pfx` file.

<img src="{{ '/assets/img/guides/custom-url/060.png' | relative_url }}" alt="Screenshot" loading="lazy" width="822" height="259">

**8.** When the import dialog opens, select **Local Machine**.

<img src="{{ '/assets/img/guides/custom-url/061.png' | relative_url }}" alt="Screenshot" loading="lazy" width="556" height="527">

**9.** Select the certificate file.

<img src="{{ '/assets/img/guides/custom-url/062.png' | relative_url }}" alt="Screenshot" loading="lazy" width="627" height="181">

**10.** Enter the certificate password, tick **Mark this key as exportable…** and click **Next**.

<img src="{{ '/assets/img/guides/custom-url/063.png' | relative_url }}" alt="Screenshot" loading="lazy" width="543" height="505">

**11.** Click **Browse**.

<img src="{{ '/assets/img/guides/custom-url/064.png' | relative_url }}" alt="Screenshot" loading="lazy" width="545" height="515">

**12.** Select the **Personal** store.

<img src="{{ '/assets/img/guides/custom-url/065.png' | relative_url }}" alt="Screenshot" loading="lazy" width="406" height="380">

**13.** Verify the import information and click **Finish**.

<img src="{{ '/assets/img/guides/custom-url/066.png' | relative_url }}" alt="Screenshot" loading="lazy" width="579" height="550">

<img src="{{ '/assets/img/guides/custom-url/067.png' | relative_url }}" alt="Screenshot" loading="lazy" width="382" height="271">

**14.** Search for and open **Manage computer certificates**.

<img src="{{ '/assets/img/guides/custom-url/068.png' | relative_url }}" alt="Screenshot" loading="lazy" width="755" height="588">

**15.** Find the certificate you created under **Personal → Certificates**.

<img src="{{ '/assets/img/guides/custom-url/069.png' | relative_url }}" alt="Screenshot" loading="lazy" width="634" height="453">

**16.** Copy the certificate.

<img src="{{ '/assets/img/guides/custom-url/070.png' | relative_url }}" alt="Screenshot" loading="lazy" width="622" height="435">

**17.** Paste it into **Trusted Root Certification Authorities**.

<img src="{{ '/assets/img/guides/custom-url/071.png' | relative_url }}" alt="Screenshot" loading="lazy" width="628" height="447">

**18.** Verify the certificate.

<img src="{{ '/assets/img/guides/custom-url/072.png' | relative_url }}" alt="Screenshot" loading="lazy" width="642" height="457">

## Create the binding

**1.** Search for and open **IIS Manager**.

<img src="{{ '/assets/img/guides/custom-url/073.png' | relative_url }}" alt="Screenshot" loading="lazy" width="802" height="607">

**2.** Select the AOSService site and click **Bindings**.

<img src="{{ '/assets/img/guides/custom-url/074.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1016" height="518">

<img src="{{ '/assets/img/guides/custom-url/075.png' | relative_url }}" alt="Screenshot" loading="lazy" width="647" height="378">

**3.** Add a binding: type **https**, your custom URL as the **host name**, port **443**, and the certificate created above as the **SSL certificate**. Click **View**.

<img src="{{ '/assets/img/guides/custom-url/076.png' | relative_url }}" alt="Screenshot" loading="lazy" width="537" height="437">

**4.** On the **Details** tab, scroll down and copy the **Thumbprint** into Notepad++. Convert it to upper case.

<img src="{{ '/assets/img/guides/custom-url/077.png' | relative_url }}" alt="Screenshot" loading="lazy" width="437" height="540">

**5.** Open `web.config` in Notepad++, search for `Infrastructure.CsuClientCertThumbprint` and copy the thumbprint already in the file.

<img src="{{ '/assets/img/guides/custom-url/078.png' | relative_url }}" alt="Screenshot" loading="lazy" width="586" height="375">

**6.** Replace every occurrence of the old thumbprint with the new one.

<img src="{{ '/assets/img/guides/custom-url/079.png' | relative_url }}" alt="Screenshot" loading="lazy" width="580" height="365">

**7.** Remove all other bindings and close the dialog.

<img src="{{ '/assets/img/guides/custom-url/080.png' | relative_url }}" alt="Screenshot" loading="lazy" width="647" height="386">

**8.** Restart IIS:

```cmd
iisreset /restart
```

<img src="{{ '/assets/img/guides/custom-url/081.png' | relative_url }}" alt="Screenshot" loading="lazy" width="985" height="515">

**9.** Open the hosts file at `C:\Windows\System32\drivers\etc`.

<img src="{{ '/assets/img/guides/custom-url/082.png' | relative_url }}" alt="Screenshot" loading="lazy" width="890" height="229">

**10.** Add the custom URL to the hosts file, for example:

```text
127.0.0.1    fin-training01.contoso.com
```

<img src="{{ '/assets/img/guides/custom-url/083.png' | relative_url }}" alt="Screenshot" loading="lazy" width="536" height="430">

## Provision the admin user for D365

**1.** Run the provisioning tool: go to `C:\AOSService\PackagesLocalDirectory\bin` and run **AdminUserProvisioning.exe**.

<img src="{{ '/assets/img/guides/custom-url/084.png' | relative_url }}" alt="Screenshot" loading="lazy" width="776" height="634">

**2.** Enter your email address and click **Submit**.

<img src="{{ '/assets/img/guides/custom-url/085.png' | relative_url }}" alt="Screenshot" loading="lazy" width="686" height="244">

**3.** The email address is provisioned successfully.

<img src="{{ '/assets/img/guides/custom-url/086.png' | relative_url }}" alt="Screenshot" loading="lazy" width="508" height="221">

## Open Dynamics 365 Finance and Operations

**1.** Open a browser and go to the custom URL. Sign in with the email address you provisioned.

<img src="{{ '/assets/img/guides/custom-url/087.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1166" height="357">

**2.** Verify D365 loads and works.

<img src="{{ '/assets/img/guides/custom-url/088.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1240" height="719">

## How to provision users in Dynamics 365

**1.** In D365, search for **Users** and select **System administration > Users**.

<img src="{{ '/assets/img/guides/custom-url/089.png' | relative_url }}" alt="Screenshot" loading="lazy" width="648" height="366">

**2.** Select **New** to add the user's details.

<img src="{{ '/assets/img/guides/custom-url/090.png' | relative_url }}" alt="Screenshot" loading="lazy" width="657" height="225">

**3.** Add the user details:

| Field | Value |
|---|---|
| User ID | First name of the user |
| User name | Full name of the user |
| Email | The user's organisational email |
| Company | `USMF` |
| Person | Select the user's name in the list |

<img src="{{ '/assets/img/guides/custom-url/091.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1400" height="197">

**4.** Assign the user's role: select **Assign roles**.

<img src="{{ '/assets/img/guides/custom-url/092.png' | relative_url }}" alt="Screenshot" loading="lazy" width="381" height="124">

**5.** Filter the role name and search for **System administrator**.

<img src="{{ '/assets/img/guides/custom-url/093.png' | relative_url }}" alt="Screenshot" loading="lazy" width="471" height="271">

**6.** Select **System administrator** and click **OK**.

<img src="{{ '/assets/img/guides/custom-url/094.png' | relative_url }}" alt="Screenshot" loading="lazy" width="493" height="235">

**7.** Save the user (top-left corner).

<img src="{{ '/assets/img/guides/custom-url/095.png' | relative_url }}" alt="Screenshot" loading="lazy" width="779" height="159">

**8.** In Windows search, type **SSMS** and run it as administrator.

<img src="{{ '/assets/img/guides/custom-url/096.png' | relative_url }}" alt="Screenshot" loading="lazy" width="512" height="265">

**9.** Create a **New Query** and set the database to `AxDB`.

<img src="{{ '/assets/img/guides/custom-url/097.png' | relative_url }}" alt="Screenshot" loading="lazy" width="429" height="280">

**10.** Run this query, using the user's ID and their Object ID from Entra ID (Azure Active Directory):

```sql
SELECT * FROM USERINFO WHERE ID = '<USER-ID>';

UPDATE USERINFO
SET    IDENTITYPROVIDER = 'https://sts.windows.net/',
       OBJECTID = '<ENTRA-OBJECT-ID-OF-THE-USER>'
WHERE  ID = '<USER-ID>';
```

**11.** After the query runs, the user's **Identity provider** and **Object ID** values are updated.

<img src="{{ '/assets/img/guides/custom-url/098.png' | relative_url }}" alt="Screenshot" loading="lazy" width="577" height="308">

## Security notes

- **Self-signed certificates are for dev and training only.** Anything users reach from outside should use a certificate from a real CA or an internal PKI.
- Delete the working `.pvk` / `.pfx` copies from Documents once imported, and keep their passwords in the vault.
- *sysadmin* in SQL and *System administrator* in D365 are fine on a personal sandbox. Record them so that training VMs never get promoted into anything shared.
