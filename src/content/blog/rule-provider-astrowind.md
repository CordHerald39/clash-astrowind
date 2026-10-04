---
title: "Clash 使用规则集合前怎样核对格式与引用"
description: "Clash 使用规则集合前怎样核对格式与引用。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件：使用前要核对的两块内容

Clash（mihomo）在 `rules` 里用 `RULE-SET` 引用规则集合，官方写明「引用规则集合，需配置 rule-providers」。使用前要核对的不是集合「看起来有没有」，而是两块能否对上：`rules` 中那一行的格式，以及该行引用的名字是否对应已经配置的 `rule-providers`。适用条件是：你准备让一部分匹配条件来自规则集合，而不是把整份列表都写成 `DOMAIN`、`IP-CIDR` 等单条规则。

本页给出的示例为 `- RULE-SET,providername,proxy`。三个字段依次是规则类型、集合名、命中后的策略。缺少 `rule-providers`、集合名对不上、或该行根本不在 `rules` 列表里，都不算引用成立。规则按从上到下的顺序匹配，列表顶部优先级更高。`MATCH` 匹配所有请求且无需条件，`RULE-SET` 必须出现在 `MATCH` 之前才可能被执行。

## 按官方示例核对行格式与名字

打开当前配置中的 `rules` 列表，找到准备使用的那一行，按示例逐项对照。第一段必须是 `RULE-SET`，不要写成 `GEOSITE`、`SUB-RULE`，也不要写成逻辑规则 `AND` / `OR` / `NOT`。第二段是 `providername`，它必须是 `rule-providers` 里已经存在的名字，而不是策略名、入站名或进程名。第三段是命中该集合后走的策略，示例中写作 `proxy`，应换成你实际要去的出站或策略名。

不要把附加参数套到错误对象上。`no-resolve` 与 `src` 仅支持关于目标 IP 的规则；本页的 `RULE-SET` 示例没有在该行附加这些参数。逻辑规则需要注意括号，形式为 `LOGIC_TYPE,((payload1),(payload2)),Proxy`，不能把 `RULE-SET` 的三个字段拆进未配对的括号里凑合使用。`SUB-RULE` 是匹配至子规则，同样需要注意括号，与 `RULE-SET` 不是同一写法。

核对引用时，以名字完全一致为判断依据：`RULE-SET` 第二段与 `rule-providers` 中的配置名相同，才算引用到同一集合。只配置了 `rule-providers` 但 `rules` 里没有对应 `RULE-SET` 行，集合不会进入匹配。只写了 `RULE-SET` 行但未配置 `rule-providers`，不满足官方要求。第二段与第三段也不要互换：中间是集合名，末尾是策略。官方优先级不会因为类型是 `RULE-SET` 就自动提前，格式正确的行若写在 `MATCH` 或极宽规则之后，启用后仍可能看不到。

## 判断依据与失败时下一步

判断依据：`rules` 中能看到完整的 `RULE-SET,名字,策略`；该名字能在 `rule-providers` 中找到；该行位于 `MATCH` 之上；没有把集合名写成策略名，也没有把策略名写成集合名。

失败时下一步：若类型写成了 `GEOSITE` 或其它规则类型，改回 `RULE-SET`。若第二段名字与 `rule-providers` 不一致，只改其中一侧到完全相同，不要同时改成两个新名字。若该行在 `MATCH` 之后，上移到 `MATCH` 之前。若误把 `RULE-SET` 写进代理组或其它非 `rules` 列表，移回 `rules`。仍无法确认时，先保留官方示例的三段结构，只替换名字和策略，不要额外插入未在本页出现的字段。

https://wiki.metacubex.one/config/rules/
