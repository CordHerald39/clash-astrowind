---
title: "Clash 排查 IPv6 前怎样记录网络环境"
description: "Clash 排查 IPv6 前怎样记录网络环境。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件

排查 IPv6 前必须先保存当前 DNS 环境。官方写明：enable 为 false 时使用系统 DNS；ipv6 为 false 时对 AAAA 返回空解析；enhanced-mode 可选 fake-ip 或 redir-host。适用条件是能读取生效配置，现象为 AAAA 为空或 fake-ip 没有 IPv6 段，且还没改 DNS。记录期间不要改路由，也不要换节点。

## 按组抄录与判断依据

先抄总开关：enable、listen、cache-algorithm（lru 或 arc）、prefer-h3、use-hosts、use-system-hosts、respect-rules。判断依据：enable 关闭则 nameserver 不是实际路径；respect-rules 为 true 时 DNS 遵守路由规则，需配置 proxy-server-nameserver，且强烈不建议与 prefer-h3 同用。listen 用于确认查询是否进入 Clash DNS。

再抄地址族：ipv6、enhanced-mode、fake-ip-range、fake-ip-range6、fake-ip-filter、fake-ip-filter-mode、fake-ip-ttl。判断依据：ipv6 为 false 会空回应 AAAA；fake-ip 的 IPv6 段由 fake-ip-range6 设置，文档示例中该键可能仍是注释。filter-mode 为 blacklist、whitelist 或 rule；rule 时写法与路由 rules 一致，动作为 fake-ip 或 real-ip。

再抄链路：default-nameserver 必须为 IP；nameserver-policy 优先于 nameserver 与 fallback；并抄 fallback-filter 的 geoip、geoip-code、ipcidr、domain。判断依据：配置 fallback 后默认启用过滤，geoip-code 默认 CN；geosite 已废弃，应改用 nameserver-policy。节点域名看 proxy-server-nameserver，直连看 direct-nameserver。

最后抄附加参数：公网 DNS 用 # 附加、& 连接。记录 disable-ipv4、disable-ipv6、disable-qtype- 加类型号、ecs。判断依据：disable-ipv6 丢弃 AAAA，须写明落在哪一条服务器。多条 nameserver 要按顺序编号。保存键、值、是否注释和记录时间，完成前不要改配置。

## 记录失败时的下一步

读不到文件时，先确认进程实际加载路径。键名以官方 DNS 配置页为准。enable 为 false 时，下一步记录系统 DNS。已出现 ipv6 为 false 或 disable-ipv6 时，下一步把空 AAAA 当作配置结果，而不是先怀疑节点。基线未保存前，不要试验 respect-rules 与 prefer-h3。

资料：https://wiki.metacubex.one/config/dns/
