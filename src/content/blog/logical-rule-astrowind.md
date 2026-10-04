---
title: "Clash 复杂匹配条件怎样先拆成简单规则"
description: "Clash 复杂匹配条件怎样先拆成简单规则。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件：复杂判断必须能映射成单一类型

把复杂匹配条件先拆成简单规则，前提是每个子判断都能对应路由规则里已经出现的一种类型，例如 `DOMAIN`、`NETWORK`、`DST-PORT`、`IP-CIDR` 或进程类规则。适用场景是：你准备用 `AND`、`OR`、`NOT` 组装，或把其中一段交给 `SUB-RULE`；并且整份 `rules` 仍按从上到下匹配、顶部优先。手册把逻辑规则写成 `LOGIC_TYPE,((payload1),(payload2)),Proxy`，payload 为规则类型和其他 payload，如 `DOMAIN,google.com`。因此拆分的目标是得到这些合法 payload，而不是得到一句更长的自然语言。若某个想法在该页没有对应类型，不能靠拆分发明新匹配器。

## 具体操作：先原子化，再装进括号

先把目标拆成互不嵌套的事实，再用手册示例做模板。例如“完整域名是 baidu.com 并且是 UDP 则直连”，原子是 `DOMAIN,baidu.com` 与 `NETWORK,UDP`，组装为 `AND,((DOMAIN,baidu.com),(NETWORK,UDP)),DIRECT`。“UDP 或该域名则拒绝”使用同样两个原子，组装为 `OR,((NETWORK,UDP),(DOMAIN,baidu.com)),REJECT`。“不是该完整域名则走 PROXY”只保留一个原子，组装为 `NOT,((DOMAIN,baidu.com)),PROXY`。若只是按网络类型进入另一套列表，使用 `SUB-RULE,(NETWORK,tcp),sub-rule`。

每个原子要符合该类型自己的定义，不要把定义留到逻辑层去“凑”。`DOMAIN` 匹配完整域名。`DOMAIN-SUFFIX` 按手册：`google.com` 匹配 `www.google.com`、`mail.google.com` 和 `google.com`，不匹配 `content-google.com`。`DOMAIN-WILDCARD` 仅支持 `*` 和 `?`，`*` 匹配零个或多个字符，`?` 匹配一个字符，且与配置文件其他地方的 Clash 格式通配符不相同。`NETWORK` 只匹配 `tcp` 或 `udp`。`no-resolve` 与 `src` 仅支持关于目标 IP 的规则：前者跳过本条触发的 DNS 解析，后者把目标 IP 匹配转为来源 IP 匹配。这两类附加参数应留在对应的简单 IP 规则上，不能写在 `AND` 关键字旁边。

拆完后做一次抽检：任意一对括号里的内容拿出来，都应能当成普通规则的前半段。最后把整条逻辑规则放在 `MATCH` 之前，因为 `MATCH` 匹配所有剩余请求、无需条件。

## 判断依据与失败时下一步

判断拆分是否完成，看每个 payload 是否只含一个手册类型、组合层是否只使用 `AND`/`OR`/`NOT`、括号是否与示例一致，以及通配或正则是否留在对应的 `*-WILDCARD`、`*-REGEX` 简单规则里。

失败时下一步：无法解析时，对照 `AND,((DOMAIN,baidu.com),(NETWORK,UDP)),DIRECT` 恢复括号与逗号，不要用顿号连接类型名。可以解析但命中面不对时，先把其中一条简单规则单独放入 `rules`，看它在优先级链中的位置，再装回逻辑层。UDP 请求在节点没有 UDP 支持时会继续向下匹配，不要把“继续匹配”误判成拆分失败。`RULE-SET` 只能作为引用集合的简单规则，且需配置 `rule-providers`；`GEOSITE`、`GEOIP` 的载荷也只是集合名或国家代码，不能把未拆干净的复合条件塞进去。

资料来源：https://wiki.metacubex.one/config/rules/
