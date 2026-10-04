---
title: "Clash 怎样阅读 TUN 自动路由相关设置"
description: "Clash 怎样阅读 TUN 自动路由相关设置。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash（mihomo）的 TUN 自动路由相关设置全部写在配置文件的 tun 段。阅读时必须对照官方对各字段的平台限制、依赖关系和具体行为，而不能只看布尔值或列表是否存在。以下说明仅依据该入站文档，帮助判断当前配置会把哪些流量导向 tun 网卡。

## 适用条件

tun.enable 必须为 true，整个入站才会工作。auto-route 为 true 才会自动设置全局路由，把流量导入 tun 网卡。auto-redirect 仅 Linux 支持，且要求 auto-route 已启用，用于自动配置 iptables 或 nftables 重定向 TCP。strict-route、route-address、route-exclude-address、include-interface、exclude-interface、uid 系列、mac 地址系列以及 Android 用户和包名系列，均要求 auto-route 已启用；其中 mac 规则还要求 auto-redirect，route-address-set 与 route-exclude-address-set 还要求 Linux、nftables 且与 routing-mark 冲突。UID 规则仅 Linux 生效，Android 规则仅 Android 生效。Windows 开启防火墙时 system 与 mixed 栈可能不可用，macOS 的 device 只能使用 utun 开头名称，Android 开启私人 DNS 时无法自动劫持发往局域网的 DNS。阅读前先确认操作系统和这些前提是否满足。

## 具体阅读步骤

打开 YAML，定位 tun 映射。先看 enable、auto-route、auto-redirect、auto-detect-interface、strict-route 的取值。再看 route-address 与 route-exclude-address：前者在 auto-route 启用时用自定义网段代替默认路由，后者排除网段，文档示例为 192.168.0.0/16 和 fc00::/7。接着看 include-interface 与 exclude-interface，二者冲突、不可同时配置。Linux 继续阅读 include-uid、exclude-uid、对应 range 以及 include-mac-address、exclude-mac-address。Android 阅读 include-android-user（常用 0、10、999）、include-package 与 exclude-package。最后看 route-address-set 和 route-exclude-address-set 是否把规则集中的目标 IP CIDR 加入防火墙。旧键 inet4-route-address、inet6-route-address、inet4-route-exclude-address、inet6-route-exclude-address 即将废弃，应优先阅读新字段。同时记下 device、stack、dns-hijack、mtu、iproute2-table-index（默认 2022）和 iproute2-rule-index（默认 9000）。

## 判断依据

auto-route 为 true 且未配置 route-exclude-address 时，文档描述为自动将全局流量路由进入 tun。若 route-exclude-address 包含正在使用的私网段，对应流量应绕过。include-interface 列出的接口才会被路由，未列出则不会；exclude-interface 则相反。strict-route 为 true 时，Linux 会让不支持的网络无法到达并将所有连接路由到 tun，防止地址泄漏并使 DNS 劫持在 Android 上工作；Windows 会添加防火墙规则阻止普通多宿主 DNS 解析造成的泄露。route-address-set 生效时不匹配的流量将绕过路由。auto-detect-interface 为 true 表示自动选择出口接口，多出口网卡环境文档建议改为手动指定。用这些描述对照列表内容，即可判断配置是全局捕获、排除局域网还是按接口、用户、MAC 或应用过滤。

## 失败时下一步

字段存在但行为与描述不符时，检查 stack 是否为 system、gvisor、mixed 或 mips（文档建议无使用问题则用 mips）。防火墙拦截时，Windows 到安全中心允许应用通过防火墙并选中内核；Linux 可对 TUN 网卡出站做 ACCEPT；macOS 防火墙一般放行签名软件。确认 inet6-address 需系统存在 IPv6 或设置 SKIP_SYSTEM_IPV6_CHECK=1，且顶层 ipv6 为 true。临时去掉 route-address 与 route-exclude-address，只保留 auto-route 做对比。核对 Linux 实际路由表是否使用文档默认索引。macOS 确认网卡名符合 utun 限制后重新加载配置再读一遍。

https://wiki.metacubex.one/config/inbound/tun/
