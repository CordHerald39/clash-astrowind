---
title: "Clash 只有一个网站打不开怎样缩小问题范围"
description: "Clash 只有一个网站打不开怎样缩小问题范围。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

只有一个网站打不开、同一环境下其他站点正常时，应把问题收窄到“该站点相关请求命中了哪一类规则、哪一个出站”，而不是先改整份规则。官方路由规则按从上到下的顺序匹配，列表顶部优先级更高；`MATCH` 匹配所有剩余请求。缩小范围的核心，是确认失败请求在落到 `MATCH` 之前，有没有被域名规则、GEOSITE 或 IP 类规则提前接走。

## 适用条件

适用于 `rules` 已加载、运行方式为按规则匹配，并且可以稳定复现“仅某一站点失败”的情况。若所有站点一起失败，不属于本范围。可对照的类型包括 `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`DOMAIN-WILDCARD`、`DOMAIN-REGEX`、`GEOSITE`、`GEOIP`、`IP-CIDR`、进程、端口、逻辑规则与 `RULE-SET`。判断应基于请求实际使用的主机名或 IP，而不是页面标题文字。

## 按规则类型区分域名匹配与 IP 匹配

先分清失败的是主机名还是已经变成 IP。`DOMAIN` 匹配完整域名。`DOMAIN-SUFFIX` 匹配域名后缀：文档示例中，`google.com` 匹配 `www.google.com`、`mail.google.com` 和 `google.com`，但不匹配 `content-google.com`。主域名能对上后缀、实际请求却多了一段前缀或拼写不同，就会漏匹配。`DOMAIN-KEYWORD` 做关键字匹配，容易过宽或过窄。`DOMAIN-WILDCARD` 仅支持 `*` 和 `?`，`*` 匹配零个或多个字符，`?` 匹配一个字符，且与配置文件其他地方的 Clash 格式通配符不相同。`DOMAIN-REGEX` 按正则匹配。

若列表中存在 `IP-CIDR`、`IP-CIDR6`、`IP-SUFFIX`、`IP-ASN`、`GEOIP`，失败也可能发生在解析之后。`no-resolve` 仅支持关于目标 IP 的规则：域名开始匹配目标 IP 规则时，mihomo 将触发 DNS 解析来检查目标 IP；可以选择 `no-resolve` 以跳过解析。但如在更早的匹配中已经触发解析，则依旧会匹配到添加了 `no-resolve` 的目标 IP 类规则。缩小范围时，可把该站点完整主机名写成一条 `DOMAIN` 放在列表顶部观察：若只有 IP 类规则能解释结果，说明关键在解析结果或 GEOIP/ASN，而不是页面上的域名字符串。`GEOSITE` 匹配 Geosite 内的域名；`GEOIP` 匹配 IP 所属国家代码。文档中的拒绝示为 `DOMAIN,ad.com,REJECT`，若该站被写成拒绝，也会表现为打不开。

## 用优先级排除被提前截走的请求

即使后面有正确的代理策略，只要上面先命中更宽的 `DOMAIN-KEYWORD`、`GEOSITE` 或 `MATCH`，就不会走到预期行。`MATCH` 无需条件，通常应放在最后。具体操作是：把该站点完整主机名写成临时 `DOMAIN` 放到顶部，出站分别改为 DIRECT 与原代理策略各看一次。若顶部 DIRECT 可打开而原位置失败，说明下方规则或策略组把它截走或送错出口；若顶部代理仍然失败，则更宜怀疑出站协议或目标站本身，而不是“没有规则”。

文档说明：如请求为 udp，而代理节点没有 udp 支持（例如 ss 节点没写 `udp: true`），则会继续向下匹配。仅网页 TCP 正常、该站部分通道走 UDP 时，会出现“别的站好、这个站不行”。可用 `NETWORK,udp` 与 `DST-PORT` 限制观察。逻辑规则需要注意括号，例如 `AND,((DOMAIN,baidu.com),(NETWORK,UDP)),DIRECT`。复合条件写错时，也可能只让某一个域名的特定协议被拒绝。进程类规则按发起进程分流；仅某一客户端访问该站失败时，应核对 `PROCESS-NAME` 或 `PROCESS-PATH`。Android 上 `PROCESS-NAME` 可以匹配包名。

## 失败时下一步

若顶部精确 `DOMAIN` 已指向可用出站仍然失败，应停止继续堆关键字，改为检查该请求是否命中 `IP-CIDR`（含 `no-resolve` 行为）、`GEOIP`、`RULE-SET` 或最终 `MATCH`。`RULE-SET` 需配置 rule-providers。`SUB-RULE` 会匹配至子规则，同样要注意括号。规则类型与优先级已经能解释命中结果后仍无法打开，问题已超出“单站规则未命中”，应转向出站是否支持所需协议，以及解析得到的 IP 是否被 CIDR 或 GEOIP 改写，而不是再扩大 `DOMAIN-KEYWORD` 的匹配面。

资料来源：https://wiki.metacubex.one/config/rules/
