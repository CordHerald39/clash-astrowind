---
title: "Clash 规则源文件的格式怎样与配置对应"
description: "Clash 规则源文件的格式怎样与配置对应。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash（mihomo）里规则源要能一对一落到配置的 `rules` 列表。本页给出的对应方式是：每一项为 YAML 序列中的一条字符串，形态为「类型,载荷,出站[,附加参数]」。若源是规则集合，配置行应写成 `RULE-SET,providername,proxy`，并需配置 `rule-providers`。未带类型名的纯域名或纯 IP 清单，还不能算已经与配置对应。

## 适用条件

适用于主配置中的 `rules` 字段，以及准备把外部内容改写成该列表、或改写成 `RULE-SET` 引用的情形。判断「已经对应」的依据是：行首类型出现在本页类型列表；载荷符合该类型的匹配对象；出站在载荷之后；`MATCH` 无需条件；`AND`/`OR`/`NOT` 与 `SUB-RULE` 的括号与文档一致。不适用于把说明文字、表格或自造类型名直接写入列表。优先级从上到下，源文件行序就是匹配序，顶部高于底部。

## 普通规则行如何与文档字段对齐

以文档总表示例从左到右核对四段：

1. 类型名必须与标题一致，如 `DOMAIN`、`DOMAIN-SUFFIX`、`GEOSITE`、`IP-CIDR`、`GEOIP`、`DST-PORT`、`PROCESS-NAME`、`NETWORK`。`IP-CIDR6` 是 `IP-CIDR` 的别名且效果相同，只表示同一类地址范围，不表示可以改载荷含义。
2. 载荷必须是该类型所匹配的对象：完整域名、后缀、关键字、通配、正则、Geosite 名、CIDR、IP 后缀、ASN、国家代码、端口范围、入站类型或名称、进程路径或名称、`tcp` 或 `udp`、Linux UID 等。
3. 出站是第三段，示例中的 `REJECT`、`DIRECT`、`PROXY`、`auto` 表示命中后的策略，不是匹配条件。
4. 附加参数只有 `no-resolve` 与 `src`，且仅支持关于目标 IP 的规则，写在出站之后，例如 `IP-CIDR,127.0.0.0/8,DIRECT,no-resolve`。

`DOMAIN-WILDCARD`、`PROCESS-PATH-WILDCARD`、`PROCESS-NAME-WILDCARD` 仅支持 `*` 与 `?`，并且这里的通配符和配置文件其他地方的 Clash 格式通配符不相同。源文件若沿用另一套通配习惯，不能视为已对应。

## 集合引用和逻辑规则怎样对应

`RULE-SET` 对应三个字段：类型本身、集合名、出站。集合名要能在 `rule-providers` 中找到。不能把集合名当作 `DOMAIN` 载荷，也不能省略出站。逻辑规则形态为 `LOGIC_TYPE,((payload1),(payload2)),Proxy`，其中 payload 是规则类型和其他 payload，如 `DOMAIN,baidu.com`。`SUB-RULE,(NETWORK,tcp),sub-rule` 表示匹配至子规则。两类都需要注意括号；层数不对或内层缺少类型名，即尚未对应到配置。

## 对应失败时下一步

先按逗号拆行，看是否缺少类型或出站。类型不在列表中就改成文档中的名称。载荷与类型分属不同小节时，只改其中一侧使二者同节。`RULE-SET` 对不上时，核对该名称是否已配置 `rule-providers`，不要把集合正文塞进第二段。逻辑规则先补齐文档中的双层括号，再确认内层仍是「类型,载荷」。`MATCH` 去掉多余条件。附加参数若出现在非目标 IP 规则上，移到 `IP-CIDR`、`IP-SUFFIX`、`IP-ASN`、`GEOIP` 等行或删除。

https://wiki.metacubex.one/config/rules/
