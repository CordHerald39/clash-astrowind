---
title: "Clash 使用 DoH 地址时怎样核对格式与来源"
description: "Clash 使用 DoH 地址时怎样核对格式与来源。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

使用 DoH 地址时，核对的是“写在哪个字段、URL 形态是否符合手册、`#` 后参数是否都是文档列出的项、该地址作为来源是否承担得起它所在字段的职责”。不要把来源理解成界面里的某个名称，只对照配置文本与手册语法。

## 先核对该地址出现在哪一类字段

适用条件：准备在 `nameserver`、`fallback`、`nameserver-policy` 的值、`proxy-server-nameserver`、`direct-nameserver` 中写入 HTTPS 形态的 DNS。DoH 在手册中以 HTTPS URL 作为服务器条目出现；`prefer-h3` 明确针对 DOH 优先使用 HTTP/3。判断依据：字段职责不同，同一串地址复制到错误字段会表现为“查询种类对不上”。

`default-nameserver` 用于解析 DNS 服务器的域名，必须为 IP，可为加密 DNS。因此：业务 DoH 可以是带主机名的 HTTPS URL，但引导解析不能改成“还要再解析一次的域名”。`nameserver-policy` 的键支持域名通配，值支持字符串或数组，且优先于 nameserver/fallback。步骤：先标字段，再写地址；policy 的值若是数组，数组内每一条都要单独做格式核对。失败时下一步：部分域名仍走旧上游时，先看 policy 是否命中，而不是怀疑 URL 路径少写了一个字符。

## 再按手册核对 URL 与附加参数格式

适用条件：条目以 HTTPS 作为 DNS 服务器。手册示例把路径写在主机或 IP 之后，并用 `#` 附加参数、`&` 连接不同参数。除了指定代理或接口和 ecs，其余项的值均为 bool（true/false）。判断依据：`#` 前应是可建立 DOH 的 HTTPS 定位符；`#` 后只能出现文档给出的参数名，不能把路由规则原文塞进 URL。

文档允许的附加能力包括：指定代理或接口进行连接；`#RULES` 为遵守路由规则，等同 `respect-rules`；`h3` 强制 HTTP/3 建立 DOH 连接；`skip-cert-verify`；`name-cert-verify`（仅修改证书 DNSName 校验目标，不修改 SNI）；`ecs` 与 `ecs-override`；`disable-ipv4`、`disable-ipv6` 以及 `disable-qtype-` 加整数。步骤：1. 确认方案为 HTTPS，而不是把 `tls://` 当成 DoH；2. 路径与查询服务入口一致，手册示例使用 `/dns-query` 这类路径；3. 从左到右拆 `#`、`&`，逐个对照参数名；4. 需要经代理时，`#` 后的代理名必须能在 `proxies` 中找到，否则按文档会改为指定接口连接。失败时下一步：参数无法识别时删掉非文档项；HTTP/3 相关项仅在确认服务器支持后再保留；需要 ecs 时同时核对其是否为手册所示的 subnet 写法。

## 核对来源是否匹配字段语义

适用条件：地址来自你维护的配置，而不是把任意 HTTPS 站点当作 DNS。手册把 `nameserver` 当作默认解析服务器，把 `fallback` 当作后备（一般情况下使用境外 DNS，保证结果可信），把 `proxy-server-nameserver` 限定为节点域名解析。判断依据：来源合法与否，看它是否承担该字段的职责，以及引导解析能否解析其主机名。

步骤：对带主机名的 DoH，确认 `default-nameserver` 已是 IP 且能解析该主机名；对只用于节点名的地址，放在 `proxy-server-nameserver`，不要指望它自动成为默认 `nameserver`；`proxy-server-nameserver-policy` 仅在 `proxy-server-nameserver` 非空时生效，来源登记时要写明这一约束。若 `respect-rules` 为 true，来源侧还必须满足“已配置 proxy-server-nameserver”，且不要与 `prefer-h3` 组合使用。失败时下一步：主机名无法解析则改引导 IP 或改用 IP 形态的 HTTPS 入口；来源只能当节点解析用时，把它从默认 `nameserver` 挪走；证书名与访问名不一致时，只用文档中的 `name-cert-verify` 调整 DNSName，而不是改 SNI。完整语法以手册为准。

资料：https://wiki.metacubex.one/config/dns/
