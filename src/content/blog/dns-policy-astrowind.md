---
title: "Clash 按域名选择 DNS 上游时怎样规划规则"
description: "Clash 按域名选择 DNS 上游时怎样规划规则。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

当需要让 Clash 按域名选择不同 DNS 上游时，应当把规则写在 `nameserver-policy` 中，而不是只改 `nameserver` 或事后用 `fallback-filter` 筛选。官方说明指出，`nameserver-policy` 用于指定域名查询的解析服务器，可使用 geosite，并且优先于 `nameserver` 与 `fallback` 查询。键支持域名通配，值支持字符串或数组。规划前必须确认 `dns.enable` 为 true，否则将使用系统 DNS，后续策略不会参与解析。`fallback-filter` 的 `geosite` 字段已废弃，同类“按集合选上游”的需求应改到 `nameserver-policy`。

## 适用条件

本规划适用于已经启用 Clash DNS，并且存在明确边界：某类域名必须询问指定上游，其余域名走默认列表。上游可以是加密 DNS 或普通地址。若 DNS 服务器本身写成域名，需要同时配置 `default-nameserver`；该项必须为 IP，也可为加密 DNS，专门用来解析 DNS 服务器的域名，不能拿来充当业务域名的选路表。业务域名、代理节点域名、直连出口域名是三条线，规划时要分开：节点解析使用 `proxy-server-nameserver` 与 `proxy-server-nameserver-policy`；直连出口解析使用 `direct-nameserver`。`direct-nameserver-follow-policy` 默认不遵守 `nameserver-policy`，且仅当 `direct-nameserver` 非空时生效。若还打算让 DNS 查询连接遵守路由规则，须同时准备 `respect-rules` 与 `proxy-server-nameserver`，否则无法按文档完成“按规则去问上游”。

## 按域名规划上游的步骤

第一步，按解析目的分组，例如反向解析、国内集合、必须固定上游的精确域名、以及其他默认查询。文档示例将 `+.arpa` 指向 `10.0.0.1`，将 `rule-set:cn` 指向多个 DoH 地址，可按同样结构拆组。第二步，为每组选择匹配键，可使用域名通配、geosite 或 `rule-set:` 引用。键应尽量互不重叠，因为文档只保证策略整体优先于 `nameserver` 与 `fallback`，并未给出多个策略键同时命中同一域名时的取舍细则。第三步，为每组填写上游：单台写成字符串，多台写成数组。第四步，把未命中策略的查询放到 `nameserver`；若仍需按结果是否可信再切换，再写 `fallback` 与 `fallback-filter`。`fallback-filter` 的 `domain` 语义是这些域名被视为已污染、将直接使用 `fallback`、不去使用 `nameserver`，不能当作通用的按域名选路表。`geoip`、`geoip-code`、`ipcidr` 作用于解析结果是否污染，同样不能代替按域名指定上游。第五步，若 DNS 查询连接需要遵守路由规则，将 `respect-rules` 设为 true，并配置 `proxy-server-nameserver`；文档强烈不建议其与 `prefer-h3` 一起使用。经代理查询时同样应配置 `proxy-server-nameserver`，以防出现鸡蛋问题。第六步，若直连出口也要跟随按域名策略，须填写 `direct-nameserver` 并将 `direct-nameserver-follow-policy` 设为 true。向公网服务器使用 `#proxy`、`#RULES`、`ecs` 等附加参数，只改变该条上游如何连接，不能替代策略键匹配。

## 判断依据与失败时下一步

判断依据：目标域名能够被 `nameserver-policy` 的键匹配时，应使用该键对应的解析服务器；不能匹配时，才进入 `nameserver` 与 `fallback` 流程。`proxy-server-nameserver-policy` 格式同 `nameserver-policy`，但仅用于节点域名解析，并且当且仅当 `proxy-server-nameserver` 不为空时生效。`default-nameserver` 不会成为业务域名的上游。`fallback-filter.domain` 命中只说明该域名被当作污染名单，不说明它已按策略选到了自定义上游。

若规划后域名仍未走预期上游，下一步依次检查：`enable` 是否为 true；策略键的通配、`rule-set:` 前缀以及值的字符串或数组形式是否符合文档；是否仍在使用已废弃的 `fallback-filter.geosite`；直连场景是否被非空的 `direct-nameserver` 且未打开 follow-policy 绕过；需要走代理访问上游时是否缺少 `proxy-server-nameserver`。先把“问谁”规划清楚，再处理路由如何连接该上游。

资料：https://wiki.metacubex.one/config/dns/
