---
title: "Clash 启用 TUN 前怎样准备回退步骤"
description: "Clash 启用 TUN 前怎样准备回退步骤。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

启用 Tun 会改写系统路由，并可能写入防火墙或 iptables/nftables 规则，因此应在把 `enable` 设为 `true` 之前准备可独立执行的回退步骤。适用条件是：计划打开 `auto-route`、`auto-redirect` 或 `strict-route`，或即将更换 `stack`、`device`、DNS 劫持与路由网段。准备回退的判断依据是：关闭 Tun 后，默认出口、DNS 与防火墙应能回到启用前状态，且不依赖 Tun 网卡仍能编辑配置。

## 备份会被 Tun 改写的配置

先完整保存当前配置副本，至少覆盖 `tun` 段以及顶层与 IPv6 相关的项。官方说明中，Tun 可能改动的字段包括 `enable`、`stack`、`auto-route`、`auto-redirect`、`auto-detect-interface`、`strict-route`、`device`、`dns-hijack`、`route-address`、`route-exclude-address`、`include-interface`/`exclude-interface`，以及 Linux 或 Android 上的 UID、MAC、用户与包名过滤。

回退清单应写明：把 `enable` 改回 `false` 的具体文件路径；若曾打开 `auto-redirect`（仅 Linux，且要求 `auto-route` 已启用），记下当前是否已有手工 iptables/nftables 规则；若曾打开 `strict-route`，记下 Windows 防火墙原有策略。判断依据是：关闭程序后，能区分“程序写入的规则”和“本来就有的规则”。`include-interface` 与 `exclude-interface` 不可同时配置，备份时不要把冲突项一起带上。

## 记录启用前的可达性与平台限制

`auto-route` 会把全局流量路由进 tun 网卡。`strict-route` 在 Linux 上会让不支持的网络无法到达，并把连接导入 tun；在 Windows 上会添加防火墙规则，用于阻止普通多宿主 DNS 解析造成的 DNS 泄露，同时可能使部分应用在某些情况下无法正常工作。启用前应记录：默认出口网卡、默认路由是否可达、本机 DNS 是否指向局域网、防火墙是否开启、系统是否已有 IPv6。

平台限制要写进回退预案：若打开防火墙，则无法使用 `system` 和 `mixed` 协议栈，除非按文档放行内核；MacOS 的 `device` 只能使用 `utun` 开头的网卡名；MacOS/Windows 无法自动劫持发往局域网的 DNS；Android 开启私人 DNS 时无法自动劫持 DNS。程序启动时会检查其他网卡是否有 IPv6，不存在会禁用 tun 的 v6 地址；若曾用 `SKIP_SYSTEM_IPV6_CHECK=1` 并设置顶层 `ipv6: true` 强制开启，回退时要一并撤销。

## 约定关闭顺序与失败时下一步

回退顺序建议固定为：先把 `tun.enable` 改为 `false` 并重启内核，再核对系统路由与防火墙，最后才考虑删除 tun 网卡残留地址。Linux 上若用过 `auto-redirect`，下一步检查重定向规则是否清除；若用过 `auto-route`，检查 `iproute2-table-index`（默认 2022）和 `iproute2-rule-index`（默认 9000）是否残留。Windows 上若用过 `strict-route`，下一步检查用于阻止多宿主 DNS 的防火墙规则是否仍在。

若关闭后仍无默认路由或流量仍进 tun，保持 `enable: false`，恢复备份配置，不要反复开关 Tun。多网卡环境不要依赖 `auto-detect-interface` 的临时结果，回退时应改回启用前指定的出口网卡。`route-address-set`/`route-exclude-address-set` 仅 Linux 且需要 nftables，并与任意配置中的 `routing-mark` 冲突；若启用失败或回退后路由异常，先去掉这些项再恢复物理网卡出站。

资料：https://wiki.metacubex.one/config/inbound/tun/
