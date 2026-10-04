---
title: "Clash 域名解析排查从哪里开始"
description: "Clash 域名解析排查从哪里开始。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件：何时从 DNS 配置开始查

当 Clash（mihomo）出现“域名解析不到、解析结果异常、或解析后仍无法打开站点”时，应先核对配置文件里的 `dns` 段，而不是先改规则或节点。官方说明给出明确前提：`enable` 为 `false` 时使用系统 DNS，后续 `nameserver`、`fallback`、策略均不生效；`default-nameserver` 必须是 IP，用于解析 DNS 服务器自身的域名。若这两项与当前场景不符，后面的加密 DNS、策略分流都无从谈起。

适用场景还包括：只对部分域名失败、IPv6 相关失败、节点域名解析失败、直连出口解析与代理出口不一致。判断是否属于本路径：IP 直连或代理本身可用，但主机名无法变成可用地址，或得到的地址明显不符合预期（例如不该出现的内网段、被文档称为污染的结果）。

## 按官方字段顺序核对

第一步看 `enable` 与 `default-nameserver`。`enable` 未开则整段 DNS 被跳过。`default-nameserver` 写成域名会导致无法引导解析 DoH/DoT 服务器。此项必须为 IP，也可为加密 DNS 的 IP 形式。

第二步看 `enhanced-mode`。可选 `fake-ip` 或 `redir-host`（默认后者）。`fake-ip` 会在 `fake-ip-range`（文档示例为 `198.18.0.1/16`）内下发映射，并受 `fake-ip-filter` 与 `fake-ip-filter-mode`（blacklist / whitelist / rule）约束。blacklist 下匹配过滤项的域名不会下发 fake-ip；rule 模式时过滤写法与路由规则类似，可指定 fake-ip 或 real-ip。判断依据：目标域名是否命中过滤列表或规则集合。

第三步看 `nameserver-policy`。它优先于 `nameserver`/`fallback`，键支持域名通配，值可为字符串或数组，也可配合 geosite。若域名已被策略指定服务器，不必再按默认列表理解结果。

第四步对照 `nameserver` 与 `fallback`。配置 `fallback` 后默认启用 `fallback-filter`，`geoip-code` 默认为 CN。nameserver 得到非该国 IP、命中 `ipcidr`、或命中 `domain` 列表的域名，会改用 fallback 或只走 fallback。文档写明 `geosite` 字段已废弃，应改用 `nameserver-policy`。匹配 geosite（旧写法）或 `domain` 的域名会跳过 nameserver、直接 fallback。

第五步看 `respect-rules`、`proxy-server-nameserver`、`direct-nameserver`。`respect-rules` 让 DNS 连接遵守路由规则，必须同时配置 `proxy-server-nameserver`，否则可能无法解析节点域名。官方强烈不建议与 `prefer-h3` 一起使用。节点域名只看 `proxy-server-nameserver` 及对应 policy；直连出口看 `direct-nameserver` 与 `direct-nameserver-follow-policy`。

第六步看 `ipv6`、`use-hosts`、`use-system-hosts`。`ipv6: false` 时对 AAAA 回应空解析。hosts 两项为 true 时会覆盖或抢先回应。

## 判断依据与失败后的下一步

判断某一步是否构成原因，以配置字面值对照官方语义：`default-nameserver` 是否全是 IP；策略键是否覆盖目标域名；fallback-filter 的 geoip、ipcidr、domain 是否把当前结果判为不可信；fake-ip-filter 是否阻止下发映射。不要依据未在配置中出现的界面名称。

若仍无法定位：节点域名失败则只改 `proxy-server-nameserver`；直连失败则只改 `direct-nameserver`；普通站点则把该域名单独写入 `nameserver-policy` 做隔离。仍失败可将 `enable` 临时设为 `false` 对比系统 DNS，或检查附加参数（指定代理、`ecs`、`disable-ipv4`/`disable-ipv6`）。修改前保留原 `dns` 片段。

https://wiki.metacubex.one/config/dns/
