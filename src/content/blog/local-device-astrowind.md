---
title: "使用 Clash 时怎样检查打印机等局域网设备"
description: "使用 Clash 时怎样检查打印机等局域网设备。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

使用 Clash 并启用 Tun 后，打印机、扫描仪等设备通常仍以私网地址提供服务。官方 Tun 说明把「哪些流量进入网卡、哪些地址被排除」写在 `auto-route`、`route-exclude-address`、接口限制和 MAC 限制等字段里。检查局域网设备，就是核对这些字段是否把打印机所在网段或来源从接管范围划出，而不是假设设备可以被代理路径「带过去」。

## 适用条件

适用：准备或已经把 `tun.enable` 设为 true；打印机地址属于已知 CIDR；需要判断该地址会不会被自动导入 tun 网卡。`auto-route` 的含义是自动设置全局路由，把全局流量路由进入 tun 网卡。因此一旦打开自动路由，若打印机网段未被排除，检查时应先怀疑「被全局路由带走」，而不是先改驱动。

不适用：在未启用 `auto-route` 时，用排除网段去解释打印机仍可达；在非 Linux、或未同时启用 `auto-route` 与 `auto-redirect` 时，指望 `include-mac-address`、`exclude-mac-address` 生效。文档写明这两项仅支持 Linux，且需要启用 auto-route 和 auto-redirect。

## 检查步骤与判断依据

1. 确认 Tun 是否真正启用，并记下 `stack`。无使用问题时文档建议 mips 栈，可用值为 system、gvisor、mixed、mips。若打开了防火墙，则无法使用 system 和 mixed 协议栈，需要先按平台放行后再查打印机。Windows 为：设置 -> Windows 安全中心 -> 允许应用通过防火墙 -> 选中内核。MacOS 一般无需配置；若开启防火墙后无法使用，可尝试：系统设置 -> 网络 -> 防火墙 -> 选项 -> 添加 mihomo app。Linux 一般无需配置；若防火墙拦截，可对 TUN 网卡出站放行。判断依据：协议栈或防火墙未满足时，不要把故障算到打印机上。
2. 核对自动路由与排除网段。启用 `auto-route` 时，用 `route-exclude-address` 排除自定义网段。文档示例包含 `192.168.0.0/16` 以及 `fc00::/7`。判断依据：打印机地址落在已排除 CIDR 内，则「不应被自动路由送进 tun」；若设备在 `10.0.0.0/8` 或 `172.16.0.0/12`，而排除列表只有 `192.168.0.0/16`，则记录为排除未覆盖实际网段。`route-address` 会在启用 auto-route 时改为路由自定义网段而不是默认路由，一般无需配置；一旦书写，要反过来检查打印机网段有没有被写进接管范围。
3. 多网卡时检查出口与接口过滤。`auto-detect-interface` 自动选择流量出口接口，多出口网卡同时连接的设备建议手动指定出口网卡。`include-interface` 限制被路由的接口，`exclude-interface` 排除接口，二者冲突、不可一起配置。判断依据：打印机若挂在未被包含或已被排除的接口后面，检查结论应写接口过滤，而不是设备离线。
4. 仅在 Linux 且已启用 auto-route 与 auto-redirect 时，按来源 MAC 限制或排除局域网设备。把打印机 MAC 与 `include-mac-address`、`exclude-mac-address` 对照。前提不满足时，不要用这两项解释结果。
5. 若习惯用主机名找打印机：`dns-hijack` 将匹配到的连接导入内部 dns 模块；在 MacOS / Windows 无法自动劫持发往局域网的 dns 请求。判断依据：主机名失败而地址可通，应记为局域网 DNS 未被劫持，而不是打印服务消失。

## 失败时下一步

仍发现不了打印机时，先确认地址是否落在 `route-exclude-address` 覆盖范围；旧写法 `inet4-route-exclude-address` 即将废弃，若混用，以当前仍应生效的字段为准并计划迁移。接着检查 `strict-route`：启用 auto-route 时执行严格路由。Linux 中会让不支持的网络无法到达，并将所有连接路由到 tun。Windows 中会添加防火墙规则以阻止普通多宿主 DNS 解析行为造成的 DNS 泄露，并可能使 VirtualBox 等在某些情况下无法正常工作。同类旁路目标异常时，应单独对比严格路由开关，而不是同时改多项。Linux 上若使用 `route-address-set` 或 `route-exclude-address-set`，还须满足 nftables 以及 auto-route、auto-redirect 已启用，且与任意配置中的 routing-mark 冲突。

资料：https://wiki.metacubex.one/config/inbound/tun/
