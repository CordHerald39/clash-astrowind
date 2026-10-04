---
title: "Clash 规则模式首次使用怎样验证"
description: "Clash 规则模式首次使用怎样验证。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

首次使用规则模式，先确认内核当前处在「规则匹配」，而不是全局代理或全局直连。全局配置里的 `mode` 可选 `rule`、`global`、`direct`：`rule` 为规则匹配，`global` 为全局代理且需要在 `GLOBAL` 策略组选择代理或策略，`direct` 为全局直连。该项有默认值，默认为规则模式。资料没有规定某张测试网页或某个界面按钮作为验收标准，验证应落在配置取值和可观察的运行输出上。

## 适用条件

适用于第一次把运行模式定为规则匹配、需要判断是否真的在按规则工作的场合。适用于配置省略了 `mode`、需要知道默认值的场合。不适用于把策略组选择、外部面板皮肤当成模式本身。本页也不包含路由规则条目的写法，验证「是不是规则模式」不能改成核对某条域名规则。

## 验证步骤与判断依据

1. 读运行模式。配置里写 `mode: rule`，或完全未写 `mode`（默认即为规则模式），才能把当前行为理解成规则匹配。若实际是 `global`，流量走向取决于 `GLOBAL` 策略组里选中的出口，不是规则表。若实际是 `direct`，则为全局直连。判断：三种取值必须能分开指出，不要用「已经能上网」代替模式核对。
2. 打开足够的日志。`log-level` 决定内核输出等级，且仅在控制台和控制页面输出。`silent` 不输出；`error` 只输出发生错误至无法使用的日志；`warning` 还包括不影响运行的错误；`info` 输出一般运行内容以及 error、warning；`debug` 尽可能输出运行中所有信息。首次验证不要停在 `silent`。判断：控制台或控制页面能看到与当前等级相符的输出，才能继续观察启动是否报错。
3. 核对规则匹配可能依赖的全局条件。`ipv6` 控制是否允许内核接受 IPv6 流量，默认 true。`find-process-mode` 为 `always` 时强制匹配所有进程，`strict` 为默认并由 Clash 判断是否开启，`off` 不匹配进程（资料建议路由器上使用 `off`）。GEO 相关项决定匹配所用数据文件：`geodata-mode` 为 true 时 geoip 使用 dat，默认 false 对应 mmdb；`geodata-loader` 可选 `standard` 或默认的 `memconservative`；`geox-url` 可指定 geoip、geosite、mmdb、asn 的下载地址。判断：若你预期按进程或按 GEO 数据区分流量，这些项必须与预期一致，否则「模式已是 rule」仍不等于匹配条件已具备。
4. 若从本机以外访问代理端口，再核局域网项。`allow-lan` 为 true 时允许其他设备经过代理端口访问互联网；`bind-address`、`lan-allowed-ips`、`lan-disallowed-ips` 以及 `authentication`、`skip-auth-prefixes` 会限制谁能连上。判断：其他设备连不上，应先看这些项，而不是否定规则模式本身。

## 失败时下一步

现象像「所有流量同一出口」时，先重读 `mode` 是否为 `global`，以及 `GLOBAL` 策略组是否已选出口。现象像「全部不走代理」时，先排除 `direct`。没有任何输出时，把 `log-level` 从 `silent` 调到 `info` 或 `debug`，仍只在控制台和控制页面查看。GEO 文件或进程匹配与预期不符时，分别改 `geodata-mode` / `geox-url` / `find-process-mode`，不要在本页未给出的规则语法上自行补步骤。

资料来源：
https://wiki.metacubex.one/config/general/
