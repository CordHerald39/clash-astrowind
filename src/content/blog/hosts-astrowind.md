---
title: "Clash 使用静态 hosts 映射前要准备哪些信息"
description: "Clash 使用静态 hosts 映射前要准备哪些信息。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

使用静态 hosts 映射前，要先备齐主机名、目标地址，并确认 Clash DNS 会不会回应这些记录。官方 DNS 说明里，`use-hosts` 表示是否回应配置中的 hosts，默认 true；`use-system-hosts` 表示是否查询系统 hosts，默认 true。若 `enable` 为 false，则使用系统 DNS 解析，配置里的映射不会沿 Clash DNS 路径生效。信息没齐就改映射，常见后果是查询从未进入本模块，或开关已关闭却以为记录已经生效。

## 适用条件

静态映射只适合主机名和 IP 都已确定、只需要解析直接给出该地址的场景。判断依据有四条：能写出完整主机名；能写出对应的 IPv4 或 IPv6；能分清记录来自配置中的 hosts 还是系统 hosts；DNS 查询会到达 Clash。

主机名仍在变化、目标地址尚未从现有解析链确认、客户端根本不走 Clash DNS，或需求其实是按域名选择上游时，先不要做静态映射。`nameserver-policy` 用于指定域名查询的解析服务器，可使用 geosite，优先于 nameserver/fallback，键支持域名通配。它解决的是「去哪台服务器查」，与 hosts 的「直接回应已有记录」不是同一类配置。

`enhanced-mode` 可选 fake-ip 或 redir-host，默认 redir-host。fake-ip 还会用到 `fake-ip-range`（文档示例为 `198.18.0.1/16`）和 `fake-ip-filter`。准备映射前必须记下当前模式，避免把 fake-ip 地址段当成静态映射的目的地。

## 需要准备的信息与核对步骤

按下面顺序收集，缺任何一项都不要写入映射。

主机名清单要逐条列出，不要用「相关域名」代替。文档中的域名通配出现在 `nameserver-policy`、`fake-ip-filter` 等字段；准备 hosts 时先用明确主机名，避免和 policy、filter 的匹配范围缠在一起。

目标地址要标明版本。`ipv6` 为 false 时，会回应 AAAA 的空解析。业务若走 IPv6 或双栈，必须确认该开关与映射记录类型一致。`fake-ip-range` 与 `fake-ip-range6` 是 fakeip 使用的地址段，不能填成静态映射目标。

映射来源要写清楚。写入配置中的 hosts 时，确认 `use-hosts` 为 true；依赖操作系统 hosts 时，确认 `use-system-hosts` 为 true。任一开关为 false，文件里即使有记录，DNS 模块也不会按该来源回应。

模块工作方式要记录 `enable`、`listen`、`enhanced-mode`、`cache-algorithm`。`listen` 为 DNS 服务监听，支持 udp、tcp。`cache-algorithm` 支持 lru（默认）与 arc。客户端未把查询发到该监听时，配置中的 hosts 不会被询问。记下这些值，是为了映射后能判断问题出在缓存、模式还是映射本身。

交叉策略也要抄原文。检查该主机名是否出现在 `nameserver-policy`、`fallback-filter` 的 domain、`fake-ip-filter`、`proxy-server-nameserver-policy`。配置 fallback 后默认启用 `fallback-filter`，且 `geoip-code` 为 cn。这些字段决定向谁查询、采用哪份结果，不能用一条静态 IP 代替。

最后区分名字的角色。若主机名是代理节点域名，文档提供 `proxy-server-nameserver` 与 `proxy-server-nameserver-policy`，仅用于解析代理节点的域名。direct 出口则看 `direct-nameserver`。准备静态映射前要分清它是业务目标、节点服务器还是 direct 出口域名。

## 信息不全或映射未生效时的下一步

主机名或 IP 尚未确认时，先不要改 hosts。应使用必须为 IP 的 `default-nameserver` 去解析 DNS 服务器的域名，再通过 `nameserver` 或 `nameserver-policy` 查询业务名，得到稳定记录后再考虑静态映射。

若 `enable` 为 false，下一步是按官方说明把它理解为当前使用系统 DNS，而不是继续堆映射。需要 Clash 回应配置中的 hosts 时，先启用 DNS，再核对 `use-hosts`；依赖系统文件时核对 `use-system-hosts`。

查询未到达 `listen` 时，下一步是让客户端或入站流量真正问到 Clash DNS，而不是重复添加相同条目。

若该主机名同时命中 `fallback-filter` 的 domain、文档已标明废弃并请改用 nameserver-policy 的 geosite 用法，或 fake-ip 的规则模式，下一步应回到这些字段看查询路径。`respect-rules` 表示 dns 连接遵守路由规则，需配置 `proxy-server-nameserver`，强烈不建议和 `prefer-h3` 一起使用。准备阶段把这些开关一并记下，作为是否适合做静态映射的基线。

https://wiki.metacubex.one/config/dns/
