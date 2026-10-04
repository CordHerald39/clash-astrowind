---
title: "Clash 故障怎样缩减成最小复现场景"
description: "Clash 故障怎样缩减成最小复现场景。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

要把故障缩成最小复现场景，关键不是少复制几行文本，而是在全局配置允许的开关里，每次只收紧一类会改变流量路径或观察窗口的变量，直到现象仍在、参与项最少。适用前提是同一类失败已经能稳定出现，但还说不清是运行模式、地址族、入站范围还是出站接口在起作用。缩减应在配置副本上进行，保留未改的全局段作为对照基准。

## 先固定观察窗口

将 `log-level` 调到能再次看见原问题的那一档。`silent` 不输出；`error` 仅无法使用级别；`warning` 含不影响运行的错误；`info` 含一般运行内容；`debug` 尽可能输出运行中所有信息。该级别只在控制台和控制页面输出。判断依据是能再次看到与原问题同一级别的记录。同一现象在 `warning` 能看见、在 `error` 看不见，说明尚未达到无法使用的级别，最小场景应固定在 `warning` 或 `info`，否则会把问题缩没。若 `debug` 仍无对应输出，下一步先确认当前不是 `silent`，不要继续删其他项。

## 收紧模式与入站边界

`mode` 默认为 `rule`。分别对照 `global`（需要在 GLOBAL 策略组选择代理或策略）和 `direct`。仅 `rule` 出现、`direct` 消失，说明与规则匹配路径有关；三种模式都出现，则不要把规则当成最小集。

`allow-lan` 为 true 才允许其他设备经代理端口访问互联网。`bind-address` 为 `*` 表示绑定所有地址，也可绑定单个 IPv4 或 IPv6。`lan-allowed-ips` 默认 `0.0.0.0/0` 与 `::/0`；`lan-disallowed-ips` 黑名单优先于白名单，默认空。本机进程问题应关闭局域网访问或收紧 bind；仅局域网客户端能复现时，保留 `allow-lan: true` 并写明网段。失败时下一步：检查测试地址是否落入黑名单。`ipv6` 默认 true，只在 IPv4 复现时可设为 false，避免双栈一起变化。

## 去掉会改出站路径的附加项

`find-process-mode` 中，`always` 强制匹配所有进程，`strict` 为默认并由内核判断是否开启，`off` 不匹配进程，资料写明推荐在路由器上使用。怀疑进程匹配时先改为 `off`。`interface-name` 指定出站网卡，`routing-mark` 为 Linux 出站提供默认标记，最小场景应写死为故障当场的值，避免随系统默认路由漂移。

`tcp-concurrent` 会对 DNS 解析出的全部 IP 发起连接并使用第一个成功的连接；`unified-delay` 会计算 RTT，以消除握手带来的延迟差异。偶发连通类故障应先关掉这两项，看是否变成稳定失败。Keep Alive 的间隔、空闲与禁用项会改变长连接维持方式；资料说明在 Android 上禁用项会被强制为 true。未证实与空闲断开有关时，电脑端不要顺手改这三项。`authentication` 与 `skip-auth-prefixes` 会把“连不上”变成鉴权问题，本机环回测试要对齐跳过验证的前缀。`external-controller` 若从 `127.0.0.1:9090` 改到监听所有 IP，或同时打开不校验 secret 的 Unix socket、Windows namedpipe，会引入额外通道。最小复现不要并列多种外部控制。

`profile` 的 `store-selected` 与 `store-fake-ip` 会在重启后带回策略组选择和 fakeip 映射，缩减过程若穿插重启，应视为额外变量。收紧后若现象消失，最近一次改动视为必要变量，恢复它再删其余项。若现象仍在，停止再叠加 GEO 自动更新、外部界面下载、ETag 等会访问外部资源的选项，以免下载与缓存污染场景。

https://wiki.metacubex.one/config/general/
