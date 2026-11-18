---
title: "The Rule Was Fine — the ISP Wasn't: Troubleshooting a UK–Australia Traffic Drop"
date: 2026-11-18 10:00:00 +0100
category: blog
tags: [check-point, troubleshooting, packet-capture, traceroute, networking]
excerpt: "A customer said traffic still wasn't flowing after I added a firewall rule. Packet captures on both firewalls and a traceroute showed the policy was fine — the traffic was dying at the customer's ISP in Australia."
---
<p class="guide-credit">Case from my time as a Network Security Engineer at Villa Tech Inc. (2023–2024). It was an urgent, live customer issue, so I don't have screenshots, captures or logs to share — this write-up is from memory, and customer names, sites and addresses are left out on purpose.</p>

## The ticket

A customer asked for a new firewall rule so two of their sites could talk to each other — one behind a firewall in the **UK**, one behind a firewall in **Australia**. I added the rule and installed the policy.

Shortly after, the customer came back: *"We're still not receiving any traffic."*

The easy assumption is that the rule is wrong. But a rule that looks right on paper and "doesn't work" in practice can fail for lots of reasons that have nothing to do with the rule itself. So instead of editing the rule again and hoping, we investigated.

## What we checked

**1. Capture the traffic on both ends.**
We collected network traffic on **both** firewalls at the same time. That's the step that cracked it:

- The **UK firewall** was sending traffic out *and* receiving traffic back as expected.
- The **Australia firewall** was **not receiving** the traffic at all.

If the Australian firewall had been receiving the packets and dropping them, we'd have been looking at a policy, NAT or routing problem on that box. But the packets never arrived. Whatever was wrong was happening *before* the Australian firewall.

**2. Follow the path.**
A **traceroute** toward the Australian side showed the path breaking down upstream — at the **customer's ISP on the Australian side**, not anywhere in the firewall configuration.

## The outcome

The rule was correct all along. The fault was with the customer's internet provider on the Australian side, so the fix lay with the ISP — not with another policy change on our side.

## What I took away from it

- **"I added a rule and it doesn't work" isn't proof the rule is wrong.** Check whether the traffic even reaches the firewall before changing anything.
- **Capture on both sides.** One capture tells you what one box sees. Two captures at the same time tell you *where* traffic disappears — that's what turned a guess into an answer here.
- **Separate "dropped" from "never arrived".** A firewall dropping packets and a firewall that never sees them are completely different problems with different owners.
- **Traceroute is still worth running.** It's basic, but it was the quickest way to show the problem was upstream and outside our control.
- **Hand over evidence, not opinions.** Telling a customer "it's your ISP" goes much better when you can show exactly where the path breaks.
