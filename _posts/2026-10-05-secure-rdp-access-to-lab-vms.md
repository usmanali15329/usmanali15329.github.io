---
title: "Connecting to Lab VMs over RDP — and Doing It Safely"
date: 2026-10-05 09:00:00 +0200
category: guide
tags: [rdp, windows, remote-access, hardening]
excerpt: "The end-user RDP guide I wrote for colleagues connecting to their Hyper-V VMs, plus the admin-side hardening checklist that should sit behind it."
---
<p class="guide-credit">Written by Muhammad Usman Ali. I originally put this guide together for colleagues at Code Practitioners who needed to reach their development VMs. Company-specific hostnames, addresses and accounts have been replaced with placeholders.</p>

Most people on a D365 / AX consultancy team never touch the Hyper-V host. They only need to reach *their* VM. This guide covers that, followed by what an administrator should have in place before handing out access.

## Part 1 — Connecting (end-user steps)

1. Open the Start menu, search for **Remote Desktop Connection** and open it (or press `Win + R` and run `mstsc`).
   ![Search for Remote Desktop Connection in the Start menu]({{ '/assets/img/guides/rdp/01-start-menu.png' | relative_url }})
   *Search for Remote Desktop Connection in the Start menu*

2. In **Computer**, enter the address you were given for your VM, for example `vm-gateway.example.com:50001`. The `:port` part matters if your VM is published on a non-standard port.
3. Click **Connect**.

   ![The Remote Desktop Connection client — enter the VM address here]({{ '/assets/img/guides/rdp/02-rdp-client.png' | relative_url }})
   *The Remote Desktop Connection client — enter the VM address here*

4. Enter the **username and password** you were issued. Use the `DOMAIN\username` format if your VM is domain-joined.
5. Accept the certificate prompt only if the name matches the VM you expect, then click **OK**. You're in.

   ![Credential prompt — a failed attempt usually means the wrong username format (account name redacted)]({{ '/assets/img/guides/rdp/03-credentials.png' | relative_url }})
   *Credential prompt — a failed attempt usually means the wrong username format (account name redacted)*

**Tip:** click **Show Options → Save As** to keep a `.rdp` file with the address and username filled in. Never let it save the password on a shared machine.

### Quick troubleshooting

| Symptom | Usual cause | Fix |
|---|---|---|
| "Remote Desktop can't connect to the remote computer" | VM is off, wrong port, or firewall rule missing | Check with your admin that the VM is running and the port is published |
| "Your credentials did not work" | Wrong username format or expired password | Try `DOMAIN\user` or `.\user` for a local account |
| Certificate warning every time | VM uses a self-signed RDP certificate | Expected on lab VMs. Confirm the name, then tick "Don't ask me again" |
| Black screen after login | Session stuck on the VM | Disconnect and reconnect, or ask the admin to log the session off |

## Part 2 — What the admin should have in place

Exposing RDP straight to the internet is one of the most common ways ransomware gets in. Before handing out the address above, I'd want the following in place:

- **Prefer a VPN or RD Gateway.** Users connect to the VPN (or an RD Gateway over 443) first, and RDP itself is never published publicly.
- **If a port must be published, restrict it.** Use a non-default external port *and* a firewall rule allowing only known source IPs. A non-standard port alone just cuts down the noise from scanners. It isn't real protection.
- **Network Level Authentication (NLA) on.** *System Properties → Remote → Allow connections only from computers running Remote Desktop with NLA.*
- **No shared or built-in Administrator logins.** Every user gets their own account, the built-in Administrator is renamed or disabled, and passwords come from a password manager.
- **Account lockout policy** (for example, 10 attempts / 15 minutes) to blunt brute-force attempts.
- **Watch the logs.** Event ID **4625** (failed logon) and **4624 with Logon Type 10** (RDP logon) are the ones to alert on in your SIEM.

```powershell
# Quick check of recent failed RDP logons on a VM
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 50 |
  Select-Object TimeCreated, @{n='Account';e={$_.Properties[5].Value}}, @{n='SourceIP';e={$_.Properties[19].Value}}
```
