---
title: "Clash 设置 DNS 转发前怎样画出请求路径"
description: "Clash 设置 DNS 转发前怎样画出请求路径。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

在把查询转发到 `nameserver`、`fallback`、策略上游或带 `#` 附加参数的服务器之前，应先按手册把一次请求可能经过的节点画成路径。路径不是界面流程图，而是字段优先级和职责分工。漏画 `default-nameserver` 或 `proxy-server-nameserver`，后续容易落入手册所说的鸡蛋问题。画不清就不要下发转发配置。

## 适用条件

适用于准备把 `enable` 设为 true、让查询进入 mihomo DNS 而不是系统 DNS 的场景。`listen` 表示 DNS 服务监听，支持 udp、tcp，路径起点是进入该监听之后的处理。若仍计划 `enable` 为 false，路径应停在系统 DNS，无需画转发。`respect-rules` 为 true 时，DNS 连接遵守路由规则，手册要求配置 `proxy-server-nameserver`，且强烈不建议与 `prefer-h3` 一起使用；这一分支必须单独标出。`enhanced-mode`、`fake-ip-range` 只说明应答如何映射，不是上游本身，不要画成转发目标。

## 按字段优先级画出路径

建议固定顺序，避免把并行字段画成任意跳转。第一段：`use-hosts`（默认 true）是否回应配置中的 hosts，`use-system-hosts`（默认 true）是否查询系统 hosts。第二段：`nameserver-policy`，键支持域名通配，值支持字符串或数组，可使用 geosite，且优先于 nameserver/fallback。第三段：未命中策略时的默认 `nameserver`，以及 `fallback` 后备解析；配置 fallback 后默认启用 `fallback-filter`。过滤条件包括 geoip、geoip-code（默认 CN）、已废弃的 geosite、ipcidr、domain。匹配 geosite 或 domain 的名字会只使用 fallback、不去使用 nameserver；geoip-code 对应国家的结果直接采用，其他 IP 视为污染。第四段：出口分工。`proxy-server-nameserver` 仅用于解析代理节点域名，不填则遵循 policy、nameserver 和 fallback；`proxy-server-nameserver-policy` 仅当前者不为空时生效。`direct-nameserver` 用于 direct 出口域名，`direct-nameserver-follow-policy` 默认不遵守 policy。第五段：解析上游主机名必须经过 `default-nameserver`，且必须为 IP。nameserver 若写成 `https://doh.pub/dns-query` 这类形式，先由 default 解析该域名，再向该上游转发。附加参数用 `#` 追加、`&` 连接；优先使用已有代理，不存在该名称则指定接口；`#RULES` 等同 respect-rules。手册写明如需经过代理查询，应配置 proxy-server-nameserver，以防鸡蛋问题。示例形态为 `https://8.8.8.8/dns-query#proxy&ecs=1.1.1.1/24&ecs-override=true`。

## 判断路径是否画全以及失败下一步

判断依据：图上是否能回答谁解析 DNS 服务器域名、谁解析节点域名、谁解析 direct 域名、策略未命中时谁应答、污染时是否改用 fallback。若某条上游带 `#proxy`，必须画出该代理名称对应的节点域名如何被 proxy-server-nameserver 解析。`h3` 强制 HTTP/3，与 prefer-h3 不冲突，但只改变 DoH 连接方式，不替代节点解析字段。失败下一步：缺 default 则补 IP 上游；缺 proxy-server-nameserver 却走代理或 respect-rules，则按手册补上；图中若仍有 fallback-filter.geosite，改为 nameserver-policy。disable-ipv4、disable-ipv6、disable-qtype 只丢弃特定回应，不要画成另一条上游。路径无法闭合时，停止设置转发。

资料：https://wiki.metacubex.one/config/dns/
