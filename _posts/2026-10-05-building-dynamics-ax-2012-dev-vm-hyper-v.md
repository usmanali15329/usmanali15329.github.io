---
title: "How to Install a Dynamics AX 2012 Virtual Machine on a Hyper-V Server"
date: 2026-10-05 10:00:00 +0200
category: guide
tags: [hyper-v, windows-server, active-directory, sql-server, dynamics-ax]
excerpt: "Complete 18-step, screenshot-by-screenshot build of an AX 2012 development VM: VHD and VM on Hyper-V, Windows Server 2016, AD forest, AOS account, SQL Server 2012, prerequisites, database & AOS, Visual Studio, client tools and the initialization checklist."
---
<p class="guide-credit">Compiled by Muhammad Usman Ali from the internal build runbooks used at Code Practitioners, which I followed for the AX 2012 VM deployments I carried out as Junior Infrastructure Administrator. Server names, domains, IP addresses, accounts and licence details are blurred in screenshots or replaced with placeholders in the text (domain <code>AXDEV</code>, service account <code>aos</code>).</p>

**This guide covers the following steps:**

1. [Access the server and create a VHD](#step-1--access-the-server-and-create-a-vhd)
2. [Set up a new virtual machine](#step-2--set-up-a-new-virtual-machine)
3. [Install Windows Server 2016 from scratch](#step-3--install-windows-server-2016-from-scratch)
4. [Change the machine name and reset the passwords](#step-4--change-the-machine-name-and-reset-the-passwords)
5. [Set up the network](#step-5--set-up-the-network)
6. [Install the latest updates](#step-6--install-the-latest-updates)
7. [Install Active Directory on the server](#step-7--install-active-directory-on-the-server)
8. [Copy the AX installation setup](#step-8--copy-the-ax-installation-setup)
9. [Install Chrome and Notepad++ and enable RDP](#step-9--install-chrome-and-notepad-and-enable-rdp)
10. [Configure Active Directory on the server](#step-10--configure-active-directory-on-the-server)
11. [Create the AOS user in Active Directory](#step-11--create-the-aos-user-in-active-directory)
12. [Install and configure SQL Server 2012](#step-12--install-and-configure-sql-server-2012)
13. [Install the prerequisites of Microsoft Dynamics AX 2012](#step-13--install-the-prerequisites-of-microsoft-dynamics-ax-2012)
14. [Install the database and Application Object Server (AOS)](#step-14--install-the-database-and-application-object-server-aos)
15. [Install Microsoft Visual Studio](#step-15--install-microsoft-visual-studio)
16. [Install the AX client and Visual Studio tools](#step-16--install-the-ax-client-and-visual-studio-tools)
17. [Microsoft Dynamics AX 2012 configuration](#step-17--microsoft-dynamics-ax-2012-configuration)
18. [Add the AOS user in Microsoft Dynamics AX 2012](#step-18--add-the-aos-user-in-microsoft-dynamics-ax-2012)

## Step 1 — Access the server and create a VHD

Connect to the Hyper-V server over RDP using its external address and your login credentials. On your local computer, press the Windows key, search for **Remote Desktop Connection** and open it.

<img src="{{ '/assets/img/guides/ax/001.png' | relative_url }}" alt="Screenshot" loading="lazy" width="784" height="332">

Enter the address of the server you want to access remotely.

<img src="{{ '/assets/img/guides/ax/002.png' | relative_url }}" alt="Screenshot" loading="lazy" width="412" height="253">

Click **Connect**. You'll be asked for the server's login credentials.

<img src="{{ '/assets/img/guides/ax/003.png' | relative_url }}" alt="Screenshot" loading="lazy" width="463" height="320">

Enter the credentials and click **OK**. You now have access to the server.

<img src="{{ '/assets/img/guides/ax/004.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1299" height="704">

Open **Hyper-V Manager**, right-click the server name → **New → Hard Disk**.

<img src="{{ '/assets/img/guides/ax/005.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1312" height="739">

The New Virtual Hard Disk Wizard opens.

<img src="{{ '/assets/img/guides/ax/006.png' | relative_url }}" alt="Screenshot" loading="lazy" width="747" height="567">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/007.png' | relative_url }}" alt="Screenshot" loading="lazy" width="757" height="561">

Select **VHD** and click **Next**.

<img src="{{ '/assets/img/guides/ax/008.png' | relative_url }}" alt="Screenshot" loading="lazy" width="717" height="543">

Name the VHD, select the path where you want to save it, then click **Next**.

<img src="{{ '/assets/img/guides/ax/009.png' | relative_url }}" alt="Screenshot" loading="lazy" width="711" height="542">

Create a **blank 250 GB** VHD and click **Next**.

<img src="{{ '/assets/img/guides/ax/010.png' | relative_url }}" alt="Screenshot" loading="lazy" width="712" height="543">

Click **Finish**.

<img src="{{ '/assets/img/guides/ax/011.png' | relative_url }}" alt="Screenshot" loading="lazy" width="710" height="539">

<img src="{{ '/assets/img/guides/ax/012.png' | relative_url }}" alt="Screenshot" loading="lazy" width="688" height="389">

Wait for it to complete. Your VHD is created.

## Step 2 — Set up a new virtual machine

Open **Hyper-V Manager**, right-click the server name → **New → Virtual Machine**.

<img src="{{ '/assets/img/guides/ax/013.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1286" height="731">

The wizard opens. Click **Next**.

<img src="{{ '/assets/img/guides/ax/014.png' | relative_url }}" alt="Screenshot" loading="lazy" width="712" height="543">

Type a name, change the location, and click **Next**.

<img src="{{ '/assets/img/guides/ax/015.png' | relative_url }}" alt="Screenshot" loading="lazy" width="715" height="548">

Select **Generation 1** and click **Next**.

<img src="{{ '/assets/img/guides/ax/016.png' | relative_url }}" alt="Screenshot" loading="lazy" width="713" height="539">

Assign **16 GB** of RAM and click **Next**.

<img src="{{ '/assets/img/guides/ax/017.png' | relative_url }}" alt="Screenshot" loading="lazy" width="717" height="547">

Select the virtual switch: **NAT switch**.

<img src="{{ '/assets/img/guides/ax/018.png' | relative_url }}" alt="Screenshot" loading="lazy" width="711" height="539">

Browse to the VHD you created earlier.

<img src="{{ '/assets/img/guides/ax/019.png' | relative_url }}" alt="Screenshot" loading="lazy" width="715" height="541">

Click **Finish**.

<img src="{{ '/assets/img/guides/ax/020.png' | relative_url }}" alt="Screenshot" loading="lazy" width="712" height="540">

Right-click the VM and click **Settings**.

<img src="{{ '/assets/img/guides/ax/021.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1284" height="731">

Assign **4 virtual processors**.

<img src="{{ '/assets/img/guides/ax/022.png' | relative_url }}" alt="Screenshot" loading="lazy" width="733" height="698">

Select the Windows Server ISO for the DVD drive.

<img src="{{ '/assets/img/guides/ax/023.png' | relative_url }}" alt="Screenshot" loading="lazy" width="733" height="700">

Under **Integration Services**, untick **Backup** and tick **Guest services**.

<img src="{{ '/assets/img/guides/ax/024.png' | relative_url }}" alt="Screenshot" loading="lazy" width="731" height="698">

Under **Checkpoints**, untick **Enable checkpoints**.

<img src="{{ '/assets/img/guides/ax/025.png' | relative_url }}" alt="Screenshot" loading="lazy" width="730" height="698">

## Step 3 — Install Windows Server 2016 from scratch

Start the VM.

<img src="{{ '/assets/img/guides/ax/026.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1284" height="730">

Connect to the VM. Boot from the image, and the Windows Server installation setup appears. Click **Next**.

<img src="{{ '/assets/img/guides/ax/027.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1032" height="856">

During installation select **Windows Server 2016 Datacenter (Desktop Experience)** and click **Next**.

<img src="{{ '/assets/img/guides/ax/028.png' | relative_url }}" alt="Screenshot" loading="lazy" width="652" height="495">

Wait for the installation to finish, then set a **temporary password** for the Administrator account.

> This is a temporary password. Change the Administrator password, create a new user for RDP, and disable the built-in Administrator account (step 4).

When installation is done, sign in with the temporary password.

<img src="{{ '/assets/img/guides/ax/029.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1036" height="791">

First of all, change the computer name according to your naming convention.

## Step 4 — Change the machine name and reset the passwords

Change the computer name.

<img src="{{ '/assets/img/guides/ax/030.png' | relative_url }}" alt="Screenshot" loading="lazy" width="415" height="485">

Reset the password for the Administrator and create another user. When you create the user, disable the Administrator account. Always generate passwords and usernames in, and store them in, the team password manager (KeePass).

## Step 5 — Set up the network

Now configure the network settings. Press **Windows + R**, type `ncpa.cpl` and click **OK**.

<img src="{{ '/assets/img/guides/ax/031.png' | relative_url }}" alt="Screenshot" loading="lazy" width="429" height="240">

The network connection shows as an unidentified network.

<img src="{{ '/assets/img/guides/ax/032.png' | relative_url }}" alt="Screenshot" loading="lazy" width="806" height="317">

Right-click the adapter and select **Properties**.

<img src="{{ '/assets/img/guides/ax/033.png' | relative_url }}" alt="Screenshot" loading="lazy" width="796" height="598">

Double-click **Internet Protocol Version 4 (TCP/IPv4)**.

<img src="{{ '/assets/img/guides/ax/034.png' | relative_url }}" alt="Screenshot" loading="lazy" width="804" height="610">

Enter the IP addresses according to your requirements (an address in the NAT switch's range, its gateway and DNS) and click **OK**.

<img src="{{ '/assets/img/guides/ax/035.png' | relative_url }}" alt="Screenshot" loading="lazy" width="808" height="628">

The VM is now connected to the network and can reach the internet.

<img src="{{ '/assets/img/guides/ax/036.png' | relative_url }}" alt="Screenshot" loading="lazy" width="444" height="198">

## Step 6 — Install the latest updates

The Windows Server needs to be on the latest updates for this build. Click **Start** and type **Check for updates**.

<img src="{{ '/assets/img/guides/ax/037.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1061" height="804">

In this window, click **Check for updates**.

<img src="{{ '/assets/img/guides/ax/038.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1039" height="304">

Make sure the system has all the latest updates installed.

<img src="{{ '/assets/img/guides/ax/039.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1036" height="825">

## Step 7 — Install Active Directory on the server

Click **Start** and select **Server Manager**.

<img src="{{ '/assets/img/guides/ax/040.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1047" height="785">

In Server Manager, click **Manage** and select **Add Roles and Features**.

<img src="{{ '/assets/img/guides/ax/041.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1051" height="328">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/042.png' | relative_url }}" alt="Screenshot" loading="lazy" width="798" height="571">

Select **Role-based or feature-based installation** and click **Next**.

<img src="{{ '/assets/img/guides/ax/043.png' | relative_url }}" alt="Screenshot" loading="lazy" width="794" height="570">

Select the server and click **Next**.

<img src="{{ '/assets/img/guides/ax/044.png' | relative_url }}" alt="Screenshot" loading="lazy" width="799" height="573">

Select **Active Directory Domain Services**, and in the pop-up click **Add Features**.

<img src="{{ '/assets/img/guides/ax/045.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1037" height="751">

Active Directory is now ticked. Click **Next**.

<img src="{{ '/assets/img/guides/ax/046.png' | relative_url }}" alt="Screenshot" loading="lazy" width="801" height="575">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/047.png' | relative_url }}" alt="Screenshot" loading="lazy" width="795" height="570">

Untick the automatic restart check box and click **Install**.

<img src="{{ '/assets/img/guides/ax/048.png' | relative_url }}" alt="Screenshot" loading="lazy" width="796" height="570">

> We'll restart it manually.

Wait while Active Directory installs.

<img src="{{ '/assets/img/guides/ax/049.png' | relative_url }}" alt="Screenshot" loading="lazy" width="797" height="573">

> After AD is installed, restart the computer manually. It takes some time for the system to get ready.

<img src="{{ '/assets/img/guides/ax/050.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1047" height="798">

## Step 8 — Copy the AX installation setup

The installation files are kept on an access-controlled share, available only to authorised users. Press **Windows + R**, paste the share path (for example `\\<file-server>\Installation Software`) and press **Enter**.

<img src="{{ '/assets/img/guides/ax/051.png' | relative_url }}" alt="Screenshot" loading="lazy" width="682" height="352">

Copy the files to your machine.

<img src="{{ '/assets/img/guides/ax/052.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1025" height="778">

Copy everything and paste it into **C:\Temp**.

Go back to the network folder again.

<img src="{{ '/assets/img/guides/ax/053.png' | relative_url }}" alt="Screenshot" loading="lazy" width="809" height="322">

<img src="{{ '/assets/img/guides/ax/054.png' | relative_url }}" alt="Screenshot" loading="lazy" width="808" height="462">

Copy everything and paste it into **C:\Temp**.

## Step 9 — Install Chrome and Notepad++ and enable RDP

Install Chrome and Notepad++. Once done, enable RDP on the machine so users can reach it remotely. Click **Start**, type **This PC**, right-click it and select **Properties**.

<img src="{{ '/assets/img/guides/ax/055.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1051" height="795">

Click **Remote settings**.

<img src="{{ '/assets/img/guides/ax/056.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1035" height="778">

Select **Allow remote connections to this computer**, then click **Apply** and **OK**.

<img src="{{ '/assets/img/guides/ax/057.png' | relative_url }}" alt="Screenshot" loading="lazy" width="426" height="499">

## Step 10 — Configure Active Directory on the server

Now promote the server to a domain controller. Open **Server Manager**.

<img src="{{ '/assets/img/guides/ax/058.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1060" height="796">

Click the **flag** icon and click **Promote this server to a domain controller** (post-deployment configuration).

<img src="{{ '/assets/img/guides/ax/059.png' | relative_url }}" alt="Screenshot" loading="lazy" width="800" height="327">

The configuration wizard opens.

<img src="{{ '/assets/img/guides/ax/060.png' | relative_url }}" alt="Screenshot" loading="lazy" width="771" height="569">

Click **Add a new forest**, type the root domain name as requested and click **Next**.

<img src="{{ '/assets/img/guides/ax/061.png' | relative_url }}" alt="Screenshot" loading="lazy" width="768" height="569">

Set the Directory Services Restore Mode (DSRM) password and click **Next**.

<img src="{{ '/assets/img/guides/ax/062.png' | relative_url }}" alt="Screenshot" loading="lazy" width="773" height="569">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/063.png' | relative_url }}" alt="Screenshot" loading="lazy" width="774" height="570">

The NetBIOS name is set automatically. Click **Next**.

<img src="{{ '/assets/img/guides/ax/064.png' | relative_url }}" alt="Screenshot" loading="lazy" width="766" height="564">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/065.png' | relative_url }}" alt="Screenshot" loading="lazy" width="768" height="567">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/066.png' | relative_url }}" alt="Screenshot" loading="lazy" width="765" height="565">

Make sure there are no errors and click **Install**.

<img src="{{ '/assets/img/guides/ax/067.png' | relative_url }}" alt="Screenshot" loading="lazy" width="772" height="567">

When installation has completed, restart the machine.

## Step 11 — Create the AOS user in Active Directory

Now create a user (`aos`) in Active Directory. Open **Run**, type `dsa.msc` and click **OK**.

<img src="{{ '/assets/img/guides/ax/068.png' | relative_url }}" alt="Screenshot" loading="lazy" width="432" height="250">

Select the Active Directory forest and expand it.

<img src="{{ '/assets/img/guides/ax/069.png' | relative_url }}" alt="Screenshot" loading="lazy" width="955" height="651">

Right-click the **Users** folder and click **New → User**.

<img src="{{ '/assets/img/guides/ax/070.png' | relative_url }}" alt="Screenshot" loading="lazy" width="958" height="651">

In the dialog box set **First name** = `aos` and **User logon name** = `aos`. Click **Next**.

<img src="{{ '/assets/img/guides/ax/071.png' | relative_url }}" alt="Screenshot" loading="lazy" width="447" height="388">

Set a password for the `aos` user as per the instructions, tick **Password never expires**, and click **Next**.

<img src="{{ '/assets/img/guides/ax/072.png' | relative_url }}" alt="Screenshot" loading="lazy" width="445" height="387">

The `aos` user now appears under Users. Double-click it.

<img src="{{ '/assets/img/guides/ax/073.png' | relative_url }}" alt="Screenshot" loading="lazy" width="961" height="656">

Click **Member Of**.

<img src="{{ '/assets/img/guides/ax/074.png' | relative_url }}" alt="Screenshot" loading="lazy" width="426" height="549">

Click **Add**.

<img src="{{ '/assets/img/guides/ax/075.png' | relative_url }}" alt="Screenshot" loading="lazy" width="419" height="548">

Add the user to the following groups, then click **OK**: **Administrators**, **Domain Admins**, **Enterprise Admins**, **Domain Controllers**.

<img src="{{ '/assets/img/guides/ax/076.png' | relative_url }}" alt="Screenshot" loading="lazy" width="488" height="552">

Click **Apply** and then **OK**.

<img src="{{ '/assets/img/guides/ax/077.png' | relative_url }}" alt="Screenshot" loading="lazy" width="436" height="559">

> This level of privilege is only acceptable on an isolated, single-box development VM. In UAT or production, the AOS account should be a normal domain user.

## Step 12 — Install and configure SQL Server 2012

To install SQL Server, open the tools folder → **AX Installation → SQL** and double-click it.

<img src="{{ '/assets/img/guides/ax/078.png' | relative_url }}" alt="Screenshot" loading="lazy" width="986" height="837">

Click **Open**.

<img src="{{ '/assets/img/guides/ax/079.png' | relative_url }}" alt="Screenshot" loading="lazy" width="476" height="356">

Double-click the **Setup** icon.

<img src="{{ '/assets/img/guides/ax/080.png' | relative_url }}" alt="Screenshot" loading="lazy" width="799" height="606">

Click **Run**.

<img src="{{ '/assets/img/guides/ax/081.png' | relative_url }}" alt="Screenshot" loading="lazy" width="476" height="336">

The installation starts up.

<img src="{{ '/assets/img/guides/ax/082.png' | relative_url }}" alt="Screenshot" loading="lazy" width="508" height="143">

In **SQL Server Installation Center**, click **Installation** on the left.

<img src="{{ '/assets/img/guides/ax/083.png' | relative_url }}" alt="Screenshot" loading="lazy" width="796" height="601">

In the Installation menu, click **New SQL Server stand-alone installation**.

<img src="{{ '/assets/img/guides/ax/084.png' | relative_url }}" alt="Screenshot" loading="lazy" width="796" height="605">

Click **Run**.

<img src="{{ '/assets/img/guides/ax/085.png' | relative_url }}" alt="Screenshot" loading="lazy" width="473" height="331">

Setup starts and runs a quick check before installation. Click **OK** if all the checks pass.

<img src="{{ '/assets/img/guides/ax/086.png' | relative_url }}" alt="Screenshot" loading="lazy" width="813" height="618">

Select the **Evaluation** edition and click **Next**.

<img src="{{ '/assets/img/guides/ax/087.png' | relative_url }}" alt="Screenshot" loading="lazy" width="814" height="617">

Accept the licence agreement and click **Next**.

<img src="{{ '/assets/img/guides/ax/088.png' | relative_url }}" alt="Screenshot" loading="lazy" width="817" height="617">

Wait for it to complete.

<img src="{{ '/assets/img/guides/ax/089.png' | relative_url }}" alt="Screenshot" loading="lazy" width="815" height="617">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/090.png' | relative_url }}" alt="Screenshot" loading="lazy" width="813" height="620">

Select **SQL Server Feature Installation** and click **Next**.

<img src="{{ '/assets/img/guides/ax/091.png' | relative_url }}" alt="Screenshot" loading="lazy" width="815" height="618">

Select the following check boxes and click **Next**.

<img src="{{ '/assets/img/guides/ax/092.png' | relative_url }}" alt="Screenshot" loading="lazy" width="831" height="879">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/093.png' | relative_url }}" alt="Screenshot" loading="lazy" width="833" height="883">

Select **Default instance** and click **Next**.

<img src="{{ '/assets/img/guides/ax/094.png' | relative_url }}" alt="Screenshot" loading="lazy" width="834" height="882">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/095.png' | relative_url }}" alt="Screenshot" loading="lazy" width="831" height="878">

For **SQL Server Analysis Services**, add the AOS user with its domain name and password: account name `AXDEV\aos`.

<img src="{{ '/assets/img/guides/ax/096.png' | relative_url }}" alt="Screenshot" loading="lazy" width="839" height="885">

Click the **Add Current User** button.

<img src="{{ '/assets/img/guides/ax/097.png' | relative_url }}" alt="Screenshot" loading="lazy" width="835" height="881">

The user is added. Click **Next**.

<img src="{{ '/assets/img/guides/ax/098.png' | relative_url }}" alt="Screenshot" loading="lazy" width="831" height="880">

In **Analysis Services Configuration**, click **Add Current User**.

<img src="{{ '/assets/img/guides/ax/099.png' | relative_url }}" alt="Screenshot" loading="lazy" width="833" height="882">

The user is added. Click **Next**.

<img src="{{ '/assets/img/guides/ax/100.png' | relative_url }}" alt="Screenshot" loading="lazy" width="833" height="880">

In **Reporting Services Configuration**, select **Install and configure** and click **Next**.

<img src="{{ '/assets/img/guides/ax/101.png' | relative_url }}" alt="Screenshot" loading="lazy" width="835" height="882">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/102.png' | relative_url }}" alt="Screenshot" loading="lazy" width="836" height="882">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/103.png' | relative_url }}" alt="Screenshot" loading="lazy" width="833" height="874">

On **Ready to Install**, click **Install**.

<img src="{{ '/assets/img/guides/ax/104.png' | relative_url }}" alt="Screenshot" loading="lazy" width="833" height="884">

The installation starts and takes some time to complete.

<img src="{{ '/assets/img/guides/ax/105.png' | relative_url }}" alt="Screenshot" loading="lazy" width="835" height="881">

When it finishes you'll see the Complete page. You can close it now.

<img src="{{ '/assets/img/guides/ax/106.png' | relative_url }}" alt="Screenshot" loading="lazy" width="833" height="881">

Now restart the machine.

After the restart, add the AOS user to SQL Server and make it a sysadmin. Click **Start**, type **SSMS** and run it as administrator.

<img src="{{ '/assets/img/guides/ax/107.png' | relative_url }}" alt="Screenshot" loading="lazy" width="525" height="707">

Click **Connect**.

<img src="{{ '/assets/img/guides/ax/108.png' | relative_url }}" alt="Screenshot" loading="lazy" width="650" height="506">

Under the SQL Server instance, expand **Security**, right-click **Logins** and select **New Login**.

<img src="{{ '/assets/img/guides/ax/109.png' | relative_url }}" alt="Screenshot" loading="lazy" width="333" height="438">

In the **Login – New** window, click **Search**.

<img src="{{ '/assets/img/guides/ax/110.png' | relative_url }}" alt="Screenshot" loading="lazy" width="700" height="632">

Add the AOS user and click **OK**.

<img src="{{ '/assets/img/guides/ax/111.png' | relative_url }}" alt="Screenshot" loading="lazy" width="716" height="650">

After adding the AOS user, click **Server Roles**.

<img src="{{ '/assets/img/guides/ax/112.png' | relative_url }}" alt="Screenshot" loading="lazy" width="699" height="634">

Under **Server roles**, tick **sysadmin** and click **OK**.

<img src="{{ '/assets/img/guides/ax/113.png' | relative_url }}" alt="Screenshot" loading="lazy" width="700" height="635">

Click **File → Exit**.

<img src="{{ '/assets/img/guides/ax/114.png' | relative_url }}" alt="Screenshot" loading="lazy" width="364" height="499">

## Step 13 — Install the prerequisites of Microsoft Dynamics AX 2012

Install the prerequisites for the AOS. Open the **PreReqs** folder and install each one in turn.

<img src="{{ '/assets/img/guides/ax/115.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1138" height="644">

Install all of these one by one:

<img src="{{ '/assets/img/guides/ax/116.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1134" height="645">

**1. Microsoft Access Database Engine**

<img src="{{ '/assets/img/guides/ax/117.png' | relative_url }}" alt="Screenshot" loading="lazy" width="521" height="454">

<img src="{{ '/assets/img/guides/ax/118.png' | relative_url }}" alt="Screenshot" loading="lazy" width="409" height="218">

**2. Microsoft Access Runtime 2013**

<img src="{{ '/assets/img/guides/ax/119.png' | relative_url }}" alt="Screenshot" loading="lazy" width="621" height="508">

<img src="{{ '/assets/img/guides/ax/120.png' | relative_url }}" alt="Screenshot" loading="lazy" width="622" height="508">

**3. Microsoft Chart Controls**

<img src="{{ '/assets/img/guides/ax/121.png' | relative_url }}" alt="Screenshot" loading="lazy" width="505" height="476">

<img src="{{ '/assets/img/guides/ax/122.png' | relative_url }}" alt="Screenshot" loading="lazy" width="507" height="476">

<img src="{{ '/assets/img/guides/ax/123.png' | relative_url }}" alt="Screenshot" loading="lazy" width="509" height="475">

**4. Microsoft SQL Server Analysis Management Objects**

<img src="{{ '/assets/img/guides/ax/124.png' | relative_url }}" alt="Screenshot" loading="lazy" width="506" height="388">

<img src="{{ '/assets/img/guides/ax/125.png' | relative_url }}" alt="Screenshot" loading="lazy" width="507" height="389">

<img src="{{ '/assets/img/guides/ax/126.png' | relative_url }}" alt="Screenshot" loading="lazy" width="511" height="390">

<img src="{{ '/assets/img/guides/ax/127.png' | relative_url }}" alt="Screenshot" loading="lazy" width="508" height="389">

## Step 14 — Install the database and Application Object Server (AOS)

Open the `AX2012_InstallSlipstreamed` folder.

<img src="{{ '/assets/img/guides/ax/128.png' | relative_url }}" alt="Screenshot" loading="lazy" width="855" height="641">

Double-click the **Autorun** file.

<img src="{{ '/assets/img/guides/ax/129.png' | relative_url }}" alt="Screenshot" loading="lazy" width="860" height="644">

The Microsoft Dynamics AX 2012 installation window opens. Click **Install**.

<img src="{{ '/assets/img/guides/ax/130.png' | relative_url }}" alt="Screenshot" loading="lazy" width="642" height="522">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/131.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="702">

Accept the licence agreement and click **Next**.

<img src="{{ '/assets/img/guides/ax/132.png' | relative_url }}" alt="Screenshot" loading="lazy" width="736" height="703">

Accept the licence agreement and click **Next**.

<img src="{{ '/assets/img/guides/ax/133.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="704">

Select **I don't want to join the program at this time** and click **Next**.

<img src="{{ '/assets/img/guides/ax/134.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="702">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/135.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="704">

Click **Install**.

<img src="{{ '/assets/img/guides/ax/136.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="702">

<img src="{{ '/assets/img/guides/ax/137.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="702">

Wait for it to complete.

<img src="{{ '/assets/img/guides/ax/138.png' | relative_url }}" alt="Screenshot" loading="lazy" width="740" height="702">

Select **Microsoft Dynamics AX** and click **Next**.

<img src="{{ '/assets/img/guides/ax/139.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="705">

Select **Custom installation** and click **Next**.

<img src="{{ '/assets/img/guides/ax/140.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="702">

Select **Databases** and **Application Object Server (AOS)**, then click **Next**.

<img src="{{ '/assets/img/guides/ax/141.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="701">

If you see this screen, these tools must be installed before the AX database and AOS.

<img src="{{ '/assets/img/guides/ax/142.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="705">

Tick all the **Configure** check boxes and click **Configure**.

<img src="{{ '/assets/img/guides/ax/143.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="701">

Click **Start**.

<img src="{{ '/assets/img/guides/ax/144.png' | relative_url }}" alt="Screenshot" loading="lazy" width="638" height="372">

When installation completes, click **Close**.

<img src="{{ '/assets/img/guides/ax/145.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="705">

There are now no errors. Click **Next**.

<img src="{{ '/assets/img/guides/ax/146.png' | relative_url }}" alt="Screenshot" loading="lazy" width="736" height="701">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/147.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="704">

Select **Create new database** and click **Next**.

<img src="{{ '/assets/img/guides/ax/148.png' | relative_url }}" alt="Screenshot" loading="lazy" width="736" height="703">

Select the server name from the drop-down and click **Next**.

<img src="{{ '/assets/img/guides/ax/149.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="704">

Tick **Foundation Labels** and **Foundation Upgrade**, then click **Next**.

<img src="{{ '/assets/img/guides/ax/150.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="705">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/151.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="706">

Select **Use the following account** and enter the domain account: `AXDEV\aos` and its password. Click **Next**.

<img src="{{ '/assets/img/guides/ax/152.png' | relative_url }}" alt="Screenshot" loading="lazy" width="741" height="707">

If there are no errors, click **Next**.

<img src="{{ '/assets/img/guides/ax/153.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="705">

Click **Install**.

<img src="{{ '/assets/img/guides/ax/154.png' | relative_url }}" alt="Screenshot" loading="lazy" width="741" height="703">

The installation starts. Wait until it has completed.

<img src="{{ '/assets/img/guides/ax/155.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="706">

Installation completed successfully. Click **Finish**.

<img src="{{ '/assets/img/guides/ax/156.png' | relative_url }}" alt="Screenshot" loading="lazy" width="740" height="705">

After you click Finish, a web page opens showing that the database and AOS were installed successfully.

<img src="{{ '/assets/img/guides/ax/157.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1192" height="675">

## Step 15 — Install Microsoft Visual Studio

Open the **Temp** folder and double-click `EN_Visual_Studio_Professional_2013`.

<img src="{{ '/assets/img/guides/ax/158.png' | relative_url }}" alt="Screenshot" loading="lazy" width="858" height="644">

Double-click the `vs_professional` application.

<img src="{{ '/assets/img/guides/ax/159.png' | relative_url }}" alt="Screenshot" loading="lazy" width="861" height="641">

Accept the licence agreement and click **Next**.

<img src="{{ '/assets/img/guides/ax/160.png' | relative_url }}" alt="Screenshot" loading="lazy" width="471" height="657">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/161.png' | relative_url }}" alt="Screenshot" loading="lazy" width="469" height="653">

Wait until installation completes.

<img src="{{ '/assets/img/guides/ax/162.png' | relative_url }}" alt="Screenshot" loading="lazy" width="468" height="652">

After installation, click **Restart Now**.

<img src="{{ '/assets/img/guides/ax/163.png' | relative_url }}" alt="Screenshot" loading="lazy" width="473" height="659">

Restart the machine.

## Step 16 — Install the AX client and Visual Studio tools

Open the **Temp** folder and open the `AX2012_InstallSlipstreamed` folder.

<img src="{{ '/assets/img/guides/ax/164.png' | relative_url }}" alt="Screenshot" loading="lazy" width="858" height="644">

Double-click the **Autorun** file.

<img src="{{ '/assets/img/guides/ax/165.png' | relative_url }}" alt="Screenshot" loading="lazy" width="859" height="645">

Click **Run**.

<img src="{{ '/assets/img/guides/ax/166.png' | relative_url }}" alt="Screenshot" loading="lazy" width="472" height="351">

Click **Run** again.

<img src="{{ '/assets/img/guides/ax/167.png' | relative_url }}" alt="Screenshot" loading="lazy" width="472" height="350">

The Microsoft Dynamics AX 2012 installation window opens. Click **Install**.

<img src="{{ '/assets/img/guides/ax/168.png' | relative_url }}" alt="Screenshot" loading="lazy" width="644" height="522">

Click **Run**.

<img src="{{ '/assets/img/guides/ax/169.png' | relative_url }}" alt="Screenshot" loading="lazy" width="473" height="352">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/170.png' | relative_url }}" alt="Screenshot" loading="lazy" width="742" height="704">

Accept the licence agreement and click **Next**.

<img src="{{ '/assets/img/guides/ax/171.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="704">

Setup searches for updates. Wait.

<img src="{{ '/assets/img/guides/ax/172.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="704">

Select **Add or modify components** and click **Next**.

<img src="{{ '/assets/img/guides/ax/173.png' | relative_url }}" alt="Screenshot" loading="lazy" width="740" height="706">

Select the following check boxes and click **Next**.

<img src="{{ '/assets/img/guides/ax/174.png' | relative_url }}" alt="Screenshot" loading="lazy" width="740" height="705">

If you see any warnings, tick the **Configure** check box and click **Configure**.

<img src="{{ '/assets/img/guides/ax/175.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="707">

Click **Start**.

<img src="{{ '/assets/img/guides/ax/176.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="708">

When installation completes, click **Close**.

<img src="{{ '/assets/img/guides/ax/177.png' | relative_url }}" alt="Screenshot" loading="lazy" width="636" height="365">

There are now no errors. Click **Next**.

<img src="{{ '/assets/img/guides/ax/178.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="704">

Select **Language = English (United States)** and **Installation type = Administrator**, then click **Next**.

<img src="{{ '/assets/img/guides/ax/179.png' | relative_url }}" alt="Screenshot" loading="lazy" width="740" height="705">

Select **Save configuration in the registry** and click **Next**.

<img src="{{ '/assets/img/guides/ax/180.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="704">

Click **Next**.

<img src="{{ '/assets/img/guides/ax/181.png' | relative_url }}" alt="Screenshot" loading="lazy" width="738" height="703">

Add the domain user you created earlier, with the domain name (`AXDEV\aos`).

<img src="{{ '/assets/img/guides/ax/182.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="706">

Add the same domain user again and click **Next**.

<img src="{{ '/assets/img/guides/ax/183.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="703">

Type the machine name and click **Next**.

<img src="{{ '/assets/img/guides/ax/184.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="704">

No errors found. Click **Next**.

<img src="{{ '/assets/img/guides/ax/185.png' | relative_url }}" alt="Screenshot" loading="lazy" width="736" height="701">

Click **Install**.

<img src="{{ '/assets/img/guides/ax/186.png' | relative_url }}" alt="Screenshot" loading="lazy" width="739" height="703">

Wait until installation completes.

<img src="{{ '/assets/img/guides/ax/187.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="703">

It takes some time to complete.

<img src="{{ '/assets/img/guides/ax/188.png' | relative_url }}" alt="Screenshot" loading="lazy" width="740" height="703">

Installation is complete. Click **Finish**.

<img src="{{ '/assets/img/guides/ax/189.png' | relative_url }}" alt="Screenshot" loading="lazy" width="737" height="702">

> Restart the machine after installation completes.

## Step 17 — Microsoft Dynamics AX 2012 configuration

After installation, Microsoft Dynamics AX 2012 appears on the desktop. Right-click it and choose **Run as administrator**.

<img src="{{ '/assets/img/guides/ax/190.png' | relative_url }}" alt="Screenshot" loading="lazy" width="385" height="532">

The AX 2012 configuration window opens.

<img src="{{ '/assets/img/guides/ax/191.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1400" height="898">

In the **Initialization checklist** you'll see Lifecycle Services and Customer feedback options. Complete them one by one to finish the configuration.

<img src="{{ '/assets/img/guides/ax/192.png' | relative_url }}" alt="Screenshot" loading="lazy" width="628" height="480">

Click **Lifecycle Services** (takes about a minute). Then click **Customer feedback options**, select **I don't want to join the program at this time** and click **OK**.

<img src="{{ '/assets/img/guides/ax/193.png' | relative_url }}" alt="Screenshot" loading="lazy" width="568" height="368">

When they're done, both items show a green tick and you can move on to the next step, **Compile**.

<img src="{{ '/assets/img/guides/ax/194.png' | relative_url }}" alt="Screenshot" loading="lazy" width="626" height="466">

Under **Compile**, click **Compile application**.

<img src="{{ '/assets/img/guides/ax/195.png' | relative_url }}" alt="Screenshot" loading="lazy" width="635" height="502">

This takes a long time. Click **Yes** and wait for it to complete.

<img src="{{ '/assets/img/guides/ax/196.png' | relative_url }}" alt="Screenshot" loading="lazy" width="421" height="181">

It takes around **3 hours**.

<img src="{{ '/assets/img/guides/ax/197.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1196" height="1034">

When it's done, **Compile application** shows a green tick. Move on to **Compile into .NET Framework CIL**.

<img src="{{ '/assets/img/guides/ax/198.png' | relative_url }}" alt="Screenshot" loading="lazy" width="401" height="479">

Under **Compile**, click **Compile into .NET Framework CIL**.

<img src="{{ '/assets/img/guides/ax/199.png' | relative_url }}" alt="Screenshot" loading="lazy" width="404" height="447">

This also takes a long time. Click **Yes** and wait for it to complete.

<img src="{{ '/assets/img/guides/ax/200.png' | relative_url }}" alt="Screenshot" loading="lazy" width="484" height="165">

It takes around **2 hours**. When it's done, both items are complete. Move on to the next step.

<img src="{{ '/assets/img/guides/ax/201.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1359" height="1043">

Under **Activate application functionality**, click **Provide license information**.

<img src="{{ '/assets/img/guides/ax/202.png' | relative_url }}" alt="Screenshot" loading="lazy" width="400" height="368">

The License information window opens. Click **Load license file**.

<img src="{{ '/assets/img/guides/ax/203.png' | relative_url }}" alt="Screenshot" loading="lazy" width="684" height="459">

A new window opens. Click the small **Browse** button.

<img src="{{ '/assets/img/guides/ax/204.png' | relative_url }}" alt="Screenshot" loading="lazy" width="378" height="210">

Locate the licence file in `C:\Temp\AX Installation\` and click **Open**.

<img src="{{ '/assets/img/guides/ax/205.png' | relative_url }}" alt="Screenshot" loading="lazy" width="954" height="542">

The file path is updated. Click **OK**.

<img src="{{ '/assets/img/guides/ax/206.png' | relative_url }}" alt="Screenshot" loading="lazy" width="378" height="209">

The licence holder name and licence expiry date are shown (serial details blurred).

<img src="{{ '/assets/img/guides/ax/207.png' | relative_url }}" alt="Screenshot" loading="lazy" width="686" height="462">

Click **Close**. The licence is attached.

<img src="{{ '/assets/img/guides/ax/208.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1400" height="1005">

The task shows as complete. Move on to **Configure application functionality**.

<img src="{{ '/assets/img/guides/ax/209.png' | relative_url }}" alt="Screenshot" loading="lazy" width="403" height="371">

Under **Activate application functionality**, click **Configure application functionality**.

In the License configuration window, just click **OK**.

<img src="{{ '/assets/img/guides/ax/210.png' | relative_url }}" alt="Screenshot" loading="lazy" width="464" height="577">

Both tasks are now complete.

<img src="{{ '/assets/img/guides/ax/211.png' | relative_url }}" alt="Screenshot" loading="lazy" width="402" height="364">

Move on to **Configure data**. Under **Configure data**, click **Modify data types**.

<img src="{{ '/assets/img/guides/ax/212.png' | relative_url }}" alt="Screenshot" loading="lazy" width="403" height="361">

In the Modify data types window, don't change anything. Click **OK**.

<img src="{{ '/assets/img/guides/ax/213.png' | relative_url }}" alt="Screenshot" loading="lazy" width="524" height="390">

Modify data types is complete. Move on to **Synchronize database (required)**.

<img src="{{ '/assets/img/guides/ax/214.png' | relative_url }}" alt="Screenshot" loading="lazy" width="406" height="364">

Click **Synchronize database (required)**.

Database synchronization is complete.

<img src="{{ '/assets/img/guides/ax/215.png' | relative_url }}" alt="Screenshot" loading="lazy" width="404" height="365">

Next, click **Create partitions**. The Partitions window opens. Don't change anything; close it.

<img src="{{ '/assets/img/guides/ax/216.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1077" height="751">

Every step under **Configure data** is now complete.

<img src="{{ '/assets/img/guides/ax/217.png' | relative_url }}" alt="Screenshot" loading="lazy" width="405" height="360">

Under **Configure accounts and profiles**, click **Initialize user profiles**.

<img src="{{ '/assets/img/guides/ax/218.png' | relative_url }}" alt="Screenshot" loading="lazy" width="402" height="368">

The Initialize user profiles window opens. Select all and click **OK**.

<img src="{{ '/assets/img/guides/ax/219.png' | relative_url }}" alt="Screenshot" loading="lazy" width="992" height="1079">

Initialize user profiles is complete. Move on to **Set up Application Integration Framework**.

<img src="{{ '/assets/img/guides/ax/220.png' | relative_url }}" alt="Screenshot" loading="lazy" width="404" height="365">

Under **Configure accounts and profiles**, click **Set up Application Integration Framework**.

<img src="{{ '/assets/img/guides/ax/221.png' | relative_url }}" alt="Screenshot" loading="lazy" width="404" height="365">

It takes around **20 minutes**.

<img src="{{ '/assets/img/guides/ax/222.png' | relative_url }}" alt="Screenshot" loading="lazy" width="404" height="362">

Under **Configure accounts and profiles**, click **Configure system accounts**. The System service accounts window opens. Keep everything as it is and click **OK**.

<img src="{{ '/assets/img/guides/ax/223.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1211" height="1002">

Every step under **Configure accounts and profiles** is now complete.

<img src="{{ '/assets/img/guides/ax/224.png' | relative_url }}" alt="Screenshot" loading="lazy" width="403" height="366">

Now complete the **Initialize partition** checklist.

<img src="{{ '/assets/img/guides/ax/225.png' | relative_url }}" alt="Screenshot" loading="lazy" width="407" height="499">

Under **Initialize partition**, click **Configure partition accounts**. The System service accounts window opens. Click **OK**.

<img src="{{ '/assets/img/guides/ax/226.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1233" height="1080">

Configure partition accounts is complete.

<img src="{{ '/assets/img/guides/ax/227.png' | relative_url }}" alt="Screenshot" loading="lazy" width="405" height="491">

Click **Create reference data**.

<img src="{{ '/assets/img/guides/ax/228.png' | relative_url }}" alt="Screenshot" loading="lazy" width="405" height="491">

Create reference data is complete.

<img src="{{ '/assets/img/guides/ax/229.png' | relative_url }}" alt="Screenshot" loading="lazy" width="404" height="495">

Click **Create legal entities**. The Legal entities window opens. Click **Close**.

<img src="{{ '/assets/img/guides/ax/230.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1389" height="1080">

Create legal entities is complete.

<img src="{{ '/assets/img/guides/ax/231.png' | relative_url }}" alt="Screenshot" loading="lazy" width="407" height="494">

Click **Set up system parameters**. The System parameters window opens. Set the system language to **en-us** and click **Close**.

<img src="{{ '/assets/img/guides/ax/232.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1344" height="1080">

Set up system parameters is complete. Move on to the next step.

<img src="{{ '/assets/img/guides/ax/233.png' | relative_url }}" alt="Screenshot" loading="lazy" width="407" height="463">

We don't need to import data, so mark it as complete by clicking **Mark as complete**.

<img src="{{ '/assets/img/guides/ax/234.png' | relative_url }}" alt="Screenshot" loading="lazy" width="396" height="490">

Every step under **Initialize partition** is now complete.

<img src="{{ '/assets/img/guides/ax/235.png' | relative_url }}" alt="Screenshot" loading="lazy" width="407" height="465">

Close Microsoft Dynamics AX 2012, then open it again from the desktop with **Run as administrator**.

<img src="{{ '/assets/img/guides/ax/236.png' | relative_url }}" alt="Screenshot" loading="lazy" width="385" height="532">

Microsoft Dynamics AX 2012 is now configured successfully.

<img src="{{ '/assets/img/guides/ax/237.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1014" height="758">

## Step 18 — Add the AOS user in Microsoft Dynamics AX 2012

The Microsoft Dynamics AX 2012 dashboard opens.

<img src="{{ '/assets/img/guides/ax/238.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1014" height="758">

Click the small drop-down button next to the **DAT** company in the address bar and click **System administration**.

<img src="{{ '/assets/img/guides/ax/239.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1227" height="821">

Click **Users**.

<img src="{{ '/assets/img/guides/ax/240.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1227" height="823">

The Users list page shows every user.

<img src="{{ '/assets/img/guides/ax/241.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1227" height="824">

Click the **User** button to create a new user.

<img src="{{ '/assets/img/guides/ax/242.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1227" height="408">

Add the AOS user you created earlier, then click **Assign roles**.

<img src="{{ '/assets/img/guides/ax/243.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1209" height="956">

In the **Assign roles to user** window, select **System administrator** and click **OK**.

<img src="{{ '/assets/img/guides/ax/244.png' | relative_url }}" alt="Screenshot" loading="lazy" width="612" height="636">

**System administrator** now appears under Roles. Click **Close**.

<img src="{{ '/assets/img/guides/ax/245.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1212" height="958">

The AOS user appears in the list. Close this window.

<img src="{{ '/assets/img/guides/ax/246.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1154" height="824">

The account is now added in Microsoft Dynamics AX 2012.

From the home dashboard, click the icon at the top (shown in the screenshot) and select **New Development Workspace**.

<img src="{{ '/assets/img/guides/ax/247.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1283" height="825">

The new development workspace opens.

<img src="{{ '/assets/img/guides/ax/248.png' | relative_url }}" alt="Screenshot" loading="lazy" width="1014" height="758">

If you can see this window, the installation is 100% successful.

## Security notes

- Dev VMs reached over the internet need proper RDP hygiene. See my [secure RDP guide]({% post_url 2026-10-05-secure-rdp-access-to-lab-vms %}).
- The over-privileged `aos` account is acceptable only on an isolated, single-purpose dev box. Document that exception so it doesn't creep into UAT or production.
- Licence files and installation media are licensed assets. Keep them on an access-controlled share.
