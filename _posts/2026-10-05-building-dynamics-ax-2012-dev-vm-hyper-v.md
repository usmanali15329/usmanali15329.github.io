---
title: "Building a Dynamics AX 2012 Development VM on Hyper-V, End to End"
date: 2026-10-05 10:00:00 +0200
category: guide
tags: [hyper-v, windows-server, active-directory, sql-server, dynamics-ax]
excerpt: "From a blank VHD to a compiled AX 2012 development workspace: Hyper-V, Windows Server 2016, a new AD forest, SQL Server 2012, AOS and client — with the gotchas that cost hours."
---
<p class="guide-credit">Written by Muhammad Usman Ali. This guide is based on the internal runbooks I followed and the AX 2012 VM deployments I carried out as Junior Infrastructure Administrator at Code Practitioners. Hostnames, domains, addresses and credentials have been replaced with placeholders.</p>

A Dynamics AX 2012 development box is a single, self-contained VM. It's its own domain controller, SQL Server, Application Object Server (AOS) and developer client. Building one from scratch touches most of a Windows infrastructure admin's day job, which is why I like it as a walkthrough.

## At a glance

| Item | Value used here |
|---|---|
| Hypervisor | Hyper-V on Windows Server |
| VM | Generation 1 · 4 vCPU · 16 GB RAM · 250 GB VHD |
| Guest OS | Windows Server 2016 Datacenter (Desktop Experience) |
| Domain | New forest, `axdev.local` (placeholder) |
| VM name | `AXDEV-VM01` (placeholder) |
| Service account | `AXDEV\svc-aos` |
| Database | SQL Server 2012 (Database Engine, SSAS, SSRS) |
| AX | AX 2012 slipstreamed media · Visual Studio 2013 Professional |

**Total time:** about a working day. Most of that is unattended, because the X++ compile alone runs about 3 hours and the CIL compile about 2.

## 1. Create the virtual disk and the VM

RDP to the Hyper-V host, then in **Hyper-V Manager**:

1. **New → Hard Disk** → format **VHD** → name it and pick the storage path → **blank, 250 GB**.
2. **New → Virtual Machine** → **Generation 1** → **16 GB** startup memory → connect to the host's **NAT switch** → **use existing virtual hard disk** (the one above).
3. Before first boot, open the VM's **Settings**:
   - **Processor:** 4 virtual processors
   - **DVD drive:** mount the Windows Server 2016 ISO
   - **Integration Services:** enable *Guest services*, disable *Backup (volume shadow copy)*
   - **Checkpoints:** untick *Enable checkpoints* (AX + SQL on differencing disks is slow and checkpoints get forgotten)

The same thing in PowerShell, which is how I'd do it today:

```powershell
New-VHD -Path 'D:\VMs\AXDEV-VM01\AXDEV-VM01.vhd' -SizeBytes 250GB -Dynamic
New-VM  -Name 'AXDEV-VM01' -Generation 1 -MemoryStartupBytes 16GB `
        -VHDPath 'D:\VMs\AXDEV-VM01\AXDEV-VM01.vhd' -SwitchName 'NAT-Switch'
Set-VMProcessor -VMName 'AXDEV-VM01' -Count 4
Set-VMDvdDrive  -VMName 'AXDEV-VM01' -Path 'D:\ISO\WindowsServer2016.iso'
Enable-VMIntegrationService  -VMName 'AXDEV-VM01' -Name 'Guest Service Interface'
Disable-VMIntegrationService -VMName 'AXDEV-VM01' -Name 'Backup'
Set-VM -Name 'AXDEV-VM01' -CheckpointType Disabled
```

## 2. Install and prepare Windows Server 2016

1. Start the VM, connect, boot from the ISO and choose **Datacenter (Desktop Experience)**.
2. Set a temporary Administrator password. Replace it immediately in the next step.
3. **Rename the computer** to the agreed naming convention.
4. **Create a named admin account**, then disable the built-in Administrator. All credentials are generated and stored in the team password manager, never typed from memory or shared in chat.
5. **Static IP:** `Win + R → ncpa.cpl` → adapter **Properties → IPv4**. Set an address from the NAT switch's range (for example `10.10.0.20/24`, gateway `10.10.0.1`). Point **DNS at the VM's own address** once it becomes a domain controller.
6. Run **Windows Update** until no updates are left, rebooting between rounds.
7. Install Chrome and Notepad++, and enable Remote Desktop (*System Properties → Remote → Allow*, with NLA).

## 3. Promote the VM to a domain controller

1. **Server Manager → Manage → Add Roles and Features** → role-based → this server → **Active Directory Domain Services** (accept the extra features). Untick automatic restart, install, then reboot manually.
2. Click the **flag icon → Promote this server to a domain controller** → **Add a new forest** → root domain `axdev.local`.
3. Set the DSRM password (into the password manager), accept the auto-generated NetBIOS name, let prerequisites pass, **Install**. The VM reboots.

```powershell
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSForest -DomainName 'axdev.local' -InstallDns
```

## 4. Create the AOS service account

In **Active Directory Users and Computers** (`dsa.msc`) → *Users* → **New → User**:

- Name / logon: `svc-aos`. Password from the vault, **Password never expires** ticked.
- **Member of:** Administrators, Domain Admins, Enterprise Admins.

This mirrors what the original dev runbook used, and it's convenient on a throwaway single-box dev VM. **Never do this in production:** there the AOS account should be a plain domain user with only the SQL and AX rights the installer grants it.

```powershell
New-ADUser -Name 'svc-aos' -SamAccountName 'svc-aos' -PasswordNeverExpires $true `
  -AccountPassword (Read-Host -AsSecureString 'Password') -Enabled $true
'Administrators','Domain Admins','Enterprise Admins' | ForEach-Object { Add-ADGroupMember $_ -Members 'svc-aos' }
```

