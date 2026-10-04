---
title: "排查 Clash 防火墙问题时怎样缩小范围"
description: "排查 Clash 防火墙问题时怎样缩小范围。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

排查 Clash 与“防火墙”相关的连通失败时，应先把范围收束到官方全局配置已经写明的入站访问控制，而不是同时改运行模式、DNS 和出站代理。手册对允许局域网（`allow-lan`）的定义是：是否允许其他设备经过 Clash 的代理端口访问互联网，取值为 `true` 或 `false`。绑定地址（`bind-address`）决定监听在全部地址还是单个 IPv4/IPv6；`lan-allowed-ips` 只在 `allow-lan` 为 `true` 时生效，默认 `0.0.0.0/0` 与 `::/0`；`lan-disallowed-ips` 为禁止连接的地址段，黑名单优先级高于白名单，默认空。先用这些项判断“连接有没有进内核”，再决定要不要动 `mode`、`interface-name` 或进程匹配。

## 用本机环回和局域网来源做第一次二分

适用条件是：表现为端口连不上、代理握手失败，或只有部分设备不能走 http(s)/socks/mixed 端口。判断依据是来源地址是否为本机环回。若 `127.0.0.1` 或 `::1` 可用而局域网不可用，优先视为入站放行问题，而不是规则模式问题。`mode` 的默认值为规则模式，还可设为 `global` 或 `direct`，它不替代 `allow-lan`。操作上先核对 `allow-lan`：为 `false` 时，其他设备本来就不能经代理端口访问互联网。再看 `bind-address`：`"*"` 绑定所有 IP；写成单一 IPv4 或 IPv6 时，只有打到该地址的连接会被接受。

失败时下一步：不要先改策略组。将入站相关项与出站相关项分开验证——`interface-name` 与 `routing-mark` 作用于出站，不能解释“本机环回正常、旁路设备被拒”。若环回也失败，再查内核是否在监听、日志级别是否为 `silent`（静默且不输出）。

## 用白名单、黑名单和认证缩小“谁被拦”

适用条件是：`allow-lan` 已为 `true`，仍有部分来源成功、部分失败。操作步骤应按优先级读配置，而不是凭感觉加段。先读 `lan-disallowed-ips`：一旦来源落在黑名单，即使同样出现在 `lan-allowed-ips` 也会被禁止。再读 `lan-allowed-ips`：不在白名单内的来源不会被允许。最后读 `authentication`：http(s)/socks/mixed 可配置用户验证；`skip-auth-prefixes` 用于设置允许跳过验证的 IP 段。

判断依据是“黑名单高于白名单，认证独立于名单”。例如来源在默认白名单内，但出现在 `lan-disallowed-ips` 的 `/32` 或 `/128` 中，应判定为名单拒绝，而不是系统策略组选错。若未带账号口令且来源又不在跳过验证的前缀中，应判定为认证拒绝。失败时下一步：只改其中一类配置做对照——先清空或缩小黑名单，或把白名单恢复为文档给出的默认两段，或检查该来源是否应加入 `skip-auth-prefixes`。不要把 `external-controller` 的 API 监听地址当成代理端口放行项；API 与代理入站是不同监听。

## 用日志级别和其余全局项排除“像防火墙、实为其他开关”

适用条件是：名单与认证已按上一节核对，现象仍在。官方说明日志级别只在控制台和控制页面输出，可选 `silent`、`error`、`warning`、`info`、`debug`。缩小范围时应避免 `silent`，需要更多上下文时使用 `info` 或 `debug`：`error` 仅输出发生错误至无法使用的日志；`warning` 含不影响运行的错误；`debug` 尽可能输出运行中所有信息。据此判断连接是否到达内核、失败发生在入站拒绝还是后续处理。

同时核对容易被误当成防火墙的项：`ipv6` 控制是否允许内核接受 IPv6 流量，可选 `true`/`false`，默认为 `true`；仅 IPv6 失败时应把范围收到地址族，而不是继续加局域网名单。`find-process-mode` 为 `always`、`strict`（默认）或 `off`，路由器上推荐 `off`，它影响进程匹配而非 `lan-disallowed-ips`。`keep-alive-interval`、`keep-alive-idle`、`disable-keep-alive` 用于 TCP Keep Alive，文档将其与减少移动设备耗电联系，不能当作端口放行开关。失败时下一步：保持 `mode` 不变，仅把 `allow-lan`、`bind-address`、两份 IP 名单和认证恢复到可复现的最小差异，对照日志是否出现入站。官方该页不提供操作系统防火墙规则列表；在 Clash 侧已确认应接受该来源后，才需要到系统层另行核对是否拦截了进程或端口。

资料：https://wiki.metacubex.one/config/general/
