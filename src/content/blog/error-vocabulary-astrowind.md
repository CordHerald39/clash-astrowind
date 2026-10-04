---
title: "Clash 报错文字怎样按阶段分类"
description: "Clash 报错文字怎样按阶段分类。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 先用日志级别确定能分类的文字范围

把 Clash 报错文字按阶段分类，前提是全局配置里的 `log-level` 已经允许相应等级出现。官方说明：该字段控制内核输出日志的等级，仅在控制台和控制页面输出。取值为 `silent`（静默，不输出）、`error`（仅输出发生错误至无法使用的日志）、`warning`（输出发生错误但不影响运行的日志，以及 error 级别内容）、`info`（输出一般运行的内容，以及 error 和 warning 级别的日志）、`debug`（尽可能输出运行中所有的信息）。

适用条件有两条。其一，你能对照全局配置读到当前级别，并且知道 `mode` 是 `rule`、`global` 还是 `direct`（此项有默认值，默认为规则模式）。其二，待分类的是控制台或控制页面里的原文，而不是改写后的口头摘要。若级别为 `silent`，分类不能开始。若级别为 `error`，只能给「已无法使用」的失败归类，不能把尚未出现的 warning、info 当成同一阶段的证据。

判断依据是文字所在的级别，而不是句子长短：伴随无法继续提供能力的，先按 error 对应的失控来归；明确出错但仍在运行的，按 warning 对应的降级来归；只是一般运行内容的，归入 info，通常还不是故障阶段。`debug` 会显著增加条目，必须先按下一节的配置域切开，再给每条文字一个主阶段。

## 按全局配置域切成五个阶段

阶段划分应让每条报错只落入一个主阶段，阶段名直接使用官方已经分开的配置域，不另造名称。

阶段 A 是运行模式与进程识别，字段为 `mode` 与 `find-process-mode`。`mode` 取值 rule（规则匹配）、global（全局代理，需要在 GLOBAL 策略组选择代理或策略）、direct（全局直连）。`find-process-mode` 取值 always（强制匹配所有进程）、strict（默认，由内核判断是否开启）、off（不匹配进程，官方推荐在路由器上使用）。文字若在讨论规则、GLOBAL、直连或进程匹配，先归本阶段；同一句在路由器（off）与桌面（strict/always）上的含义不同，分类时要记下该字段。

阶段 B 是入站与局域网访问控制，字段包括 `allow-lan`、`bind-address`、`lan-allowed-ips`、`lan-disallowed-ips`、`authentication`、`skip-auth-prefixes`。文字涉及其他设备经过代理端口访问、绑定 `*` 或单个 IPv4/IPv6、白名单与黑名单、http(s)/socks/mixed 用户验证，归入本阶段。官方写明黑名单优先级高于白名单，这是判断「特定 IP 为何进不来」的依据，不要和出站失败写在一起。

阶段 C 是出站传输与接口，字段包括 `keep-alive-interval`、`keep-alive-idle`、`disable-keep-alive`、`tcp-concurrent`、`unified-delay`、`interface-name`、`routing-mark`。文字围绕 TCP Keep Alive、并发连接、出站网卡或 Linux 流量标记，归入本阶段。官方说明修改 Keep Alive 与减少移动设备耗电有关，且在 Android 上 `disable-keep-alive` 强制为 true，分类时要把设备类型写入备注。

阶段 D 是外部控制与 TLS，字段包括 `external-controller`、`secret`、Unix socket、Windows namedpipe、`external-controller-tls` 以及 `tls`。文字是 RESTful API 监听、密钥、CORS、HTTPS-API 或证书与私钥，归入本阶段。官方提醒：从 Unix socket 或 namedpipe 访问 API 不会验证 secret。这类「未鉴权却能调用」不是入站代理验证失败，禁止并入阶段 B。

阶段 E 是缓存、GEO 与外部资源，字段包括 `profile` 下的 `store-selected`、`store-fake-ip`，以及 `geodata-mode`、`geodata-loader`、`geo-auto-update`、`etag-support`、`global-ua`。文字是策略组选择是否储存、fakeip 映射、GEO 加载或外部资源下载，归入本阶段，而不是即时连接失败。

## 落盘格式以及分类失败时的下一步

建议每条报错写成一行，顺序固定为：级别（error/warning/info/debug）→ 阶段（A 至 E）→ 命中的配置键 → 原始类型词（保留英文，不改写成笼统失败）。一行只允许一个主阶段；若一条原文跨两个域，拆成两行，不要合并。

若当前级别看不到足够文字，下一步只上调一级（例如 warning 到 info，或 info 到 debug），重新抓取后再分类，避免一次拉到 debug 导致阶段标签被冲掉。若文字既像入站验证又像 API 密钥问题，先看它是否出现在外部控制语句中：提到 RESTful API、`external-controller`、socket 或 pipe，即归阶段 D。若没有任何配置键可对应，停止分类，回到全局配置按章节逐项核对，而不是自造新的阶段名。

资料：
https://wiki.metacubex.one/config/general/
