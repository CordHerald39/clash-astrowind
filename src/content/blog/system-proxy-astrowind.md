---
title: "Clash 电脑端：设置系统代理后怎样验证浏览器请求"
description: "Clash 电脑端：设置系统代理后怎样验证浏览器请求。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

当你在电脑上把系统 HTTP/HTTPS 代理指向 Clash（mihomo）的 http 或 mixed 入站后，浏览器请求有没有真正交给内核，不能只看系统里代理是否处于开启状态。官方全局配置里与这次验证直接相关的，是入站上的用户验证、可跳过验证的源地址前缀、运行模式，以及日志与外部控制接口。验证目标只有两件事：请求是否进入了 http(s)/socks/mixed 入站；进入之后是否按当前 mode 被处理。

## 适用条件

本方法适用于内核已启动、http 或 mixed 入站可用，并且操作系统代理的主机与端口指向该入站。浏览器必须使用系统代理，而不是扩展或内置的独立代理。若浏览器自行指定了其他代理或选择直连，日志和 API 都不会出现这次访问，不能据此判断规则未命中。

若配置了 authentication，本机浏览器通常依赖 skip-auth-prefixes。文档示例包含 127.0.0.1/8 与 ::1/128：源地址落在这些前缀内可跳过用户名密码，否则 CONNECT 可能被拒绝，表现成页面无法加载或反复要求认证。allow-lan、bind-address、lan-allowed-ips、lan-disallowed-ips 约束的是其他设备能否经过代理端口访问；黑名单优先于白名单。仅验证本机浏览器时，不要把失败原因先归到允许局域网。只有浏览器跑在其他设备上，才需要核对这些项。

## 分步验证

第一步，记下当前 mode。可选 rule、global、direct，默认 rule。direct 为全局直连，即使系统代理已指向 Clash，出口也不应再走代理节点。global 需要在 GLOBAL 策略组中选择代理或策略。rule 按规则匹配。用同一浏览器访问同一目标，若切换 mode 后现象完全不变，应优先怀疑请求没有进入入站。

第二步，把 log-level 调到可观察的级别。可选 silent、error、warning、info、debug。验证期间使用 info 或 debug，在控制台或控制页面查看是否出现目标主机相关连接、认证失败或规则拒绝。silent 不输出，不能作为验证手段。

第三步，核对本机访问是否被入站认证拦住。存在 authentication 时，确认浏览器源地址是否命中 skip-auth-prefixes。未命中则应补上本机回环前缀，或按配置提供同一组用户名与密码，而不是去改规则。

第四步，用外部控制交叉核对。external-controller 提供 RESTful API，文档示例为 127.0.0.1:9090，可设置 secret。文档写明从 Unix socket 或 Windows namedpipe 访问 API 时不会验证 secret，需自行保证安全。通过 API 读取 mode、策略组选择和连接情况。profile.store-selected 为 true 时会保存策略组选择供下次启动使用。刷新页面后若日志与 API 都没有新连接，说明流量未到达 Clash。

## 判断依据和失败后的下一步

可以判定浏览器请求已进入内核的依据是：访问瞬间日志出现对应连接或匹配记录；API 中的连接信息同步变化；改变 mode 后，同一网址的出口行为与 rule、global、direct 的定义一致。页面能打开只说明目标可达，不能单独证明走了 Clash。

失败时按现象分支。能打开网页但无记录：检查浏览器是否绕过系统代理，以及系统代理端口是否等于 http 或 mixed 入站。反复认证失败：检查 authentication 与 skip-auth-prefixes。有连接但出口不符：检查是否误设 direct，以及 global 时 GLOBAL 组是否已选择节点。访问 IPv6 目标异常时，核 ipv6 项（可选 true 或 false，默认 true）。仍无法定位则把 log-level 设为 debug，并确认 API 监听地址与 secret 可访问。

参考资料：https://wiki.metacubex.one/config/general/
