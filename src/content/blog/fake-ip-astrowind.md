---
title: "Clash fake-ip 模式怎样阅读配置"
description: "Clash fake-ip 模式怎样阅读配置。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

阅读 Clash（mihomo）配置中的 fake-ip 模式，应把整个 dns 段当作独立模块来看，而不是与 proxies 或 rules 混在一起扫一眼。文档把 DNS 处理模式写在 enhanced-mode 字段，可选值为 fake-ip 或 redir-host，缺省是 redir-host。只有该字段被明确写成 fake-ip 时，内核才会给域名分配合成地址。

## 核对模式开关与网段定义
打开配置文件，先定位 dns.enhanced-mode。若值为 fake-ip，接着看 fake-ip-range。文档给出的示例是 198.18.0.1/16，该前缀同时被 TUN 入站用作默认 IPv4 地址的参考。若存在 fake-ip-range6，则 IPv6 使用对应前缀。判断依据是：enhanced-mode 字符串必须精确等于 fake-ip，且 range 落在文档示例或保留网段内。该键缺失、拼写错误或写成其他值时，内核按 redir-host 工作，客户端会直接拿到真实解析结果。同时必须确认 enable 为 true，否则完全使用系统 DNS，后续字段全部无效。

## 解析过滤器与三种匹配模式
fake-ip-filter 列出不会获得 fake-ip 映射的目标，支持域名通配以及引入域名集合。fake-ip-filter-mode 默认为 blacklist，命中则返回真实 IP；改为 whitelist 则只有命中才返回 fake-ip；设为 rule 时写法与路由规则一致，可使用 RULE-SET、GEOSITE、DOMAIN、DOMAIN-SUFFIX 以及最后的 MATCH,fake-ip 或 MATCH,real-ip，阅读必须自上而下。适用条件是需要排除 *.lan、内网主机，或让特定应用始终拿到真实地址。filter 为空且 mode 为 blacklist 时，绝大多数公网查询都会得到该网段内的合成地址。rule 模式下自定义 RuleSet 的 behavior 须为 domain 或 classical，classical 时仅域名类规则生效。

## 交叉检查上游字段与失败时的下一步
default-nameserver 必须填写 IP（可为加密 DNS），专门用来解析 nameserver 自身的域名。nameserver-policy 优先于 nameserver 与 fallback。fake-ip 模式下客户端首先连接合成地址，真实出站仍由规则决定。respect-rules 为 true 时 DNS 查询本身走路由，必须同时配置 proxy-server-nameserver，否则会出现循环。失败时下一步：确认应用是否把 DNS 指向 listen 所监听的地址与端口；检查 use-hosts、use-system-hosts 是否改写了结果；查看该域名是否被 filter 排除。可将 enhanced-mode 临时改为 redir-host 做对比，或审查 fallback-filter 的 geoip、ipcidr、domain 是否改变了真实结果的采用逻辑。文档明确提示非必要情况下请勿修改 fake-ip-ttl。

参考资料：https://wiki.metacubex.one/config/dns/
