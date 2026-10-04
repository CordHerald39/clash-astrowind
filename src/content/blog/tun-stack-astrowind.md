---
title: "Clash 选择 TUN 协议栈前应该查看什么资料"
description: "Clash 选择 TUN 协议栈前应该查看什么资料。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

选择 Clash（mihomo）TUN 的协议栈之前，应当把官方入站文档里 `stack` 及相关限制当作核对清单，而不是先凭印象填一个名字。资料给出的可用值是 `system`、`gvisor`、`mixed`、`mips`；默认是 `mips`，并写明如无使用问题建议使用 mips 栈。下面只说明选栈前要读哪些段落、如何判断适用、以及对不上时下一步看什么。

## 先读协议栈字段的职责划分

打开 TUN 入站说明，定位 `stack`。文档对四个值的写法分别是：`system` 使用系统协议栈，可以提供更稳定、更全面的 tun 体验，且占用相对其他堆栈更低；`gvisor` 在用户空间实现网络协议栈，可以提供更高的安全性和隔离性，同时可以避免操作系统内核和用户空间之间的切换，从而在特定情况下具有更好的网络处理性能；`mixed` 为混合堆栈，TCP 使用 system 栈、UDP 使用 gvisor 栈，并写明使用体验可能相对更好；`mips` 使用 mihomo 自研的 IP 协议栈。

判断依据是职责是否与当前目标一致，而不是把某一项理解成总开关。若没有明确的「必须走系统栈」或「必须用户态隔离」需求，文档给出的默认与建议都指向 `mips`。只有在需要把 TCP 与 UDP 拆到不同实现时，才进入 `mixed` 的适用条件。`system` 的适用条件是接受系统协议栈、并关注占用相对更低这一描述；`gvisor` 的适用条件是接受用户空间实现及其安全、隔离表述。

## 再读防火墙与跨平台差异

资料写明：如果打开了防火墙，则无法使用 `system` 和 `mixed` 协议栈，需要按系统放行。Windows 为：设置 → Windows 安全中心 → 允许应用通过防火墙 → 选中内核。MacOS 一般无需配置，防火墙默认放行签名软件；若开启防火墙后无法使用，可尝试系统设置 → 网络 → 防火墙 → 选项 → 添加 mihomo app。Linux 一般无需配置；若开启防火墙后无法使用，可尝试放行 TUN 网卡出站流量（文档示例网卡名为 Mihomo）：`sudo iptables -A OUTPUT -o Mihomo -j ACCEPT`。

选栈前必须记录：本机是否开防火墙、拟选值是否属于受影响的 `system`/`mixed`。页面另有「Tun 的协议栈网络回环测试」，并注明仅供参考，平台为 linux，Windows 和 MacOS 可能会有差异。因此回环示意图不能直接当成另一系统上的结论，操作系统本身也是选栈前必看项。

## 把只在特定栈或系统上生效的项一并列入

`congestion-controller` 可选 `cubic`、`reno`、`bbr`、`bbr3`，默认为 `cubic`，且仅在使用 mips 协议栈时生效。计划改拥塞控制却准备改用非 mips 栈时，该项不在对照范围内。`gso` 仅支持 Linux；`auto-redirect` 仅支持 Linux，且需要 `auto-route` 已启用。MacOS 的 `device` 只能使用 utun 开头的网卡名。`dns-hijack` 在 MacOS/Windows 无法自动劫持发往局域网的 DNS 请求；Android 开启私人 DNS 则无法自动劫持。

建议固定步骤：通读 `stack` 释义 → 记下系统与防火墙 → 列出本次会用到的附属字段并核对其生效条件 → 最后才写入 `stack`。失败时下一步：若选用 `system`/`mixed`，先按文档处理防火墙；若拥塞控制或 GSO 无变化，先核对是否写在错误的栈或错误的系统上；仍异常则回到与栈并列的 `enable`、`auto-route`、`strict-route`、`dns-hijack`，而不是继续更换栈名。

资料：https://wiki.metacubex.one/config/inbound/tun/
