---
title: "怎样阅读 Clash 流量统计而不误判"
description: "怎样阅读 Clash 流量统计而不误判。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

阅读 Clash 流量统计时，数字只表示内核处理过数据，并不自动等于当前网页的代理用量或套餐已消耗额度。官方全局配置页给出的是运行模式、入站范围、进程匹配、保活和日志等条件。阅读统计必须先用这些条件约束口径，否则容易把直连、局域网旁路、保活探测和资料更新都算进业务流量。

## 确认当前模式决定哪些流量会进代理

`mode` 可选 `rule`、`global`、`direct`，默认规则模式。规则模式下只有命中代理规则的连接才进入节点；`global` 需要在 GLOBAL 策略组选择代理或策略后才把流量送去代理；`direct` 则全局直连。判断依据：若模式为 `direct`，统计里即使有本机网卡活动，也不代表订阅节点在转发；若为 `rule`，必须承认未匹配或直连部分不会出现在代理转发量的合理预期里。适用条件是配置已被内核加载且模式未被外部 API 临时改写。操作上应先读取当前 `mode`，再解释涨跌。若模式与预期不符，先改回需要的模式并重新观察，而不是直接认定统计损坏。

## 把入站范围和协议栈从总量里拆开

`allow-lan` 为 `true` 时，其他设备可经 Clash 代理端口上网。`bind-address` 为 `"*"` 绑定所有地址，也可只绑定单个 IPv4 或 IPv6。`lan-allowed-ips` 默认 `0.0.0.0/0` 与 `::/0`，`lan-disallowed-ips` 黑名单优先。判断依据：局域网白名单过宽时，电视、手机、虚拟机都可能推高同一组计数。`authentication` 只限制谁能使用 http(s) / socks / mixed 端口，`skip-auth-prefixes` 只跳过指定网段的验证，二者都不等于流量只来自本机。`ipv6` 默认 `true`，内核会接受 IPv6；若只按 IPv4 去理解网页访问，会漏计或误判双栈流量。适用条件是你能核对上述字段的当前值。若无法排除旁路设备，应先把 `allow-lan` 设为 `false` 或收紧允许网段后再读数。

## 识别保活、并发、进程匹配和资料更新造成的额外计数

`keep-alive-interval` 与 `keep-alive-idle` 以秒为单位发送 TCP Keep Alive，文档说明修改它们是为减少移动设备耗电；`disable-keep-alive` 在 Android 上强制为 `true`。空闲连接上的保活包会让流量在没有打开新网页时仍变化。`tcp-concurrent` 启用后会对解析到的所有 IP 发起连接并采用第一个成功者，短时间握手次数会高于只连一个地址的直觉。`find-process-mode` 为 `always` 强制匹配进程，`strict` 由内核判断，`off` 不匹配进程并推荐在路由器上使用。进程匹配关闭时，不能把总量归到某一个前台应用。`geo-auto-update`、`geo-update-interval` 和 `geox-url` 会按间隔下载 GeoIP、GeoSite、MMDB 等文件，`global-ua` 与 `etag-support` 作用于这些外部资源请求，它们会出现在内核流量里，却不是正在测试的页面。`log-level` 在控制台和控制页面输出，排查时应使用 `info` 或 `debug`，`silent` 会让你失去判断依据。

若上述条件都核对后仍无法解释读数，下一步应检查 `external-controller` 是否被其他程序频繁调用、出站是否被 `interface-name` 或 `routing-mark` 引到非预期网卡。本页并不提供与运营商账单逐字节对齐的字段，需要转到规则与 DNS 等其他配置层继续查，而不是反复刷新同一组总数。

参考资料：https://wiki.metacubex.one/config/general/
