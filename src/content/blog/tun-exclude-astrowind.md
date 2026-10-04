---
title: "Clash 需要排除流量时怎样先确认 TUN 支持项"
description: "Clash 需要排除流量时怎样先确认 TUN 支持项。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 排除前先确认 TUN 已真正接管流量

需要把部分流量排除出 Clash（mihomo）TUN 时，不能先写排除列表。官方入站文档把排除能力全部挂在 `tun` 上，并且多数字段只有在 TUN 已启用、全局路由已按文档方式建立后才会生效。应先确认 `tun.enable` 为 true，再确认 `auto-route` 为 true。前者决定虚网卡是否工作，后者决定是否自动把全局流量导入 TUN。未满足这两项时，后面的网段、接口、UID、包名排除都没有判断意义。

`auto-redirect` 仅支持 Linux，用于自动配置 iptables/nftables 重定向 TCP，且要求 `auto-route` 已启用。Android 上它只转发本地 IPv4 连接。Linux 路由器场景下，文档写明带 `auto-route` 的 `auto-redirect` 可按预期工作。若当前系统不是这一组合，就不要把“排除不生效”先当成规则写错。

协议栈也要一并核对：`stack` 可用 system、gvisor、mixed、mips；无使用问题时文档建议 mips。若已打开防火墙，system 与 mixed 不可用，需按文档放行内核：Windows 在安全中心允许应用通过防火墙并选中内核；macOS 一般无需配置，遇阻再在防火墙选项中添加 mihomo；Linux 可对 TUN 网卡出站放行。栈选错或防火墙拦截时，排除项会表现为“写了也不走预期路径”。

## 按操作系统核对应支持的排除项

Linux 可核对这些排除相关字段：`route-exclude-address`（启用 `auto-route` 时排除自定义网段）、`route-exclude-address-set`（把指定规则集中的目标 IP CIDR 加入防火墙，匹配流量绕过路由）、`exclude-interface`、`exclude-uid` / `exclude-uid-range`、`exclude-mac-address`。其中 `route-exclude-address-set` 仅 Linux，还需要 nftables，并且 `auto-route` 与 `auto-redirect` 都已启用。UID 规则仅 Linux 且需要 `auto-route`。MAC 排除仅 Linux，且需要 `auto-route` 和 `auto-redirect`。

Android 应核对 `include-android-user`、`include-package`、`exclude-package`，同样需要 `auto-route`。文档给出常用用户 ID：机主 0、手机分身 10、应用多开 999。未配置的用户或包名不会按“包含”逻辑被 TUN 路由。Windows 与 macOS 不要按 UID、MAC、nftables 规则集去写排除。macOS 的 `device` 只能使用 `utun` 开头的网卡名。Windows 启用 `strict-route` 时，文档说明会加防火墙规则以阻止普通多宿主 DNS 解析造成的泄露，并可能使 VirtualBox 等在某些情况下无法正常工作。

判断依据可以写成三条：当前 OS 是否在该字段的支持说明里；依赖的 `auto-route` / `auto-redirect` / nftables 是否同时满足；目标流量维度（目的网段、入接口、UID、MAC、Android 包名）是否与字段一致。任意一条不满足，就视为该排除项当前不受支持，而不是“规则没写上”。

## 互斥项、旧写法和失败后的下一步

确认支持项时必须同时看互斥。`include-interface` 与 `exclude-interface` 冲突，不可一起配置。`route-address-set`、`route-exclude-address-set` 与任意配置中的 `routing-mark` 冲突。`route-address` 是启用 `auto-route` 时改用自定义路由网段而不是默认路由，一般无需配置，不能当成排除列表。旧字段 `inet4-route-exclude-address`、`inet6-route-exclude-address` 即将废弃，核对时应改用 `route-exclude-address`。

IPv6 相关排除还受启动检查约束：程序启动时会检查系统其他网卡是否有 IPv6，不存在则禁用；需要强制开启 TUN 的 v6 地址时，文档要求设置环境变量 `SKIP_SYSTEM_IPV6_CHECK=1`，并且顶层 `ipv6` 为 true。`dns-hijack` 在 macOS/Windows 无法自动劫持发往局域网的 DNS，Android 开启私人 DNS 时也无法自动劫持，排除 DNS 流量前要先承认这些平台限制。

若核对后发现目标排除项不受支持：Linux 上若要坚持用规则集排除，先补齐 nftables 与 `auto-redirect`；防火墙挡住 system/mixed 时先按文档放行，而不是改排除网段；Android 只保留包名/用户类字段；Windows/macOS 只保留该平台文档出现过的路由与接口能力。不要把代理规则里的 DIRECT 算作 TUN 支持项已确认。

资料来源：https://wiki.metacubex.one/config/inbound/tun/
