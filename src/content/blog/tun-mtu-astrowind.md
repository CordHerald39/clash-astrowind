---
title: "Clash 调整 TUN MTU 前应该收集哪些现象"
description: "Clash 调整 TUN MTU 前应该收集哪些现象。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

在 mihomo 的 TUN 入站文档中，mtu 被定义为最大传输单元，说明会影响力极限状态下的速率，并明确一般用户默认即可。因此在调整该值之前，必须先收集与启用状态、协议栈、路由和平台限制相关的现象，用来判断当前是否真正处于文档所说的极限场景，以及现有配置是否已经偏离建议。只有确认适用条件后才进入修改，否则应维持默认，避免把其他字段问题误判为 mtu 问题。

## 核对 TUN 是否启用并记录全部基础字段
适用条件是配置里 tun.enable 已经为 true。操作步骤是打开 YAML，定位 tun 段，逐项记下 enable、stack、device、mtu 是否出现、auto-route、auto-redirect、auto-detect-interface、dns-hijack、strict-route 的当前值。判断依据来自文档：如无使用问题建议使用 mips 栈，默认即为 mips，可选 system、gvisor、mixed、mips。若防火墙已开启，则 system 与 mixed 不可用，必须同时记录 Windows 是否已在安全中心允许内核、MacOS 防火墙是否添加过应用、Linux 是否已对 TUN 网卡执行 iptables 放行。如果这些基础现象显示 auto-route 未开却期望全局、或栈与防火墙冲突，则收集到的任何速率现象都不应首先指向 mtu。

## 记录可能与极限速率有关的运行表现及平台差异
文档只把 mtu 与极限状态下的速率联系在一起。收集时需写下当前是否已显式写出 mtu（示例里出现过 9000），并描述使用中是否出现可能被理解为极限负载的情况。判断依据仍是“一般用户默认即可”：日常流量若无明显瓶颈，即不具备调整的典型条件。同时记录 gso 与 gso-max-size（仅 Linux）、udp-timeout（默认 300 秒）、endpoint-independent-nat、congestion-controller（仅 mips 生效）以及 inet6-address 是否因系统其他网卡无 IPv6 而被自动禁用。Linux 下还要记下 auto-redirect 是否配合 auto-route、strict-route 是否让不支持的网络不可达；Windows 下记下 strict-route 添加的防火墙规则及对 VirtualBox 一类应用的影响；Android 记下是否仅转发本地 IPv4、私人 DNS 是否导致 dns-hijack 失效。这些现象用于排除路由、劫持和栈本身的问题。

## 汇总过滤项与环境后决定是否具备调整资格
继续收集 include-interface 与 exclude-interface（二者冲突不可同时配）、include-uid 及范围、mac 地址过滤、android 用户与包名、route-address 与 route-exclude-address、route-address-set（需 Linux nftables 且与 routing-mark 冲突）以及 iproute2 表和规则索引。判断多出口设备是否应放弃自动检测、改为手动指定接口。若全部记录完成后仍无法认定处于极限状态，或现象明显能被其他字段解释，则失败时下一步是不修改 mtu，保持文档建议的默认，先修正栈、防火墙、dns-hijack 或路由自定义项，保存带注释的配置副本后再观察。

资料来源：https://wiki.metacubex.one/config/inbound/tun/
