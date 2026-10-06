---
title: "TryHackMe: Investigating Windows"
date: 2026-10-06 10:00:00 +0200
category: thm
platform: TryHackMe
difficulty: Easy
tags: [windows, dfir, blue-team, event-logs, persistence]
excerpt: "Investigating a compromised Windows Server with built-in tools: rogue admin accounts, Run-key and scheduled-task persistence, Mimikatz, a hosts-file C2 redirect and a JSP web shell."
---
<p class="guide-credit">Room: <a href="https://tryhackme.com/room/investigatingwindows">tryhackme.com/room/investigatingwindows</a> · My profile: <a href="https://tryhackme.com/p/mr.mingle">mr.mingle</a></p>

## Intro

In this room you get RDP access to a Windows server that has already been hacked, and you have to work out what the attacker did. There's no fancy tooling here. Everything is done with what Windows already has: Command Prompt, PowerShell, Registry Editor, Task Scheduler, Event Viewer and the firewall console.

I had done this room before, so this time I went through it again slowly and took screenshots of each step. When I got stuck I used the TechWithZ write-up as a reference. The questions don't follow the order you'd use in a real investigation, so I grouped my steps the way I would check a machine at work: system and users first, then persistence, then the attacker's files, the logs, and the network side.

## Answers at a glance

| # | Question | Finding |
|---|---|---|
| 1 | Windows version and year | Windows Server 2016 (Datacenter) |
| 2 | User who logged in last | Administrator |
| 3 | John's last logon | 03/02/2019 5:48:32 PM |
| 4 | IP contacted at system start-up | 10.34.2.3 |
| 5 | Other accounts with admin rights | Guest, Jenny |
| 6 | Malicious scheduled task | Clean file system |
| 7 | File the task runs daily | nc.ps1 |
| 8 | Port the file listens on | 1348 |
| 9 | Jenny's last logon | Never |
| 10 | Date of compromise | 03/02/2019 |
| 11 | First special-privilege logon (Event 4672) | 03/02/2019 4:04:49 PM |
| 12 | Tool used to dump Windows passwords | Mimikatz |
| 13 | Attacker C2 server IP | 76.32.97.132 |
| 14 | Extension of the uploaded web shell | .jsp |
| 15 | Last port opened by the attacker | 1337 |
| 16 | Site targeted by DNS poisoning | google.com |

## Walkthrough

### 1. What machine is this?

First I wanted the OS version. I right-clicked This PC → Properties, and it shows Windows Server 2016 Datacenter.

![This PC → Properties]({{ '/assets/img/labs/investigating-windows/01.png' | relative_url }})
*This PC → Properties*

![Windows Server 2016 Datacenter]({{ '/assets/img/labs/investigating-windows/02.png' | relative_url }})
*Windows Server 2016 Datacenter*

Clicking through the GUI was getting slow, so I opened an admin Command Prompt from the Win + X menu and used CMD for most of the rest. systeminfo gives the same answer:

```text
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
```

![Opening Command Prompt (Admin)]({{ '/assets/img/labs/investigating-windows/03.png' | relative_url }})
*Opening Command Prompt (Admin)*

![systeminfo output]({{ '/assets/img/labs/investigating-windows/04.png' | relative_url }})
*systeminfo output*

### 2. Users and last logons

The last user to log in was simply Administrator, the account I was using myself. For John I used `net user`. I typed "Jhon" the first time and got "user name could not be found", so a small reminder to check spelling. With the right name it shows John's last logon as 3/2/2019 5:48:32 PM.

```text
net user John
```

![net user John]({{ '/assets/img/labs/investigating-windows/05.png' | relative_url }})
*net user John*