## 5. Stage the installation media

Copy the AX installation share (SQL Server 2012 media, AX 2012 slipstreamed setup, prerequisites, Visual Studio 2013, license file) from the internal, access-controlled file share into `C:\Temp` on the VM. Running setup from local disk avoids the odd failures you get running it across the network.

## 6. Install SQL Server 2012

**SQL Server Installation Center → New SQL Server stand-alone installation**:

1. Let *Setup Support Rules* pass, choose the edition, accept the license.
2. **Feature selection:** Database Engine Services, Analysis Services, Reporting Services – Native, Full-Text Search, Management Tools – Complete.
3. **Default instance** (`MSSQLSERVER`).
4. **Service accounts:** run SSAS as `AXDEV\svc-aos`.
5. **Database Engine & Analysis Services:** *Add Current User* as administrator.
6. **Reporting Services:** *Install and configure*.
7. Install, then reboot.

Then make the AOS account a sysadmin in **SSMS** (run as administrator): *Security → Logins → New Login* → search `AXDEV\svc-aos` → **Server Roles: sysadmin**.

```sql
CREATE LOGIN [AXDEV\svc-aos] FROM WINDOWS;
ALTER SERVER ROLE sysadmin ADD MEMBER [AXDEV\svc-aos];
```

## 7. Install AX prerequisites

From the prerequisites folder, install in order:

1. Microsoft Access Database Engine
2. Microsoft Access Runtime 2013
3. Microsoft Chart Controls
4. SQL Server Analysis Management Objects

The AX setup's prerequisite validator will offer to install anything else that's missing (tick *Configure* → **Configure**).

## 8. Install the database and AOS

Run `setup.exe` from the slipstreamed folder → **Microsoft Dynamics AX components → Add or modify components** (Custom installation):

1. Select **Databases** and **Application Object Server (AOS)**.
2. Fix any prerequisite warnings with **Configure**, then re-validate until it's clean.
3. **Create new database** → pick the local SQL Server → include **Foundation Labels** and **Foundation Upgrade** models.
4. **AOS account:** *Use the following account* → `AXDEV\svc-aos`.
5. Install. When it finishes, the setup log page should show the database and AOS installed with no errors.

## 9. Visual Studio 2013, client and developer tools

1. Install **Visual Studio 2013 Professional** from `C:\Temp` and reboot.
2. Re-run AX setup → *Add or modify components* → **Client**, **Visual Studio Tools** (plus Debugger / Trace Parser if you need them).
3. Language **English (United States)**, installation type **Administrator**, *save configuration to the registry*.
4. Business Connector proxy and Visual Studio Tools both use `AXDEV\svc-aos`. AOS server name = this machine.
5. Install, then reboot.

## 10. Run the initialization checklist

Open the AX client **as administrator**. The *Initialization checklist* walks through the following:

| Section | Task | Notes |
|---|---|---|
| Initialize | Lifecycle Services · Customer feedback options | Opt out of the feedback program |
| Compile | **Compile application** | ~3 hours. Start it before lunch |
| Compile | **Compile into .NET Framework CIL** | ~2 hours |
| License | Provide license information → *Load license file* | Use your organisation's or partner's license file |
| License | Configure application functionality | Accept defaults |
| Configure data | Modify data types · **Synchronize database** · Create partition | Leave data types and partition at defaults |
| Accounts & profiles | Initialize user profiles · Set up AIF (~20 min) · Configure system accounts | Select all profiles |
| Initialize partition | Configure partition accounts · Create reference data · Legal entities · System parameters | System language `en-us`. Mark *Import data* complete if not needed |

Close and reopen the client (as administrator) to confirm it starts cleanly.

## 11. Grant the AOS account access and verify

1. **System administration → Users → New** → add `AXDEV\svc-aos` → **Assign roles → System administrator**.
2. From the client, open **New Development Workspace**. If the AOT loads, the build is done.

## Things that bit me

- **DNS before AD.** If the NIC's DNS doesn't point at the VM itself once it's a DC, domain logons and the AX installer's account lookups fail in confusing ways.
- **Run everything as administrator.** The AX client, SSMS and setup all behave differently without elevation, and the checklist fails silently on permissions.
- **Don't interrupt the compile.** A half-finished X++ compile leaves the AOT in a state that's faster to rebuild than to repair.
- **Checkpoints off.** A forgotten checkpoint on a 250 GB SQL VM fills a host's disk surprisingly quickly.

## Security notes

- Dev VMs reached over the internet need the same RDP hygiene as anything else. See my [secure RDP guide]({% post_url 2026-10-05-secure-rdp-access-to-lab-vms %}).
- The over-privileged `svc-aos` account is acceptable only because the VM is a single-purpose, isolated dev box. Document that exception rather than letting it creep into UAT or production builds.
- License files and installation media are licensed assets. Keep them on an access-controlled share, not in the VM image you hand out.
