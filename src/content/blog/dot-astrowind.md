---
title: "Clash 使用 DoT 前怎样检查服务器信息"
description: "Clash 使用 DoT 前怎样检查服务器信息。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件

在把 Clash 上游写成 DoT 之前，先核对该服务器将以何种地址出现、写入哪一个 DNS 列表、证书校验如何表述。手册用 `tls://` 表示这类服务器，示例出现在 `fallback` 中。本节不把 HTTPS 查询路径当成 DoT，也不把 `prefer-h3`、`h3` 当成 DoT 专用项：文档将 `prefer-h3` 说明为 DoH 优先使用 HTTP/3，将 `h3` 说明为强制 HTTP/3 建立 DoH 连接。

适用前提是 `dns.enable` 为 true。为 false 则使用系统 DNS，预先检查 DoT 没有配置意义。若地址带主机名而不是纯 IP，还要满足 `default-nameserver`：用于解析 DNS 服务器的域名，必须为 IP，可为加密 DNS。`nameserver-policy` 会优先于 `nameserver`/`fallback`，因此“准备写进默认列表”并不等于所有域名都会使用该 DoT。

## 使用前要检查的服务器信息

第一，记录 URI 方案与主机。DoT 条目应以 `tls://` 开头。官方示例未在地址后附加额外方案字段；若你自行在主机后写了端口，应把“主机与端口的完整写法”原样保存，以便和示例中未写额外端口字段的形式对照。手册没有记载未写出的默认端口，不能把未出现的端口数字当成已给出的服务器信息。

第二，确认条目将写入哪一类列表。`nameserver` 是默认解析服务器；`fallback` 是后备服务器，配置后默认启用 `fallback-filter`；`nameserver-policy` 按域名指定服务器；`proxy-server-nameserver` 只解析代理节点域名；`direct-nameserver` 用于 direct 出口。同一 `tls://` 地址放错列表，实际查询路径就不同。`proxy-server-nameserver-policy` 格式同 nameserver-policy，仅当 `proxy-server-nameserver` 非空时生效。

第三，检查证书相关附加参数。向公网 DNS 追加参数使用 `#`，多个参数用 `&` 连接。`skip-cert-verify` 表示跳过 TLS 证书验证；`name-cert-verify` 仅修改证书 DNSName 校验目标，不修改 SNI。使用前应写明：是否跳过校验、DNSName 目标是什么、SNI 是否保持未改。

第四，检查连接路径与记录类型。DNS 可指定代理或接口：优先使用已有代理，不存在该名称则指定接口；`#RULES` 表示遵守路由规则，等同 `respect-rules`。经代理查询时应配置 `proxy-server-nameserver`，以防鸡蛋问题。`ipv6` 为 false 时回应 AAAA 空解析；还可使用 `disable-ipv4`、`disable-ipv6` 或 `disable-qtype-<int>`。

## 判断依据与检查失败时下一步

可以开始写入 DoT 的依据：方案为 `tls://`；列表位置与用途一致；主机名可被作为 IP 的 `default-nameserver` 解析；证书参数已按手册区分 DNSName 与 SNI；未把 `prefer-h3`/`h3` 误当作 DoT 传输开关。

若信息不全：缺少方案或主机时，先补全 `tls://` 条目。主机名无法对应 IP 时，先修正 `default-nameserver`。证书主体与名称可能不一致时，只能在理解 `skip-cert-verify` 与 `name-cert-verify` 的前提下决定是否追加，手册未提供另外的向导字段。连接必须遵守路由时，同时准备 `respect-rules` 与 `proxy-server-nameserver`，且不要与 `prefer-h3` 组合——即便当前条目是 DoT，全局 `prefer-h3` 仍作用于 DoH。`use-hosts`、`use-system-hosts` 默认 true，检查服务器信息时避免把 hosts 命中误判为 DoT 应答。

参考资料：https://wiki.metacubex.one/config/dns/
