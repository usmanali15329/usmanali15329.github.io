---
title: "Reading a Packet Capture: A Practical Wireshark Workflow"
date: 2025-11-01 10:00:00 +0500
category: blog
tags: [wireshark, network-analysis, packet-capture]
excerpt: "The filters and habits I actually use when triaging a pcap for suspicious traffic."
---
This started as an academic project during my BS in Digital Forensics & Cyber Security: capture live network traffic, analyze it, and report anything that looked like a potential threat. The tool was Wireshark, and the workflow below is the one I still reach for.

## 1. Capture with a purpose

Don't just hit start and hope. Scope the capture to an interface and, where possible, a filter that limits noise from the start:

```text
host 192.168.1.0/24 and not port 22
```

## 2. Triage with display filters

Once you have a `.pcap`, display filters do the real work. A short list I use constantly:

```text
tcp.flags.syn == 1 and tcp.flags.ack == 0   # new connection attempts
dns.qry.name contains "pastebin"            # suspicious DNS lookups
http.request.method == "POST"               # outbound data
tcp.analysis.retransmission                 # possible network issues or scanning
```

## 3. Follow the stream

Right-click any packet → **Follow → TCP Stream** to reconstruct the full conversation. This is usually where a plaintext credential, a C2 beacon pattern, or a clear-text exfil attempt actually becomes visible instead of just implied by a handful of packets.

## 4. Pull out indicators, not just packets

The deliverable was never "here's a pcap" — it's a short list of IOCs (IPs, domains, hashes if a file was carved out with **File → Export Objects**) and a plain-English description of what happened. That's the part that's actually useful to whoever reads the report.

## Takeaway

Wireshark rewards a narrow, repeatable filter vocabulary far more than it rewards clicking through every packet. I'm still adding to mine.
