---
title: "Clash 浏览器连接排查为何要留意 HTTP/3"
description: "Clash 浏览器连接排查为何要留意 HTTP/3。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

浏览器连不上或部分站点异常时，常见做法是在全局配置里开关 TCP 并发、改 Keep Alive，或切换运行模式。这些字段在官方全局配置中写得很明确，但描述对象是 TCP：并发时会对 DNS 解析得到的全部 IP 发起连接并采用第一个成功的连接；Keep Alive 间隔与空闲时间用于减少移动设备耗电，Android 上禁用 Keep Alive 会被强制为 true。它们并不能说明浏览器是否改走了基于 UDP 的 HTTP/3。

因此排查时留意 HTTP/3，并不是要在本页寻找未记载的协议开关，而是避免把「TCP 全局项已调整」误当成「浏览器传输已被控制」。

## 适用条件与判断依据

适用于浏览器对部分站点失败、时好时坏，同时内核仍在工作、入站与模式可核对的场景。判断是否可能与 HTTP/3 有关，应看你改动的官方字段是否只作用于 TCP 路径：

- 只改 `keep-alive-interval`、`keep-alive-idle`、`disable-keep-alive`，现象没有可对应的变化，说明故障不一定落在 TCP Keep Alive 所描述的链路上。
- 只开关 `tcp-concurrent` 仍无对应变化，说明问题可能不在「对解析出的所有 IP 做 TCP 连接」这一行为。
- `ipv6` 只决定内核是否接受 IPv6 流量，默认 true；浏览器若使用另一套传输，只改 IPv6 仍可能对不上。
- 资料已警告全局 TLS 指纹被弃用，应在 proxy 内设置 `client-fingerprint`。指纹也不是 HTTP 版本开关，不能用来解释 HTTP/3。

日志方面，`silent` 不输出，`error` 仅无法使用级别，`warning` 含不影响运行的错误，`info` 含一般运行内容，`debug` 尽可能输出运行中所有信息。排查应保证控制台或控制页面能看到相应级别，而不是先堆叠 TCP 项。

## 具体操作

1. 先记录并固定 `mode`。`rule` 为规则匹配，`global` 需在 GLOBAL 策略组选择代理或策略，`direct` 为全局直连。中途改模式等于同时改路由与观察窗口。
2. 将 `log-level` 设为 `debug` 并保持到对照结束，区分 error、warning 与一般运行信息。
3. 明确 `find-process-mode`。`always` 强制匹配所有进程，便于区分不同浏览器；`strict` 为默认并由内核判断；`off` 不匹配，资料写明路由器上推荐此模式。对照期间若仅为区分浏览器进程而调整该项，不要同时改 `tcp-concurrent`。
4. 核对入站认证：`http(s) / socks / mixed` 可配置 `authentication`；`skip-auth-prefixes` 可让指定 IP 段跳过验证。本机常见前缀为 `127.0.0.1/8` 与 `::1/128`。认证失败会造成浏览器连不上，与 HTTP 版本无关，必须先排除。
5. 若故障来自其他设备，再核对 `allow-lan`、`bind-address` 与局域网黑白名单，不要把入站范围变化当成协议问题。

不要把 `unified-delay` 当作协议开关。它只在开启时计算 RTT，以消除连接握手等带来的不同类型节点延迟差异。

## 失败时下一步

固定模式与日志后仍无法用全局 TCP 项解释浏览器行为时，停止继续改 `interface-name`、`routing-mark`、GEO 加载模式和自动更新间隔。那些分别对应出站网卡、Linux 流量标记和地理数据，不是 HTTP/3 控制项。

下一步只确认两件事：在 `debug` 下该浏览器是否被进程匹配捕获（`find-process-mode` 非 `off`）；以及当前是否为 `mode: direct` 导致根本未进代理。路由器上按资料使用 `off` 时，不能用进程名解释浏览器差异，应回到入站地址与运行模式，而不是假设存在未记载的 HTTP/3 全局开关。

https://wiki.metacubex.one/config/general/
