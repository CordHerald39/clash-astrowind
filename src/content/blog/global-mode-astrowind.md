---
title: "Clash 全局模式适合怎样的排查步骤"
description: "Clash 全局模式适合怎样的排查步骤。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

排查“规则把流量送错了，还是出站本身不可用”时，才适合把运行模式切到全局代理。官方全局配置把 `mode` 定义为三种取值：`rule` 表示规则匹配，`global` 表示全局代理（需要在 GLOBAL 策略组选择代理或策略），`direct` 表示全局直连。该项有默认值，默认为规则模式。因此全局模式的适用条件很窄：内核已在运行、你能改 `mode` 并确认 GLOBAL 组已选定出站，并且这次对照的目标是同一入站路径上的同一类连接。若 GLOBAL 组没有选定，官方语义下的“全局代理”并不完整，对照结论不能成立。

## 先确认模式语义再决定是否切换

具体场景是：某个域名或某个进程在规则模式下表现异常，你怀疑是规则命中了错误出站，而不是节点、DNS 或入站端口本身失效。判断依据只有官方定义：`rule` 走规则匹配，`global` 走全局代理且依赖 GLOBAL 策略组选择。若你其实怀疑“流量根本没进 Clash”，全局模式帮不上忙，应先核对本页中的入站相关项，而不是改 `mode`。

操作上只改配置字段，不依赖未在资料中出现的界面名称。打开全局配置，确认当前是否为 `mode: rule`。需要隔离规则时改为 `mode: global`。随后必须在 GLOBAL 策略组中选定代理或策略。若本次还要看内核如何描述连接，同步核对本页的日志级别：`log-level` 可选 `silent`（不输出）、`error`、`warning`、`info`（一般运行内容及更高级别）、`debug`（尽可能输出运行中所有信息）。排查时应避免 `silent`，否则无法判断模式切换是否被内核接受。

## 把进程匹配和入站范围一并列入核对清单

全局模式只改变“已进入内核的流量”按什么策略出站，不自动扩大谁会被匹配。进程匹配模式 `find-process-mode` 是独立项：`always` 强制匹配所有进程，`strict` 为默认、由 Clash 判断是否开启，`off` 不匹配进程（资料写明推荐在路由器上使用）。若排查对象是“某个应用程序”，而当前为 `off`，即使 `mode` 已是 `global`，你也缺少进程维度的判断依据。

入站范围同样要先满足，否则全局代理没有作用对象。`allow-lan` 控制是否允许其他设备经过 Clash 的代理端口访问互联网；`bind-address` 决定绑定所有地址还是单个 IPv4/IPv6；`lan-allowed-ips` 与 `lan-disallowed-ips` 在 `allow-lan` 为 true 时生效，且黑名单优先级高于白名单。HTTP(S)/SOCKS/mixed 还可配置 `authentication` 与 `skip-auth-prefixes`。本机环回是否被要求认证、局域网设备是否被黑名单丢掉，都会让“已经开了全局”的观察失真。`ipv6` 控制内核是否接受 IPv6 流量，默认 true；若目标实际走 IPv6 而该项与预期不符，应先纠正再谈模式对照。

## 切换后仍无差异时的下一步

若 `mode: global` 且 GLOBAL 已选择，目标行为与规则模式相同，不要反复只改 `mode`。下一步按本页字段缩小范围：把 `log-level` 调到能看到一般运行信息或调试信息，确认内核日志里模式与出站选择已被接受；检查 `find-process-mode` 是否为 `off`；检查 `allow-lan`、`bind-address`、认证与 IP 段是否把连接挡在代理端口外；检查 `ipv6`。需要从外部读取或改写运行状态时，可使用 `external-controller` 等 RESTful API，并配置 `secret`。资料同时写明：从 Unix socket 或 Windows namedpipe 访问 API 不会验证 secret，在 RESTful 端口上开启的 DOH 路径同样不验证 secret，若开启须自行保证安全。先确认 API 读到的运行模式与 GLOBAL 选择与文件一致，再决定是否回到 `rule` 去查规则，或维持 `global` 去查出站与入站。

https://wiki.metacubex.one/config/general/
