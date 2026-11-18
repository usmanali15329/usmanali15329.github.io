---
title: "Setting Up an On-Prem D365 F&O Development Environment on Hyper-V"
date: 2026-10-05 11:00:00 +0200
category: guide
tags: [hyper-v, dynamics-365, azure, networking, powershell, sql-server]
excerpt: "Full step-by-step build of a Dynamics 365 Finance & Operations development VM from the LCS VHD: Hyper-V, VM build, networking, SQL/SSRS, Entra ID app, certificates, NAT and port forwarding, user provisioning."
---
<p class="guide-credit">Compiled by Muhammad Usman Ali from the internal build runbooks used at Code Practitioners, which I followed for the D365 F&amp;O VM deployments I carried out as Junior Infrastructure Administrator. Server names, IP addresses, ports, tenant details and accounts are blurred in screenshots or replaced with placeholders in the text.</p>

**Contents:** [Access the server](#how-to-access-the-server) · [Download the VHD from LCS](#download-the-vhd-from-lcs) · [Build the VHD from parts](#build-the-vhd-from-parts) · [Enable Hyper-V](#enable-hyper-v-on-the-server) · [Build the virtual hard disk](#build-the-virtual-hard-disk-for-the-new-vm) · [Build the VM](#build-the-virtual-machine) · [Configure the machine](#configure-the-machine) · [Change password](#change-the-password) · [Network switch](#create-the-network-switch) · [Renew licence](#renew-the-virtual-machine-licence) · [IP address](#assign-an-ip-address) · [SQL Server](#configure-sql-server) · [Reporting Server](#configure-reporting-server) · [Azure app](#create-the-app-in-the-azure-portal) · [Certificates](#generate-self-signed-certificates) · [Internet (NAT)](#enable-internet-on-the-machine) · [Port forwarding](#port-forwarding) · [Provision user](#provision-the-admin-user-for-d365) · [Block services](#block-unneeded-services)

## How to access the server

**1.** Open **Remote Desktop Connection**.

<img src="{{ '/assets/img/guides/d365/001.png' | relative_url }}" alt="Screenshot" loading="lazy" width="983" height="796">

**2.** Enter the IP address of the Hyper-V host server.

<img src="{{ '/assets/img/guides/d365/002.png' | relative_url }}" alt="Screenshot" loading="lazy" width="540" height="311">

**3.** Enter the username and password for the server.

<img src="{{ '/assets/img/guides/d365/003.png' | relative_url }}" alt="Screenshot" loading="lazy" width="573" height="323">

## Download the VHD from LCS

**1.** Go to [lcs.dynamics.com](https://lcs.dynamics.com/v2) in a private (incognito) window and sign in with your account.

<img src="{{ '/assets/img/guides/d365/004.png' | relative_url }}" alt="Screenshot" loading="lazy" width="661" height="142">

**2.** Open **Shared asset library**.

<img src="{{ '/assets/img/guides/d365/005.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1133" height="873">

**3.** In the Shared asset library, click **Downloadable VHD** and download every VHD part.

<img src="{{ '/assets/img/guides/d365/006.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1400" height="577">

## Build the VHD from parts

**1.** Run `FinandOps10.0.x.part01.exe`.

<img src="{{ '/assets/img/guides/d365/007.png' | relative_url }}" alt="Screenshot" loading="lazy" width="833" height="386">

**2.** Accept the user agreement.

<img src="{{ '/assets/img/guides/d365/008.png' | relative_url }}" alt="Screenshot" loading="lazy" width="524" height="390">

**3.** Select a location for the output VHD file and click **Extract**.

<img src="{{ '/assets/img/guides/d365/009.png' | relative_url }}" alt="Screenshot" loading="lazy" width="522" height="391">

**4.** The VHD is generated when extraction completes.

<img src="{{ '/assets/img/guides/d365/010.png' | relative_url }}" alt="Screenshot" loading="lazy" width="850" height="250">

## Enable Hyper-V on the server

**1.** Open the Start menu and launch **Server Manager**.

<img src="{{ '/assets/img/guides/d365/011.png' | relative_url }}" alt="Screenshot" loading="lazy" width="663" height="681">

**2.** In Server Manager, go to **Manage → Add Roles and Features**.

<img src="{{ '/assets/img/guides/d365/012.png' | relative_url }}" alt="Screenshot" loading="lazy" width="388" height="214">

**3.** Click **Next** on this page.

<img src="{{ '/assets/img/guides/d365/013.png' | relative_url }}" alt="Screenshot" loading="lazy" width="787" height="560">

**4.** Click **Next** on this page.

<img src="{{ '/assets/img/guides/d365/014.png' | relative_url }}" alt="Screenshot" loading="lazy" width="788" height="561">

**5.** Select **Hyper-V** from the roles.

<img src="{{ '/assets/img/guides/d365/015.png' | relative_url }}" alt="Screenshot" loading="lazy" width="788" height="560">

**6.** Click **Next** on this page.

<img src="{{ '/assets/img/guides/d365/016.png' | relative_url }}" alt="Screenshot" loading="lazy" width="784" height="560">

**7.** Click **Next** on this page.

<img src="{{ '/assets/img/guides/d365/017.png' | relative_url }}" alt="Screenshot" loading="lazy" width="787" height="561">

**8.** Click **Next** on this page.

<img src="{{ '/assets/img/guides/d365/018.png' | relative_url }}" alt="Screenshot" loading="lazy" width="876" height="592">

**9.** Select **CredSSP** as the migration authentication protocol and continue.

<img src="{{ '/assets/img/guides/d365/019.png' | relative_url }}" alt="Screenshot" loading="lazy" width="875" height="594">

**10.** Click **Next** on this page.

<img src="{{ '/assets/img/guides/d365/020.png' | relative_url }}" alt="Screenshot" loading="lazy" width="880" height="591">

**11.** Install the Hyper-V role.

<img src="{{ '/assets/img/guides/d365/021.png' | relative_url }}" alt="Screenshot" loading="lazy" width="878" height="591">

**12.** Close the window.

<img src="{{ '/assets/img/guides/d365/022.png' | relative_url }}" alt="Screenshot" loading="lazy" width="877" height="594">

**13.** Hyper-V is enabled after the server restarts.

<img src="{{ '/assets/img/guides/d365/023.png' | relative_url }}" alt="Screenshot" loading="lazy" width="338" height="274">

## Build the virtual hard disk for the new VM

**1.** Open **Hyper-V Manager** (or your preferred VM management tool).

<img src="{{ '/assets/img/guides/d365/024.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1060" height="723">

**2.** Right-click the server name and click **New → Hard Disk…**

<img src="{{ '/assets/img/guides/d365/025.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1057" height="724">

**3.** Click **Next** on the first page.

<img src="{{ '/assets/img/guides/d365/026.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1058" height="722">

**4.** Select **VHD** as the disk format.

<img src="{{ '/assets/img/guides/d365/027.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1056" height="720">

**5.** Select **Fixed size** as the disk type.

<img src="{{ '/assets/img/guides/d365/028.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1056" height="719">

**6.** Choose a **name** and **location** for the new virtual disk.

<img src="{{ '/assets/img/guides/d365/029.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1058" height="722">

**7.** Select **Copy the contents of the specified virtual hard disk**, then browse to the VHD you extracted earlier.

<img src="{{ '/assets/img/guides/d365/030.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1057" height="723">

**8.** Review the disk format, type, name, location and source, then click **Finish**.

<img src="{{ '/assets/img/guides/d365/031.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1059" height="722">

## Build the virtual machine

**1.** Right-click the server name and click **New → Virtual Machine…**

<img src="{{ '/assets/img/guides/d365/032.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1057" height="721">

**2.** Click **Next** on the first page.

<img src="{{ '/assets/img/guides/d365/033.png' | relative_url }}" alt="Screenshot" loading="lazy" width="703" height="533">

**3.** Choose a **name** and **location** for the new virtual machine.

<img src="{{ '/assets/img/guides/d365/034.png' | relative_url }}" alt="Screenshot" loading="lazy" width="706" height="532">

**4.** Select **Generation 1**.

<img src="{{ '/assets/img/guides/d365/035.png' | relative_url }}" alt="Screenshot" loading="lazy" width="706" height="534">

**5.** Assign memory to the VM (**24 GB** recommended).

<img src="{{ '/assets/img/guides/d365/036.png' | relative_url }}" alt="Screenshot" loading="lazy" width="704" height="534">

**6.** Select a network for the VM (the network switch is created [later in this guide](#create-the-network-switch)).

<img src="{{ '/assets/img/guides/d365/037.png' | relative_url }}" alt="Screenshot" loading="lazy" width="706" height="536">

**7.** Browse to and select the virtual disk you created earlier.

<img src="{{ '/assets/img/guides/d365/038.png' | relative_url }}" alt="Screenshot" loading="lazy" width="704" height="538">

**8.** Review the name, generation, memory, network and hard disk, then click **Finish**.

<img src="{{ '/assets/img/guides/d365/039.png' | relative_url }}" alt="Screenshot" loading="lazy" width="704" height="532">

**9.** A few settings before starting the machine: right-click the VM and open **Settings**.

<img src="{{ '/assets/img/guides/d365/040.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1056" height="723">

**10.** On the **Processor** tab, assign **6** virtual processors (recommended).

<img src="{{ '/assets/img/guides/d365/041.png' | relative_url }}" alt="Screenshot" loading="lazy" width="723" height="687">

**11.** On the **Integration Services** tab, tick **Guest services** and untick **Backup (volume shadow copy)**.

<img src="{{ '/assets/img/guides/d365/042.png' | relative_url }}" alt="Screenshot" loading="lazy" width="720" height="688">

**12.** On the **Checkpoints** tab, untick **Enable checkpoints**.

<img src="{{ '/assets/img/guides/d365/043.png' | relative_url }}" alt="Screenshot" loading="lazy" width="726" height="687">

## Configure the machine

**1.** Right-click the VM and click **Start**.

<img src="{{ '/assets/img/guides/d365/044.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1059" height="721">

**2.** Right-click the VM and click **Connect**.

<img src="{{ '/assets/img/guides/d365/045.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1064" height="725">

**3.** In the VM window, click **Action → Ctrl+Alt+Delete**.

> Pressing the key combination on your keyboard won't work, because it goes to your own machine. Use the option in the Action menu.

<img src="{{ '/assets/img/guides/d365/046.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1028" height="872">

**4.** Enter the machine's password. LCS VHDs ship with a default password that Microsoft publishes in its documentation, so change it straight away (below).

<img src="{{ '/assets/img/guides/d365/047.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1027" height="872">

**5.** Verify the machine is accessible.

<img src="{{ '/assets/img/guides/d365/048.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1027" height="875">

**6.** Rename the machine: right-click **This PC** and click **Properties**.

<img src="{{ '/assets/img/guides/d365/049.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1026" height="876">

**7.** Click **Advanced system settings**.

<img src="{{ '/assets/img/guides/d365/050.png' | relative_url }}" alt="Screenshot" loading="lazy" width="786" height="598">

**8.** Select the **Computer Name** tab and click **Change**.

<img src="{{ '/assets/img/guides/d365/051.png' | relative_url }}" alt="Screenshot" loading="lazy" width="411" height="471">

**9.** Enter a new name for the machine and restart it.

<img src="{{ '/assets/img/guides/d365/052.png' | relative_url }}" alt="Screenshot" loading="lazy" width="406" height="474">

## Change the password

**10.** Search for and open **Change your password**.

<img src="{{ '/assets/img/guides/d365/053.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1025" height="872">

**11.** Click **Change**.

<img src="{{ '/assets/img/guides/d365/054.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1026" height="732">

**12.** Enter the old password.

<img src="{{ '/assets/img/guides/d365/055.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1023" height="766">

**13.** Create a new password (generated and stored in the team password manager).

<img src="{{ '/assets/img/guides/d365/056.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1023" height="769">

## Create the network switch

**14.** Right-click the Hyper-V host and select **Virtual Switch Manager**.

<img src="{{ '/assets/img/guides/d365/057.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1054" height="720">

**15.** Go to **Virtual Switches → New virtual network switch**, select **Internal**, click **Create Virtual Switch**, then **Apply**.

<img src="{{ '/assets/img/guides/d365/058.png' | relative_url }}" alt="Screenshot" loading="lazy" width="724" height="687">

**16.** Open the VM's settings, go to its **Network Adapter** and select the switch you just created under **Virtual switch**.

<img src="{{ '/assets/img/guides/d365/059.png' | relative_url }}" alt="Screenshot" loading="lazy" width="725" height="690">

## Renew the virtual machine licence

**17.** Open Command Prompt as administrator, run the following, then restart the machine:

```cmd
slmgr /rearm
```

<img src="{{ '/assets/img/guides/d365/060.png' | relative_url }}" alt="Screenshot" loading="lazy" width="983" height="512">

## Assign an IP address

**18.** Open **Network & Internet settings**.

<img src="{{ '/assets/img/guides/d365/061.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1036" height="781">

**19.** Select **Change adapter options**.

<img src="{{ '/assets/img/guides/d365/062.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1023" height="770">

**20.** Right-click the Ethernet adapter and select **Status**.

<img src="{{ '/assets/img/guides/d365/063.png' | relative_url }}" alt="Screenshot" loading="lazy" width="800" height="605">

**21.** Click **Properties**.

<img src="{{ '/assets/img/guides/d365/064.png' | relative_url }}" alt="Screenshot" loading="lazy" width="795" height="600">

**22.** Double-click **Internet Protocol Version 4 (TCP/IPv4)**.

<img src="{{ '/assets/img/guides/d365/065.png' | relative_url }}" alt="Screenshot" loading="lazy" width="793" height="596">

**23.** Enter the IP address, subnet mask, gateway and DNS for the VM, using the range of the NAT network created [below](#enable-internet-on-the-machine) (for example IP `10.10.0.21`, gateway `10.10.0.1`).

<img src="{{ '/assets/img/guides/d365/066.png' | relative_url }}" alt="Screenshot" loading="lazy" width="793" height="616">

## Configure SQL Server

**24.** Search for **SSMS** and run it as administrator.

<img src="{{ '/assets/img/guides/d365/067.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1030" height="774">

**25.** Wait for SSMS to open.

<img src="{{ '/assets/img/guides/d365/068.png' | relative_url }}" alt="Screenshot" loading="lazy" width="810" height="421">

**26.** Enter the machine name as the server name and click **Connect**.

<img src="{{ '/assets/img/guides/d365/069.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1028" height="769">

**27.** Verify that the SQL Server database engine connects.

<img src="{{ '/assets/img/guides/d365/070.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1028" height="769">

<img src="{{ '/assets/img/guides/d365/071.png' | relative_url }}" alt="Screenshot" loading="lazy" width="344" height="273">

**28.** Open a new query with **Ctrl+N** or the **New Query** button.

<img src="{{ '/assets/img/guides/d365/072.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1028" height="768">

**29.** Check the server name, then execute with **F5** or the **Execute** button:

```sql
SELECT @@SERVERNAME;
SELECT SERVERPROPERTY('ServerName');
```

<img src="{{ '/assets/img/guides/d365/073.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1019" height="816">

**30.** Fix the server name. Replace the old name with the machine's previous name and the new name with its current name, execute, then restart the machine:

```sql
sp_dropserver 'OLD-NAME';
GO
sp_addserver 'NEW-NAME', local;
GO
```

<img src="{{ '/assets/img/guides/d365/074.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1024" height="769">

## Configure Reporting Server

**31.** Search for and open **Report Server Configuration Manager**.

<img src="{{ '/assets/img/guides/d365/075.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1024" height="679">

**32.** Enter the machine name as the server name and click **Connect**.

<img src="{{ '/assets/img/guides/d365/076.png' | relative_url }}" alt="Screenshot" loading="lazy" width="952" height="726">

**33.** Go to the **Database** tab and verify that the server name is `localhost`.

<img src="{{ '/assets/img/guides/d365/077.png' | relative_url }}" alt="Screenshot" loading="lazy" width="948" height="725">

**34.** Download and install [Google Chrome](https://www.google.com/chrome/) and [Notepad++](https://notepad-plus-plus.org/downloads/).

## Create the app in the Azure portal

**1.** Open the [Azure portal](https://portal.azure.com/#home) in a private window and sign in.

<img src="{{ '/assets/img/guides/d365/078.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1033" height="774">

**2.** From the home page, open **App registrations**.

<img src="{{ '/assets/img/guides/d365/079.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1035" height="777">

**3.** Click **New registration**.

<img src="{{ '/assets/img/guides/d365/080.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1299" height="734">

**4.** Enter a unique name for the app.

<img src="{{ '/assets/img/guides/d365/081.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1030" height="777">

**5.** Under **Redirect URI**, select **Web** and paste the environment URL (steps 6–8 show where to find it).

<img src="{{ '/assets/img/guides/d365/082.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1299" height="644">

**6.** On the VM, search for and open **IIS**.

<img src="{{ '/assets/img/guides/d365/083.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1029" height="776">

**7.** Expand the server → **Sites** → click **AOSService**, and copy the URL shown under **Browse Website**.

<img src="{{ '/assets/img/guides/d365/084.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1034" height="780">

**8.** Paste the URL you copied from IIS into the redirect URI.

<img src="{{ '/assets/img/guides/d365/085.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1028" height="776">

**9.** Go to the **Certificates & secrets** tab and click **New client secret**.

<img src="{{ '/assets/img/guides/d365/086.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1031" height="779">

**10.** Create the new secret and store it in the password manager.

<img src="{{ '/assets/img/guides/d365/087.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1029" height="778">

**11.** Go to the **Authentication** tab and click **Add URI**.

<img src="{{ '/assets/img/guides/d365/088.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1031" height="777">

**12.** Enter the same URL with `/auth` at the end, then save.

<img src="{{ '/assets/img/guides/d365/089.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1034" height="778">

**13.** Note the **Application (client) ID** and **Directory (tenant) ID**.

<img src="{{ '/assets/img/guides/d365/090.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1036" height="777">

## Generate self-signed certificates

**1.** On the VM desktop, run the **Generate Self-Signed Certificates** shortcut.

<img src="{{ '/assets/img/guides/d365/091.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1036" height="782">

**2.** Enter the Application ID you copied earlier. At the next prompt, press **N** to create a new certificate.

<img src="{{ '/assets/img/guides/d365/092.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1033" height="781">

**3.** Wait for all the certificates to be generated.

<img src="{{ '/assets/img/guides/d365/093.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1011" height="535">

## Enable internet on the machine

**1.** On the Hyper-V host, search for **Windows PowerShell ISE** and run it as administrator.

<img src="{{ '/assets/img/guides/d365/094.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1031" height="778">

**2.** Create the NAT for the internal switch's subnet:

```powershell
New-NetNat -Name "NATName" -InternalIPInterfaceAddressPrefix 10.10.0.0/24
```

<img src="{{ '/assets/img/guides/d365/095.png' | relative_url }}" alt="Screenshot" loading="lazy" width="805" height="376">

## Port forwarding

**1.** Back on the host, open **Windows PowerShell ISE** as administrator.

<img src="{{ '/assets/img/guides/d365/096.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1031" height="778">

**2.** Run the following, changing the port number, VM IP address and NAT name to match your environment:

```powershell
$portNumber = 50021          # unique external port per VM
$vmIP       = '10.10.0.21'   # the VM's internal IP

New-NetFirewallRule -DisplayName "RDP-$portNumber-TCP-In" -Profile Public -Direction Inbound -Action Allow -Protocol TCP -LocalPort $portNumber
New-NetFirewallRule -DisplayName "RDP-$portNumber-UDP-In" -Profile Public -Direction Inbound -Action Allow -Protocol UDP -LocalPort $portNumber
Add-NetNatStaticMapping -NatName "NATName" -ExternalIPAddress "0.0.0.0/24" -ExternalPort $portNumber -Protocol TCP -InternalIPAddress $vmIP -InternalPort 3389
```

<img src="{{ '/assets/img/guides/d365/097.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1400" height="788">

## Provision the admin user for D365

**1.** Open the admin provisioning tool: go to `C:\AOSService\PackagesLocalDirectory\bin` and run **AdminUserProvisioning.exe**.

<img src="{{ '/assets/img/guides/d365/098.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1299" height="730">

**2.** Enter the admin user's email address and click **Submit**.

<img src="{{ '/assets/img/guides/d365/099.png' | relative_url }}" alt="Screenshot" loading="lazy" width="518" height="209">

**3.** Verify the email address was provisioned successfully.

<img src="{{ '/assets/img/guides/d365/100.png' | relative_url }}" alt="Screenshot" loading="lazy" width="498" height="194">

## Block unneeded services

**1.** Search for and open **Services**.

<img src="{{ '/assets/img/guides/d365/101.png' | relative_url }}" alt="Screenshot" loading="lazy" width="798" height="798">

**2.** Find **Management Reporter 2012 Process Service**, right-click it and disable it.

<img src="{{ '/assets/img/guides/d365/102.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1248" height="595">

**3.** Find **Microsoft Dynamics 365 Unified Operations: Batch Management Service** and disable it.

<img src="{{ '/assets/img/guides/d365/103.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1248" height="593">


## Security notes

- **Published RDP ports are the biggest risk in this setup.** Restrict the firewall rule to known source IPs (`-RemoteAddress`) or put the hosts behind a VPN. See my [secure RDP guide]({% post_url 2026-10-05-secure-rdp-access-to-lab-vms %}).
- **Client secrets and certificate passwords** belong in a password manager, never in the runbook.
- **Change the published default password on first boot**, every time.

Next: [giving the VM a custom URL with its own certificate]({% post_url 2026-10-05-d365-fo-custom-url-certificates-iis %}).
