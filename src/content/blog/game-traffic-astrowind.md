---
title: "Clash 游戏连接排查前怎样确认接管方式"
description: "Clash 游戏连接排查前怎样确认接管方式。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

游戏连不上时，不要先改节点或规则。应先确认流量是否被 TUN 接管、接管范围是全局还是按接口、应用或用户过滤。以下只依据 TUN 文档，给出适用条件、确认步骤、判断依据和失败后下一步。

## 适用条件与接管开关

适用条件是：游戏客户端不走浏览器代理设置，需要网卡级接管才能进入内核。TUN 段以 `enable` 为总开关。`auto-route` 为 true 时，文档说明可自动将全局流量路由进入 tun 网卡。仅打开 `enable` 而未打开 `auto-route` 时，不能把内核已启动当成游戏流量已被接管。

Linux 上还有 `auto-redirect`：仅支持 Linux，自动配置 iptables/nftables 以重定向 TCP 连接，且需要 `auto-route` 已启用。文档写明在 Android 中仅转发本地 IPv4 连接；要通过热点或中继共享连接，需按该页给出的方式处理。在 Linux 中，带有 `auto-route` 的 `auto-redirect` 可在路由器上按预期工作。游戏若以 TCP 为主，Linux 下应同时核对这两项；若主要是 UDP，不能只根据 TCP 重定向是否生效来判断接管。

`auto-detect-interface` 用于自动选择流量出口接口，文档建议多出口网卡同时连接的设备手动指定出口网卡。`device` 指定 tun 网卡名称，MacOS 只能使用 utun 开头的网卡名。确认接管前应记下实际网卡名是否符合平台约束。`iproute2-table-index` 与 `iproute2-rule-index` 是 `auto-route` 生成的路由表索引和规则起始索引，默认分别为 2022 与 9000，只有在 Linux 路由表被其他策略占用时才需要对照，不能单独证明游戏已被接管。

## 确认接管范围的操作步骤

在确认 `enable` 与 `auto-route` 之后，按平台核对范围，避免把未纳入路由的游戏进程误判为节点故障。

1. 看接口过滤。`include-interface` 限制被路由的接口，默认不限制，与 `exclude-interface` 冲突，不可一起配置。虚拟网卡或额外出口若落在排除接口上，流量不会进入 TUN。
2. 看用户。UID 规则仅在 Linux 下被支持并且需要 `auto-route`。`include-uid` 与 `include-uid-range` 只路由列出的用户，未配置的用户不会被路由；`exclude-uid` 与 `exclude-uid-range` 则排除。
3. 看 Android 应用与用户。应用规则仅在 Android 下被支持并且需要 `auto-route`。`include-package` 只接管列出的包名，未配置的应用包不会被路由；`exclude-package` 排除指定包。`include-android-user` 常用用户 ID 为机主 0、手机分身 10、应用多开 999。
4. Linux 且同时启用 `auto-route` 与 `auto-redirect` 时，可用 `include-mac-address` 与 `exclude-mac-address` 按来源 MAC 限制或排除局域网设备。

判断依据：出现 include 类字段且游戏不在列表中，应判定为未被接管，而不是代理失败。include 与 exclude 成对冲突的项，以文档「不可一起配置」为准，配置同时存在时先整理配置再谈游戏。

## 协议栈、DNS 与失败后下一步

`stack` 为 tun 模式堆栈，可用值 system、gvisor、mixed、mips。文档写明如无使用问题建议使用 mips，默认 mips。system 使用系统协议栈；gvisor 在用户空间实现协议栈；mixed 为 TCP 使用 system、UDP 使用 gvisor；mips 为自研 IP 协议栈。文档还写明若打开了防火墙，则无法使用 system 和 mixed，并分别给出 Windows、MacOS、Linux 的放行说明。

`dns-hijack` 将匹配到的连接导入内部 dns 模块，不书写协议则为 udp://。文档指出在 MacOS 与 Windows 无法自动劫持发往局域网的 dns 请求；在 Android 如开启私人 dns 则无法自动劫持。`strict-route` 在启用 `auto-route` 时执行严格路由：Linux 上让不支持的网络无法到达、将所有连接路由到 tun；Windows 上添加防火墙规则以阻止普通多宿主 DNS 解析造成的 DNS 泄露，并说明可能使某些应用程序在某些情况下无法正常工作。

失败后下一步：游戏仍无流量时，先核对 `enable`、`auto-route`、平台过滤列表和防火墙是否挡住 system 或 mixed，而不是直接更换规则。DNS 仍指向局域网或私人 DNS 时，按文档限制处理劫持范围。Linux 上的 TCP 游戏再核 `auto-redirect` 是否已与 `auto-route` 同时启用。MacOS 网卡名不符合 utun 前缀时，先改 `device` 再重复确认接管。

资料：https://wiki.metacubex.one/config/inbound/tun/
