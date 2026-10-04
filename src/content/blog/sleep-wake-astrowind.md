---
title: "Clash 电脑端：电脑唤醒后怎样检查连接状态"
description: "Clash 电脑端：电脑唤醒后怎样检查连接状态。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

电脑唤醒后，内核进程还在，并不等于连接仍然可用。全局配置里和「当前连接状态」直接相关的是运行模式、出站接口、IPv6、TCP Keep Alive、外部控制 API，以及局域网绑定地址。下面只说明唤醒后怎样检查连接状态：适用条件、核对步骤与判断依据，失败时下一步。字段名称以全局配置文档为准，不把未记载的图形菜单当作步骤。

## 适用条件

本方法适用于电脑端已加载 mihomo/Clash 全局配置，设备从睡眠或待机唤醒后，需要确认控制面和数据面是否仍按原配置工作。运行模式 `mode` 可选 `rule`、`global`、`direct`，默认规则模式；`global` 需要在 GLOBAL 策略组选择代理或策略，`direct` 为全局直连。唤醒后第一项检查应是当前 `mode` 是否仍是唤醒前的值：连接失败既可能是网卡未就绪，也可能是模式已变成直连，或全局模式下列选择无效。

外部控制器用于以 RESTful API 查看和控制系统。文档中的监听示例为 `127.0.0.1:9090`，也可改为监听所有地址。另有 Unix socket、Windows namedpipe，以及需要证书的 HTTPS-API。从 Unix socket 或 namedpipe 访问时不会验证 `secret`；普通 HTTP API 则使用 `secret`。唤醒后若 API 无法访问，应先判定控制面异常，不能仅凭个别网站偶然打开就认为连接整体正常。

## 核对本机出站、地址族和 TCP 行为

出站接口由 `interface-name` 指定，文档示例为 `en0`。睡眠期间网卡可能掉线，唤醒后可能换成另一块网卡或名称变化。判断依据：配置了 `interface-name` 时，唤醒后该接口必须仍然存在并且可出站；接口消失或未就绪时，即使 `mode` 仍为 `rule`，新连接也会失败。未配置该项时，内核走系统默认路由，仍应确认默认路由已在唤醒后恢复。Linux 上 `routing-mark` 为出站连接提供默认流量标记，唤醒后策略路由若尚未恢复，有标记无路径也会表现为连接失败。

`ipv6` 控制内核是否接受 IPv6 流量，可选 true/false，默认为 true。唤醒后系统可能尚未获得 IPv6，或接入网络已不再提供 IPv6。判断依据是双栈表现是否对称：仅 IPv6 目标失败而 IPv4 正常，或相反，应对照该开关和系统地址是否就绪，而不是先改规则。

TCP Keep Alive 用于减少移动设备耗电，可设置 `keep-alive-interval`、`keep-alive-idle`（单位秒）以及 `disable-keep-alive`。睡眠会打断已有 TCP。唤醒后要区分两类现象：旧连接因空闲被对端或中间设备丢掉，与新连接完全无法建立。文档写明在 Android 上 `disable-keep-alive` 强制为 true，此时更不能用「Keep Alive 仍在」证明旧会话还活着。`tcp-concurrent` 为 true 时，会使用 DNS 解析出的所有 IP 进行连接并采用第一个成功的连接；唤醒后解析结果或路径变化时，实际连上的地址可能与唤醒前不同，检查时应记下地址族和成功的 IP，而不是只看域名曾经解析过。`unified-delay` 会计算 RTT 以消除握手带来的延迟差异，它只改变延迟口径，不能单独证明连接可用。

若 `allow-lan` 为 true，还要看 `bind-address`、`lan-allowed-ips` 和 `lan-disallowed-ips`。`bind-address` 为 `*` 表示绑定所有地址，也可以绑定单个 IPv4 或 IPv6。白名单默认 `0.0.0.0/0` 与 `::/0`，黑名单优先级高于白名单。唤醒后本机地址变化时，原绑定可能不再有效。判断依据：本机或局域网访问代理端口失败时，先看当前地址是否仍落在绑定和白名单内、是否命中黑名单。`authentication` 与 `skip-auth-prefixes` 会叠在这些地址条件之上。

## 用日志判断连接状态，失败时下一步

`log-level` 只在控制台和控制页面输出，可选 `silent`、`error`、`warning`、`info`、`debug`。`silent` 不输出；`error` 仅输出发生错误至无法使用的日志；`warning` 含不影响运行的错误；`info` 含一般运行内容；`debug` 尽可能输出运行中所有信息。唤醒后检查连接，至少应能看到 error 与 warning。若当前为 `silent` 且完全无输出，应先改为 `info` 或 `debug`，再复现一次唤醒。`find-process-mode` 为 `always`、`strict`、`off`，与是否按进程匹配有关，应在确认接口和 `mode` 之后再查。`profile.store-selected` 与 `store-fake-ip` 只说明下次启动是否恢复策略组选择和 fakeip 映射，不能替代唤醒当下的连通性检查。

失败时下一步：先用外部控制器确认监听仍在、`mode` 可读；再核对 `interface-name` 是否仍对应唤醒后的出站网卡；再分别验证 IPv4 与 IPv6；必要时提高 `log-level`，抓取从唤醒到第一条失败连接的日志。不要在 API 不可达时假定数据面正常。若问题集中在长连接断开，按文档调整 Keep Alive 间隔或空闲时间后再观察新连接，而不是只重试旧套接字。

资料：
https://wiki.metacubex.one/config/general/
