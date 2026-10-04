---
title: "Clash mixed-port 怎样用于本地应用配置"
description: "Clash mixed-port 怎样用于本地应用配置。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

本地程序要把流量交给 Clash，应填写「代理端口」，而不是外部控制 API。官方全局配置把 mixed 与 http(s)、socks 并列，作为同一套用户验证所覆盖的代理类型。mixed-port 对应的就是这一类混合入站：同一端口可接受 HTTP(S) 代理与 SOCKS 代理。本机应用只要支持其中一种协议，就可以把主机写成回环地址、把端口写成 mixed-port 的值。文档没有规定你必须使用某一个固定数字，端口以当前配置里实际监听的 mixed 入站为准。

## 适用条件

同时满足下面几条，才适合用 mixed-port 做本地应用代理。第一，应用本身提供 HTTP 代理或 SOCKS 代理填写处，而不是只能改系统 DNS、只能做透明接管。第二，配置里已经声明 mixed 入站，并且内核确实在监听该端口。第三，你能把代理入口与外部控制器分开：文档示例是 `external-controller: 127.0.0.1:9090`，那是 RESTful API，不能填进应用的代理栏。第四，本机访问路径清楚：`skip-auth-prefixes` 默认包含 `127.0.0.1/8` 与 `::1/128`，回环通常可按「允许跳过验证」理解；若你删改过该列表，则必须按 `authentication` 提供用户名和密码。

仅本机使用时，不必把 `allow-lan` 打开。该项的官方含义是允许其他设备经过 Clash 的代理端口访问互联网。`bind-address` 约束的是其他设备从哪个地址连入，不能把它理解成本机开关。IPv6 应用若连接 `::1`，还需确认 `ipv6` 未被设为禁止接受 IPv6 流量。

## 把 mixed-port 写入本地应用的步骤

先在配置中读出 mixed 入站端口，只抄这一处数字。再在应用里填代理主机 `127.0.0.1`（IPv6 场景用 `::1`），端口填该数字。应用若只能选 HTTP 或只能选 SOCKS，仍指向同一 mixed 端口即可，不必再找另一套「独立协议端口」——除非你的配置另外启用了独立的 http(s) 或 socks 入站并希望刻意分流。

若存在 `authentication`（文档示例为 `user1:pass1` 这种 `用户名:密码` 列表），检查本机是否落在 `skip-auth-prefixes` 内。落在前缀内可按官方说明跳过验证；否则必须把同一组用户名密码写进应用。不要把 API 的 `secret` 当作代理口令，也不要把 Unix socket、Windows namedpipe 或 `external-doh-server` 的路径填进代理设置——那些属于外部控制面，文档还写明部分路径不会验证 secret，与 mixed 入站不是同一类服务。

需要局域网设备共用时，再单独评估 `allow-lan`、`bind-address`、`lan-allowed-ips` 与 `lan-disallowed-ips`。黑名单优先于白名单。这与「本机回环能否连上 mixed-port」是两件事情，不要一次改完所有项却无法判断是哪一条生效。

## 判断依据与失败时下一步

判断应看协议与对象是否匹配，而不是看运行模式。`mode` 为 `rule`、`global` 或 `direct` 只决定选路，不决定该端口是不是代理入口。有效的标志是：应用发出 HTTP 代理或 SOCKS 握手，目标是 mixed-port，而不是向 `external-controller` 发 REST 请求。`log-level` 建议至少到 `info`；`silent` 不输出，`error` 只保留无法使用级别的错误，都不适合核对普通入站。需要更细的握手信息时再用 `debug`。

连接被拒绝时，先核对端口是否抄成了 API 示例端口，再确认内核仍在监听 mixed 入站。认证失败时，核对 `authentication` 与 `skip-auth-prefixes` 是否把本机排除在免验证之外。只有部分软件可用时，优先检查那些软件是否误填了外部控制器地址。IPv6 失败则核对 `ipv6` 与 `::1` 是否一致。局域网能连本机不能连、或相反，则回到 `allow-lan` 与绑定地址，而不是继续改应用里的协议类型。

资料来源：https://wiki.metacubex.one/config/general/