![John's last logon]({{ '/assets/img/labs/investigating-windows/06.png' | relative_url }})
*John's last logon*

Then I checked Jenny the same way. Two things stood out: she is in the Administrators group, and her last logon says "Never". An admin account that has never been used looks like something the attacker created as a backup way in.

![Jenny is in the Administrators group]({{ '/assets/img/labs/investigating-windows/07.png' | relative_url }})
*Jenny is in the Administrators group*

![Jenny: Last logon = Never]({{ '/assets/img/labs/investigating-windows/08.png' | relative_url }})
*Jenny: Last logon = Never*

Just to be sure, I searched the Security log in Event Viewer for "Jenny" and it found nothing, which matched.

![No events for Jenny in the Security log]({{ '/assets/img/labs/investigating-windows/09.png' | relative_url }})
*No events for Jenny in the Security log*

### 3. Who else has admin rights?

```text
net localgroup administrators
```

Apart from Administrator, the list shows Guest and Jenny. Guest should never be an admin, so that is clearly the attacker's doing.

![Members of the local Administrators group]({{ '/assets/img/labs/investigating-windows/10.png' | relative_url }})
*Members of the local Administrators group*

![Same command in a bigger window]({{ '/assets/img/labs/investigating-windows/11.png' | relative_url }})
*Same command in a bigger window*

I also checked it in Computer Management (Local Users and Groups → Groups → Administrators) and got the same result.

![Opening Computer Management]({{ '/assets/img/labs/investigating-windows/12.png' | relative_url }})
*Opening Computer Management*

![Local Users and Groups → Groups]({{ '/assets/img/labs/investigating-windows/13.png' | relative_url }})
*Local Users and Groups → Groups*

![Administrators → Properties]({{ '/assets/img/labs/investigating-windows/14.png' | relative_url }})
*Administrators → Properties*

![Guest and Jenny listed as admins]({{ '/assets/img/labs/investigating-windows/15.png' | relative_url }})
*Guest and Jenny listed as admins*

### 4. What runs when the machine starts?

The question asked which IP the system connects to on start-up, so I went to the usual autostart places. In Registry Editor, under HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run, there is an entry called UpdateSvc. It runs C:\TMP\p.exe against \\10.34.2.3 and saves the output of "net user" to a text file. So the IP is 10.34.2.3.

![Opening regedit]({{ '/assets/img/labs/investigating-windows/16.png' | relative_url }})
*Opening regedit*

![The UpdateSvc Run key pointing to 10.34.2.3]({{ '/assets/img/labs/investigating-windows/17.png' | relative_url }})
*The UpdateSvc Run key pointing to 10.34.2.3*

I also had a look in both Startup folders (shell:startup and shell:common startup). Nothing suspicious there: one normal wallpaper entry, and the other folder was empty.

![shell:startup]({{ '/assets/img/labs/investigating-windows/18.png' | relative_url }})
*shell:startup*

![User Startup folder]({{ '/assets/img/labs/investigating-windows/19.png' | relative_url }})
*User Startup folder*

![shell:common startup]({{ '/assets/img/labs/investigating-windows/20.png' | relative_url }})
*shell:common startup*

![All-users Startup folder is empty]({{ '/assets/img/labs/investigating-windows/21.png' | relative_url }})
*All-users Startup folder is empty*

Afterwards I found that PowerShell can list all of these at once, which is quicker:

```text
Get-WmiObject Win32_StartupCommand | Select *
```

![Listing start-up commands with WMI]({{ '/assets/img/labs/investigating-windows/22.png' | relative_url }})
*Listing start-up commands with WMI*

![The UpdateSvc entry shows up here as well]({{ '/assets/img/labs/investigating-windows/23.png' | relative_url }})
*The UpdateSvc entry shows up here as well*

### 5. The malicious scheduled task

In Task Scheduler there are a few tasks in the main library that don't look normal. "Clean file system" sounds harmless, but on the Actions tab it runs C:\TMP\nc.ps1 -l 1348, every day at 4:55 PM. So the file is nc.ps1, and -l 1348 means it listens on port 1348.

![Opening Task Scheduler]({{ '/assets/img/labs/investigating-windows/24.png' | relative_url }})
*Opening Task Scheduler*

![The "Clean file system" task]({{ '/assets/img/labs/investigating-windows/25.png' | relative_url }})
*The "Clean file system" task*

![Actions tab: C:\TMP\nc.ps1 -l 1348]({{ '/assets/img/labs/investigating-windows/26.png' | relative_url }})
*Actions tab: C:\TMP\nc.ps1 -l 1348*

![Port 1348 in the task arguments]({{ '/assets/img/labs/investigating-windows/27.png' | relative_url }})
*Port 1348 in the task arguments*

There was another odd one called "falshupdate22" (spelled like that), which runs PowerShell in a hidden window. It wasn't a question in the room, but it's clearly another way the attacker keeps access.

![falshupdate22 runs hidden PowerShell]({{ '/assets/img/labs/investigating-windows/28.png' | relative_url }})
*falshupdate22 runs hidden PowerShell*

I wanted to know what nc.ps1 actually is, so I opened it in Notepad. I didn't run it. The comments at the top show it is PowerCat, which is basically netcat written in PowerShell.

![Open with → Notepad]({{ '/assets/img/labs/investigating-windows/29.png' | relative_url }})
*Open with → Notepad*

![Choosing Notepad]({{ '/assets/img/labs/investigating-windows/30.png' | relative_url }})
*Choosing Notepad*

![nc.ps1 contents]({{ '/assets/img/labs/investigating-windows/31.png' | relative_url }})
*nc.ps1 contents*

![The header says it is PowerCat]({{ '/assets/img/labs/investigating-windows/32.png' | relative_url }})
*The header says it is PowerCat*

### 6. The attacker's folder and the date of the compromise

Both the Run key and the task pointed to C:\TMP, so I went there. It is basically the attacker's toolbox: mim.exe and mim-out (Mimikatz), nbtscan, nc.ps1, p.exe, the backdoor scripts and a memory dump. I didn't run anything from here, only looked at the files.

![Going to Local Disk (C:)]({{ '/assets/img/labs/investigating-windows/33.png' | relative_url }})
*Going to Local Disk (C:)*

![The C:\TMP folder]({{ '/assets/img/labs/investigating-windows/34.png' | relative_url }})
*The C:\TMP folder*

![Contents of C:\TMP]({{ '/assets/img/labs/investigating-windows/35.png' | relative_url }})
*Contents of C:\TMP*

Nearly every file has the same date modified, 3/2/2019, so that is the date of the compromise. I double-checked the dates in PowerShell:

![All files dated 3/2/2019]({{ '/assets/img/labs/investigating-windows/36.png' | relative_url }})
*All files dated 3/2/2019*

```text
Get-ChildItem C:\TMP
```

![Same dates in PowerShell]({{ '/assets/img/labs/investigating-windows/37.png' | relative_url }})
*Same dates in PowerShell*

### 7. Event 4672: special privileges

This was the question I had to look up. I didn't remember which event ID means "special privileges assigned to new logon", so I googled it. It's Event ID 4672.

![Looking up the event ID]({{ '/assets/img/labs/investigating-windows/38.png' | relative_url }})
*Looking up the event ID*

In Event Viewer I filtered the Security log to Event ID 4672 on 3/2/2019 only, then scrolled to the earliest entry from the attack: 3/2/2019 4:04:49 PM.

![Filter: Event ID 4672, 3/2/2019]({{ '/assets/img/labs/investigating-windows/39.png' | relative_url }})
*Filter: Event ID 4672, 3/2/2019*

![The 4672 event at 4:04:49 PM]({{ '/assets/img/labs/investigating-windows/40.png' | relative_url }})
*The 4672 event at 4:04:49 PM*

I also pulled the logons for that day in PowerShell, and they cluster around the same time:

```text
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624; StartTime='3/2/2019'; EndTime='3/3/2019'}
```

![Logon events on 3/2/2019]({{ '/assets/img/labs/investigating-windows/41.png' | relative_url }})
*Logon events on 3/2/2019*

### 8. How did they get the passwords?

The mim-out file in C:\TMP is a text file, so it was safe to open. It's the output of Mimikatz (sekurlsa::logonpasswords), with usernames and NTLM/SHA1 hashes. So the tool was Mimikatz.

![mim-out shows Mimikatz output]({{ '/assets/img/labs/investigating-windows/42.png' | relative_url }})
*mim-out shows Mimikatz output*

### 9. C2 server and DNS poisoning

For both of these questions the answer was in the hosts file. At the bottom, google.com and www.google.com are pointed at 76.32.97.132. That means anyone on this machine going to Google is sent to the attacker's server instead. So the C2 IP is 76.32.97.132 and the targeted site is google.com.

```text
type C:\Windows\System32\drivers\etc\hosts
```

![hosts file opened in Notepad]({{ '/assets/img/labs/investigating-windows/43.png' | relative_url }})
*hosts file opened in Notepad*

![Same thing in PowerShell]({{ '/assets/img/labs/investigating-windows/44.png' | relative_url }})
*Same thing in PowerShell*

![The two google.com entries]({{ '/assets/img/labs/investigating-windows/45.png' | relative_url }})
*The two google.com entries*

### 10. The web shell

The server runs IIS, so I looked in C:\inetpub\wwwroot. There are b.jsp, tests.jsp and shell.gif, all dated 3/2/2019 like everything else. The shell was uploaded with the .jsp extension.

![C:\inetpub\wwwroot]({{ '/assets/img/labs/investigating-windows/46.png' | relative_url }})
*C:\inetpub\wwwroot*

```text
Get-ChildItem C:\inetpub\wwwroot
```

![Listing the web root in PowerShell]({{ '/assets/img/labs/investigating-windows/47.png' | relative_url }})
*Listing the web root in PowerShell*

### 11. The last port opened

Last one: I opened Windows Firewall with Advanced Security and looked at the inbound rules. At the top there's a rule called "Allow outside connections for development". In its properties, the local port is 1337.

![Opening the firewall console]({{ '/assets/img/labs/investigating-windows/48.png' | relative_url }})
*Opening the firewall console*

![The suspicious inbound rule]({{ '/assets/img/labs/investigating-windows/49.png' | relative_url }})
*The suspicious inbound rule*

![Local port 1337]({{ '/assets/img/labs/investigating-windows/50.png' | relative_url }})
*Local port 1337*

## What I took away from this

- The attacker didn't rely on one backdoor. There was a Run key, two scheduled tasks and extra admin accounts. When you find one, keep looking.
- File dates are really useful. Just looking at C:\TMP gave me the date of the whole attack.
- Look, don't run. I opened scripts and text files in Notepad and never executed anything from C:\TMP.
- Things I'd watch for at work: new scheduled tasks (Event 4698), users added to Administrators (Event 4732), new firewall rules (Event 4946), and changes to the hosts file.

Room by TryHackMe. I used the TechWithZ write-up (techwithz.com) as a reference when I got stuck. All screenshots are from my own run of the lab.
