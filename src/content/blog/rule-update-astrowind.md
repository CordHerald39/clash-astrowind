---
title: "Clash 怎样安排规则集合的更新时间"
description: "Clash 怎样安排规则集合的更新时间。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

规则集合要进入匹配，必须写进 `rules`。官方形式是 `RULE-SET,providername,proxy`，并写明需配置 `rule-providers`。同一页还规定：规则将按照从上到下的顺序匹配，列表顶部的规则优先级高于其底下的规则。本页没有给出集合刷新间隔、时钟字段或示例数值，因此不能把秒数、定时表达式或界面条目当作官方步骤。能够安排的，是让“集合内容发生变化的那一时刻”与“请求真正命中 `RULE-SET` 的那一步”对齐。下面只依据该页能核对的内容，说明适用条件、放置步骤、更新瞬间的附加约束和失败后的下一步。

## 适用条件

本文只适用于已经或准备使用 `RULE-SET` 的配置。要处理的问题是：集合在某一时刻换成新内容后，请求会落到哪个出站。规则类型需能在官方列表中找到，例如 `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`DOMAIN-WILDCARD`、`DOMAIN-REGEX`、`GEOSITE`、`IP-CIDR`、`IP-CIDR6`、`IP-SUFFIX`、`IP-ASN`、`GEOIP`、`RULE-SET`、`AND`、`OR`、`NOT`、`SUB-RULE` 以及 `MATCH`。`MATCH` 匹配所有请求、无需条件，写在它后面的集合不会在任何时刻生效。若配置中没有规则集合引用，或问题纯粹是寻找本页未记载的间隔键名，则不要在 `rules` 里自行添加时间参数。

## 按场景放置集合引用

拒绝类集合：官方示例将 `DOMAIN,ad.com,REJECT` 放在靠前位置。把对应 `RULE-SET` 放在同样需要优先拒绝的区段，并检查上方是否已有 `DOMAIN-KEYWORD` 或 `DOMAIN-REGEX` 会先吃掉相同名字。判断依据是顶部优先；更新只改集合内部条目，不改列表顺序。

代理类集合：官方示例出现 `DOMAIN-SUFFIX,google.com,auto` 和 `GEOSITE,youtube,PROXY`。将代理类 `RULE-SET` 放在需要更精确的后缀或 Geosite 之后、`MATCH,auto` 之前。判断依据是：更精确的规则若排在集合前面，更新后的宽泛条目不会抢走这些名字；若集合排在 `MATCH` 之后，则任何更新时刻都不会被匹配到。

地址类集合：域名开始匹配关于目标 IP 的规则时，会触发 DNS 解析；可使用 `no-resolve` 跳过解析。若更早的匹配已触发解析，则依旧会匹配到带 `no-resolve` 的目标 IP 类规则。`src` 会把目标 IP 匹配转为来源 IP 匹配。在计划中的更新点前，确认集合引用附近的 IP 规则有没有改变解析时机或匹配方向。判断依据是解析是否已经发生，而不是去对照本页并不存在的时钟字段。

## 更新瞬间的 UDP 与逻辑规则

如请求为 udp，而代理节点没有 udp 支持，则会继续向下匹配。集合即使在访问前完成更新，UDP 仍可能跳过集合给出的出站，落到更下方的直连、拒绝或 `MATCH`。逻辑规则格式为 `LOGIC_TYPE,((payload1),(payload2)),Proxy`，payload 为规则类型和其他 payload，必须注意括号。`SUB-RULE` 匹配至子规则，同样需要注意括号。括号错误时，更新时刻再合理也不会按预期切换。

## 失败时下一步

若预定时刻已过而策略不变，先核对 `RULE-SET` 名称是否对应已配置的 `rule-providers`，这是文档给出的引用前提。再从列表顶部模拟目标主机，看它在到达集合引用前是否已被 `DOMAIN`、`DOMAIN-SUFFIX`、`GEOSITE`、`GEOIP` 或 `MATCH` 命中。接着检查 UDP 是否导致继续向下匹配，以及 `no-resolve` 与 `src` 是否改变了 IP 类规则的生效方式。若仍然需要间隔多久拉取一次，停止猜测 `rules` 中的时间字段，改为查阅 `rule-providers` 的专门说明。

https://wiki.metacubex.one/config/rules/
