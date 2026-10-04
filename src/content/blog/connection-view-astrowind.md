---
title: "Clash 怎样从连接信息追踪一个失败请求"
description: "Clash 怎样从连接信息追踪一个失败请求。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash 要从连接信息追踪一个失败请求，先满足两件事：流量已经进入内核入站，以及失败过程能被外部控制器和控制页面看见。官方全局配置里，可观察性来自 `external-controller`（RESTful API）和 `log-level`（只在控制台与控制页面输出）；请求能否被内核接住，则取决于运行模式、局域网准入、代理验证、IPv6、进程匹配和出站接口。缺任何一环，连接信息要么是空的，要么只有结果、对不上失败步骤。

## 适用条件：先让连接信息可被读取

`external-controller` 指定 API 监听地址，文档示例为 `127.0.0.1:9090`。只绑定回环时，控制面只能在本机读到该内核。启用 HTTPS-API 时需配置 `external-controller-tls`，并且必须同时填写 `external-controller`，再在 `tls` 中提供证书与私钥。`secret` 是 API 访问密钥。文档写明：经 Unix socket（`external-controller-unix`）或 Windows named pipe（`external-controller-pipe`）访问 API 不会验证 secret，开启后需自行保证安全。`external-controller-cors` 约束浏览器跨源访问；`external-ui` 把静态页面挂到 API 的 `/ui` 路径，便于在控制页面查看运行状态。

判断依据：控制页面或 API 连不上时，不要解释一条并不存在的失败记录，应先核对监听地址、密钥、TLS 与 CORS。`log-level` 为 `silent` 时不输出；`error` 只输出严重到无法使用的错误；`warning` 包含不影响运行的错误；`info` 包含一般运行内容；`debug` 尽可能输出运行中所有信息。级别过低时，连接侧可能只剩成败，日志侧没有匹配与握手过程，无法完成追踪。

## 把失败对到入站、模式还是出站

入站未建立，就不会出现“已按规则转发”的连接信息。`allow-lan` 为 true 才允许其他设备经代理端口访问互联网；`bind-address` 决定绑定地址（`*` 表示所有 IP）；`lan-allowed-ips` 默认包含 `0.0.0.0/0` 与 `::/0`；`lan-disallowed-ips` 是黑名单且优先级高于白名单。`authentication` 作用于 http(s)/socks/mixed 用户验证，未通过则停在入站。`skip-auth-prefixes` 可让指定前缀跳过验证。

`mode` 默认为 `rule`。`global` 需要在 GLOBAL 策略组选择代理或策略；`direct` 为全局直连。同一目标在三种模式下的失败含义不同：规则未送到预期策略、GLOBAL 未选出站，或直连路径与网卡不通。`ipv6` 默认为 true，为 false 时内核不接受 IPv6 流量，IPv6 目标会在进入规则前失败。`tcp-concurrent` 为 true 时会对 DNS 得到的全部 IP 发起连接并采用第一个成功的连接，失败可能对应多次地址尝试。`interface-name` 指定出站网卡，Linux 上 `routing-mark` 给出站默认标记，配置错误会表现为内核已处理但对外失败。

## 进程、保活干扰以及失败后的下一步

`find-process-mode` 为 `always` 时强制匹配所有进程，`strict` 由 Clash 判断是否开启（默认），`off` 不匹配（文档建议路由器使用）。规则依赖进程名而实际未匹配时，不能把“进程对不上”当成失败原因。`keep-alive-interval`、`keep-alive-idle` 以秒计，`disable-keep-alive` 在 Android 上强制为 true，避免把保活包当成业务请求失败。

失败时下一步：把 `log-level` 调到 `info` 或 `debug` 后只复现该目标；确认控制页面指向同一 `external-controller`；核对该来源是否被黑名单或验证拒绝；按 `mode` 分别检查规则、GLOBAL 选择或直连出站；IPv6 目标检查 `ipv6`；多地址域名考虑 `tcp-concurrent`；进程类规则检查 `find-process-mode`。若日志与控制面仍无该请求，说明流量未进代理端口，应回到入站端口与系统代理，而不是继续在已有连接信息里检索。

资料：https://wiki.metacubex.one/config/general/
