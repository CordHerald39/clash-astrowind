---
title: "怎样阅读 Clash nameserver 列表"
description: "怎样阅读 Clash nameserver 列表。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

阅读 Clash（mihomo）的 `nameserver` 列表，是在识别默认域名解析服务器的每一条写法，以及它在整段 DNS 配置中的位置。官方把 `nameserver` 定义为默认的域名解析服务器。它是数组，可写多项，但不是唯一会被问到的列表，读的时候要把协议、地址、附加参数和相邻字段放在一起看。

## 适用条件

先看 `enable`：如为 `false`，则使用系统 DNS 解析，再精读 `nameserver` 也不能说明实际解析器。`listen` 表示 DNS 服务监听，支持 udp、tcp，列表只在查询进入该监听后才有意义。

`default-nameserver` 与 `nameserver` 职责不同。前者用于解析 DNS 服务器的域名，必须为 IP，可为加密 DNS。阅读 `nameserver` 时若条目是域名形式的加密 DNS，必须同时确认 `default-nameserver` 已是 IP，否则列表可读、连接仍无法建立。

`prefer-h3` 表示 DOH 优先使用 http/3。单项附加 `h3` 与它不冲突，填写后强制启用 HTTP/3 建立 DOH 连接，使用前需确保 DOH 服务器支持 HTTP/3。读到 DOH 条目时要把全局优先和单条强制这两层分开，不要把整个字符串当成普通主机名。

## 把每一项拆成地址与附加参数

阅读单条时，先认协议与地址，再认 `#` 后面的附加参数。官方说明：此部分可用于发向公网地址的 DNS 服务器，使用 `#` 附加，使用 `&` 连接不同的参数。除了指定代理或接口和 ecs，其余项的值均为 bool（true/false）。

按官方词义读参数，不要把代理名读成 DNS 主机。指定代理或接口时，优先使用已有代理，如果不存在该名称的代理则指定接口连接。`#RULES` 为遵守路由规则进行连接，等同于 `respect-rules`。如需经过代理查询，应配置 `proxy-server-nameserver`，以防出现鸡蛋问题。`h3` 强制 HTTP/3。`skip-cert-verify` 跳过 TLS 证书验证。`name-cert-verify` 仅修改证书 DNSName 校验目标，不修改 SNI。`ecs` 指定 dns 查询的 subnet 地址；`ecs-override` 强制覆盖。`disable-ipv4` 丢弃 A 回应；`disable-ipv6` 丢弃 AAAA 回应。`disable-qtype-<int>` 丢弃特定类型的回应，例如 `disable-qtype-65` 可以屏蔽 HTTPS（TYPE65）类型的 dns 解析。

官方示例把参数写在加密 DNS 地址后的 `#` 链上。阅读判断依据是：`#` 前是服务器，`#` 后是连接与查询行为。值为数组只表示可配置多台默认服务器，并不否定 `nameserver-policy` 的优先权。该政策指定域名查询的解析服务器，可使用 geosite，优先于 `nameserver`/`fallback` 查询，键支持域名通配，值支持字符串或数组。读完 `nameserver` 必须回头看政策键是否已把部分域名带走。

## 结合相邻字段阅读及失败时下一步

具体场景：看到两条默认服务器，又看到 `fallback` 若干条，需要判断列表在什么情况下会被采用。

步骤一，确认待查域名没有命中 `nameserver-policy`。步骤二，阅读 `fallback`：后备域名解析服务器，一般情况下使用境外 DNS，保证结果可信。配置后默认启用 `fallback-filter`。步骤三，按 filter 字段理解何时不用 `nameserver` 结果：`geoip` 是否启用；`geoip-code` 国家缩写默认 CN，该国结果直接采用，其他视为污染并采用 fallback；`ipcidr` 这些网段的结果会被视为污染；`domain` 匹配则直接使用 fallback。`geosite` 已废弃，请使用 `nameserver-policy`，不要按旧 geosite 污染列表解读当前 `nameserver`。`fallback-lazy-query` 默认 `false`，为 `true` 会先判断 nameserver 结果是否满足 filter 后再发起查询。

`proxy-server-nameserver` 是代理节点域名解析服务器，阅读 `nameserver` 时不要把节点域名解析混进默认列表的含义里。`direct-nameserver` 同理只服务 direct 出口。

若无法读出某条是否会被使用：检查 `respect-rules` 是否要求遵守路由规则；检查 `use-hosts`、`use-system-hosts` 默认 `true` 是否让查询根本不进列表；`cache-algorithm` 的 lru、arc 只说明缓存算法。下一步对照官方 DNS 配置整页，而不是改出站节点。

参考资料：https://wiki.metacubex.one/config/dns/
