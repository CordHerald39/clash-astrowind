---
title: "Clash 手动填写 HTTP 代理地址时怎样核对端口"
description: "Clash 手动填写 HTTP 代理地址时怎样核对端口。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

手动把 HTTP 代理填进浏览器、系统或单个应用时，必须核对的是 Clash 当前真正在听的 HTTP（或 mixed）入站端口，而不是印象中的数字，也不是外部控制 API 的端口。端口或地址任一处不一致，客户端会连到空端口或其他进程，表现为连接拒绝或代理无响应。下面只依据官方全局配置，说明适用条件、核对步骤和失败后的处理。

## 适用条件

本说明适用于内核已按配置启动，并且准备把 HTTP 代理主机、端口写进客户端的场景。官方全局配置把 http(s)、socks、mixed 作为代理入站，并可用 `authentication` 做用户验证；`skip-auth-prefixes` 用于指定哪些 IP 段跳过验证。`allow-lan` 表示是否允许其他设备经过 Clash 的代理端口访问互联网；`bind-address` 决定绑定 `"*"`（所有 IP）、单个 IPv4 还是单个 IPv6；`lan-allowed-ips` 默认包含 `0.0.0.0/0` 与 `::/0`，`lan-disallowed-ips` 为黑名单且优先于白名单。`ipv6` 控制内核是否接受 IPv6 流量。`external-controller` 示例为 `127.0.0.1:9090`，那是 RESTful API，不是 HTTP 代理端口。

若配置里没有启用 HTTP 或 mixed 入站、内核未运行，或你只打算访问 API / 外部用户界面，则不属于“核对 HTTP 代理端口”。其他设备要填代理时，还必须满足 `allow-lan` 与地址段条件，不能只核对本机端口数字。

## 核对端口的具体步骤

第一步，打开正在生效的配置，找出 HTTP 或 mixed 代理入站的监听端口，把数字完整抄下来。不要把 SOCKS 入站端口填进“HTTP 代理”栏，也不要使用 `external-controller`、`external-controller-tls` 或文档中的 Unix socket、named pipe 地址。

第二步，核对主机是否落在绑定范围内。`bind-address` 为 `"*"` 时，本机一般使用回环地址即可；若只绑定了某一个 IPv4 或 IPv6，客户端必须填写该地址。本机填未被绑定的网卡地址，或在 `ipv6` 为 false 时填 `::1`，端口数字正确也会失败。

第三步，核对访问来源。本机回环与“其他设备经代理端口上网”不是同一条件：后者需要 `allow-lan` 为 true，源 IP 落在 `lan-allowed-ips` 内且不被 `lan-disallowed-ips` 排除。来源被黑名单挡住时，容易误判成端口写错。

第四步，核对鉴权是否被当成“端口错误”。配置了 `authentication` 时，来源若不在 `skip-auth-prefixes` 内，客户端必须带上对应用户名和密码。文档默认跳过 `127.0.0.1/8` 与 `::1/128`。局域网设备不在跳过列表里却未填凭据，连接会被拒绝。

第五步，把客户端里的协议、主机、端口三列与上面结果逐项对照：协议为 HTTP 代理（mixed 入站才同时兼容其支持的多种代理协议），主机为已绑定且你有权使用的地址，端口与入站端口完全一致。

## 判断依据以及失败后的下一步

可以认为端口已核对无误的依据是：客户端端口与 HTTP/mixed 入站端口一致；主机在 `bind-address` 监听范围内；跨设备时 `allow-lan` 与 IP 名单允许该来源；鉴权与 `authentication`、`skip-auth-prefixes` 一致；没有误用 API 端口。

若对照后仍不能连接，把 `log-level` 设为 `info` 或 `debug`，在控制台或控制页面查看是否出现入站、绑定失败或鉴权失败。没有任何入站记录时，应检查地址、端口和绑定，而不是改运行模式。日志显示连接已到达但立即断开时，优先查用户验证和 `lan-disallowed-ips`。若发现该端口上根本没有 HTTP 或 mixed 入站，应回到配置检查入站是否生效。`mode` 为 `rule`、`global` 或 `direct` 只影响如何出站，不能用来证明端口填对了。

https://wiki.metacubex.one/config/general/
