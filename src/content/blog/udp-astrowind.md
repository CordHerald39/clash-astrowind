---
title: "Clash 应用需要 UDP 时怎样确认各层支持"
description: "Clash 应用需要 UDP 时怎样确认各层支持。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

应用需要 UDP 时，不能把网页或其它 TCP 探测成功写成“各层已经支持 UDP”。全局配置页提供的是运行模式、是否接受 IPv6、日志级别、进程匹配、局域网访问、出站接口和路由标记，以及一组名称就限定在 TCP 上的字段；该页没有给出名为 UDP 的专用总开关。确认工作应改成：先分清每一层字段实际管什么，再决定哪些结果可以写入 UDP 结论，哪些只能留在 TCP 侧。

## 适用条件：先固定模式、地址族和流量来源

适用条件是：应用行为上需要 UDP，而你只能依据全局配置与内核日志做分层确认。不适用的情况是：只用网页能否打开反推 UDP，或把 TCP Keep Alive、TCP 并发的调通直接当成 UDP 已通。

`mode` 可选 `rule`（规则匹配）、`global`（全局代理，需要在 GLOBAL 策略组选择代理或策略）、`direct`（全局直连），默认为规则模式。UDP 与 TCP 都会受模式约束。若当前为 `direct`，应用即使发出 UDP，也不会按代理路径转发。判断依据：先记录 `mode`，再谈某一层支不支持；global 模式下还要记录 GLOBAL 当时选中的对象，否则会把直连、未选策略和协议失败混在一起。

`ipv6` 控制内核是否接受 IPv6 流量，可选 true 或 false，默认为 true。若应用的 UDP 只在 IPv6 上发起，而该项为 false，这一层就不会接受对应流量。判断依据：需要 UDP 的应用若只在某一地址族上工作，必须先确认 `ipv6` 与对端地址族一致，不能只测 IPv4 的 TCP 网页。

`allow-lan` 为 true 时，允许其他设备经 Clash 的代理端口访问互联网。`bind-address` 可绑定 `*`、单个 IPv4 或单个 IPv6。`lan-allowed-ips` 默认包含 `0.0.0.0/0` 与 `::/0`，`lan-disallowed-ips` 为黑名单且优先级高于白名单。若 UDP 发起方是局域网其它设备，应先确认允许局域网、绑定地址和地址段。判断依据：本机网页正常不能代表其它设备的 UDP 已经进入内核。

## 分层核对：日志、进程匹配，并剔除 TCP 专属项

第一步，设定 `log-level`。silent 不输出；error 仅输出发生错误至无法使用的日志；warning 还包含不影响运行的错误；info 包含一般运行内容；debug 尽可能输出运行中所有信息。日志仅在控制台和控制页面输出。需要确认 UDP 时，判断依据是在 debug 或至少 info 下，能否看到该应用相关流量被接受、被拒绝或出站失败，而不是看有没有网页。

第二步，确认 `find-process-mode`。always 强制匹配所有进程；strict 为默认，由 Clash 判断是否开启；off 不匹配进程，文档写明推荐在路由器上使用。若接管或规则依赖进程名，而当前为 off，则“是哪个应用在发 UDP”这一层无法被内核记录。判断依据：需要按应用确认 UDP 时，必须能说明当前是 always、strict 还是 off；为 off 时，不要用“进程未出现在日志”反推 UDP 已被丢弃。

第三步，把 TCP 专属项从 UDP 证据中剔除。`keep-alive-interval` 是 TCP Keep Alive 包间隔，单位为秒；`keep-alive-idle` 是 TCP Keep Alive 最大空闲时间；`disable-keep-alive` 在 Android 上强制为 true。`tcp-concurrent` 启用 TCP 并发连接，使用 DNS 解析出的所有 IP，并使用第一个成功的连接。判断依据：这些字段的名称与说明都限于 TCP，调通后只能证明 TCP 路径上的保活或并发，不能作为 UDP 各层已支持的证据。

第四步，做出站层确认。`interface-name` 指定流量出站接口；`routing-mark` 为 Linux 下出站连接提供默认流量标记。若 UDP 需要从特定网卡或带标记离开主机，应核对这两项是否指向预期出口。判断依据：接口或标记与系统路由不一致时，TCP 网页可能仍因另一条路径看起来正常，UDP 则在出站层失败。

第五步，若流量来自其它设备，再核对 `authentication` 与 `skip-auth-prefixes`。该页写的是 http(s) / socks / mixed 代理的用户验证。判断依据：网页通过验证，不能自动写成 UDP 入站已经支持，要以流量是否经过这些入站为前提。

## 失败时下一步

若 `mode` 为 direct：下一步改为 rule 或 global 后再观察需要 UDP 的应用；global 时同时确认 GLOBAL 策略组已选择代理或策略。若 `ipv6` 与应用地址族不一致：下一步用同一地址族复查，避免用 IPv4 TCP 成功证明 IPv6 UDP 可用。

若 `find-process-mode` 为 off 或处于路由器场景：下一步不要用进程名解释 UDP，改为依据日志中的接受或拒绝记录，以及目的地址是否进入内核。需要按应用识别且环境允许时，再改为 always，或理解 strict 下由内核判断是否开启的结果。

若日志级别过低：下一步升到 debug。仍看不到与该应用对应的线索时，应承认该全局配置页未提供 UDP 专用开关，不能把 TCP Keep Alive 或 TCP 并发成功写成 UDP 已支持。局域网设备失败时，下一步核对 `allow-lan`、`bind-address`、白名单与黑名单。分层确认只说明相应字段是否打开，不构成应用层效果保证。

https://wiki.metacubex.one/config/general/
