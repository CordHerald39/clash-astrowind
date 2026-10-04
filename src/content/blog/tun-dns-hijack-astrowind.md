---
title: "Clash TUN DNS 接管配置如何阅读"
description: "Clash TUN DNS 接管配置如何阅读。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

阅读 Clash TUN 中的 DNS 接管配置，核心是定位 tun 段里的 dns-hijack 列表，并把它与 enable、auto-route、strict-route 等相邻字段放在一起理解。该字段的作用是把匹配到的连接导入内部 DNS 模块；未写协议时按 udp:// 处理。只有在这些条件同时满足时，配置才具备实际接管意义。

## 适用条件
先确认 tun.enable 为 true，否则整个 TUN 入站（含劫持）不会启动。stack 在无使用问题时建议使用 mips，可选值还包括 system、gvisor、mixed。auto-route 为 true 时会自动把全局流量导入 TUN 网卡，这是 DNS 包能够到达劫持逻辑的前提。auto-detect-interface 用于自动选择出口，多网卡环境可改为手动指定。dns-hijack 本身只负责匹配并导入，不负责建立路由，因此阅读时必须同时查看路由相关开关。Android 上若开启私人 DNS、MacOS/Windows 上发往局域网的 DNS 请求，文档明确无法自动劫持，这些平台限制构成适用边界。

## 阅读步骤与判断依据
打开配置，找到 tun 块。第一步看 enable 和 stack 是否符合预期。第二步读 dns-hijack 列表：any:53 表示任意地址的 UDP 53，tcp://any:53 表示 TCP 53。判断一项是否覆盖目标流量的依据，是它是否写出了实际会发出的协议、地址和端口。第三步结合 auto-route、strict-route 判断流量路径：strict-route 在启用 auto-route 时，于 Linux 会让不支持的网络无法到达并把全部连接导入 TUN，从而防止泄漏并让 Android 上的劫持生效；于 Windows 会添加防火墙规则以阻止多宿主 DNS 解析造成的泄漏。第四步检查 route-address、route-exclude-address、include-interface、exclude-interface 是否把 53 端口流量排除在外。旧字段 inet4-route-address 等即将废弃，阅读时应优先采用新写法，避免把废弃项当成现行劫持规则。

## 失败时的下一步
若列表写法正确但未观察到接管，先对照文档中的平台限制：局域网 DNS 在 MacOS/Windows 无法自动劫持，Android 私人 DNS 同样无法劫持。下一步可核对该设备是否落入这些例外，并确认 auto-route 与 strict-route 已按文档组合使用。Linux 可再检查 auto-redirect 是否与 auto-route 同时开启以便重定向 TCP。防火墙开启时 system/mixed 栈可能不可用，文档给出了 Windows 允许内核、Linux 对 TUN 网卡出站放行的对应做法。核对 device（MacOS 仅允许 utun 开头）、mtu 等基础项后，仍异常则可暂时将 enable 设为 false 验证系统网络，再逐项恢复 dns-hijack 与路由字段。

https://wiki.metacubex.one/config/inbound/tun/
