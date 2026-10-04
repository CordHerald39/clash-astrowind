---
title: "备份 Clash 前怎样列出需要保留的内容"
description: "备份 Clash 前怎样列出需要保留的内容。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

备份前应先列出“恢复后必须仍在”的项，而不是把工作目录整包复制。下面只说明如何根据全局配置字段整理保留清单、怎样判断某项该不该进清单，以及清单列不全时如何补。依据为全局配置说明。

## 适用条件

适用于准备归档或迁移 mihomo 配置，并希望恢复后仍保持相同的局域网访问、鉴权、API、出站接口与 GEO 下载行为。清单必须来自实际 YAML 里已出现的键，或生产环境明确依赖、只是未写出来的默认行为。未写的键若其实靠默认值运行，备份时也要标注“来源是默认值”，否则恢复后无法判断是丢失还是故意省略。

## 按职责把保留项写成三类

第一类是谁能连上内核。`allow-lan` 决定是否允许其他设备经过代理端口访问互联网。`bind-address` 可绑定 `*`、单个 IPv4 或单个 IPv6。`lan-allowed-ips` 仅在 `allow-lan` 为 true 时生效，默认值为 `0.0.0.0/0` 与 `::/0`。`lan-disallowed-ips` 是禁止连接的地址段，黑名单优先级高于白名单，默认值为空。`authentication` 为 http(s) / socks / mixed 代理的用户验证；`skip-auth-prefixes` 为允许跳过验证的 IP 段。判断依据：凡是决定入口范围或口令的键，都必须逐条抄进清单，包括用户名对、绑定地址与网段，而不是只记“开过局域网”。

第二类是外部控制、界面与证书。`external-controller` 为 API 监听地址；另有 CORS、`external-controller-unix`、`external-controller-pipe`、`external-controller-tls`、`external-controller-routing-mark`（仅 Linux）、`external-doh-server` 与 `secret`。从 Unix socket 或 Windows namedpipe 访问 API 不会验证 secret，DOH 路径也不会验证 secret。`external-ui` 是静态网页资源路径，可为绝对路径或工作目录相对路径；路径不在工作目录时，须用 `SAFE_PATHS` 环境变量加入安全路径，语法同本操作系统的 PATH（Windows 下分号，其他系统下冒号）。`external-ui-name` 会合并到指定子目录；`external-ui-url` 决定界面下载地址。`tls` 中的 `certificate`、`private-key`、`ech-key` 可以是 PEM 或路径，自 v1.19.18 起本地文件支持自动重载。判断依据：缺密钥、缺证书路径、缺 `SAFE_PATHS` 或只拷 YAML 不拷界面目录，恢复后控制面或 `/ui` 都无法按原样工作，这些都要进保留清单。

第三类是运行参数、出站与可持久化状态。`mode` 可选 rule、global、direct，默认为规则模式。`log-level` 控制控制台与控制页面输出。`ipv6` 默认 true。`keep-alive-interval`、`keep-alive-idle`、`disable-keep-alive` 用于 TCP Keep Alive，Android 上 `disable-keep-alive` 强制为 true。`find-process-mode` 可选 always、strict、off，默认 strict，推荐在路由器上使用 off。`interface-name` 为出站接口，`routing-mark` 为 Linux 出站默认标记。`unified-delay` 与 `tcp-concurrent` 影响测延迟与连接方式。`profile.store-selected` 储存 API 对策略组的选择供下次启动使用，`profile.store-fake-ip` 储存 fakeip 映射表。GEO 相关包括 `geodata-mode`、`geodata-loader`、`geo-auto-update`、`geo-update-interval`、`geox-url`、`global-ua`、`etag-support`。判断依据：希望恢复后模式、网卡、进程匹配、策略组选择或 fakeip 映射仍一致时，对应键和缓存都要列入；只拷 YAML 不足以保留 `store-selected` 与 `store-fake-ip` 的实际数据。

## 列清单步骤与失败时下一步

按文件全局段扫描：每遇到上述键，记录键名、当前值、是否密钥、是否路径、是否依赖环境变量。路径类注明相对还是绝对、是否需要 `SAFE_PATHS`。API 类注明是否监听非本机、是否启用了不校验 secret 的 unix、pipe 或 DOH。`profile` 两项单独写清“配置开关”和“对应存储是否一并保留”。GEO 与界面下载地址记下当前使用的 URL 与 UA，避免恢复后回到默认的 `clash.meta` 或默认加载器。

若列完仍无法确定能否备份：对照手册默认值，把“文件未出现但生产依赖非默认行为”的项补进清单。若只有 YAML、没有策略组选择的存储，须在清单标明选择不会随这份备份恢复。若证书是路径而不是内联 PEM，清单必须包含证书和私钥文件本身。若 `bind-address` 绑的是当前主机地址，清单应提示迁到其他机器时要改写，否则保留的是错误绑定。不要把口令与 PEM 写进不受控的明文便笺。

https://wiki.metacubex.one/config/general/
