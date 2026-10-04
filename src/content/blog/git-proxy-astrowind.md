---
title: "Clash 电脑端：Git 下载走本地代理前怎样整理已有配置"
description: "Clash 电脑端：Git 下载走本地代理前怎样整理已有配置。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件

在电脑端让 Git 经 Clash 本机入站下载前，应先整理 Git 里已经存在的代理相关项。旧的 `http.proxy`、`https.proxy`、改写远程地址的 insteadOf，以及终端里残留的代理变量，会和内核入站的 authentication、skip-auth-prefixes 叠在一起，导致无法判断失败来自 Git 还是来自 Clash。本文只处理整理已有配置，不把网页接入方式写成另一套教程。

适用条件：Git 将使用 HTTP 或 HTTPS 访问远程；你计划把代理指向本机 http、https、socks 或 mixed 入站；当前仓库或全局配置里可能已经写过代理。SSH 远程不走这些 HTTP 代理项，不在本文范围。allow-lan、bind-address 只约束谁能连入站，不能代替 Git 侧的清理。整理过程中不要把 geodata-mode、外部用户界面路径或缓存项当成 Git 代理来源，它们不会出现在 `git config` 列表里。

## 按来源列出已有项

在仓库内执行 `git config --list --show-origin`，需要区分级别时可加上 `--show-scope`。判断依据是每一行左侧的文件路径：系统级、用户全局、当前仓库本地。重点看 `http.proxy`、`https.proxy`、`http.<url>.proxy` 以及 `url.*.insteadof`。同一键在多级文件出现时，较窄范围覆盖较宽范围。

把完整输出留存后再改，避免漏项。若某行指向的地址并不是这次要用的本机入站，应视为冲突项。终端环境变量不属于 Git 配置文件，但未设置 `http.proxy` 时，Git 仍可能读取 `HTTP_PROXY` 与 `HTTPS_PROXY`。整理文件的同时，在同一终端列出名称含 proxy 的环境项，以免文件清干净后仍被会话带走。当前目录不是 Git 仓库时，列表里不会出现 local，不能用这次结果证明某个仓库内部是空的。

## 对照入站约束决定去留

Clash 全局配置里，http(s)、socks、mixed 入站可以设置 authentication。若入站需要账号，Git 的代理值必须能提供对应信息，否则握手在入站就会被拒绝。skip-auth-prefixes 默认包含 `127.0.0.1/8` 与 `::1/128`，本机回环访问通常可跳过验证；若代理写成其他地址，则不能按本机免验证来假设。还要看该地址是否被 bind-address 限制，以及 allow-lan 为 true 时是否落入 lan-allowed-ips，或被 lan-disallowed-ips 排除。

mode 为 direct 时，流量进入内核后会全局直连，此时即使 Git 代理指向入站，也不等于按规则出站。mode 为 global 时走 GLOBAL 策略，为 rule 时按规则。整理 Git 配置时不要用改 mode 来代替删除错误的 `http.proxy`。判断是否整理完成：对 `http.proxy` 与 `https.proxy` 执行带 `--show-origin` 的读取，要么为空，要么只剩下你明确指定的本机入站，且来源文件符合预期范围。insteadOf 若仍把主机改写到另一地址，即使 proxy 键已空，下载入口仍可能不是你以为的那条。

## 整理失败时的下一步

若列出命令看不到 proxy 但下载仍走陌生地址，先查 insteadOf 和带 URL 的细粒度代理键。若删除本地配置后旧代理仍在，说明生效的是全局或系统级文件，应按 `--show-origin` 给出的路径去改对应文件，而不是在仓库里反复删除。

若整理后连接被拒绝，把 log-level 设为 info 或 debug 再试一次下载。silent 时控制台不输出，无法判断请求有没有进内核；error 往往只在无法使用时出现，也不够用来确认入站是否收到 Git。find-process-mode 为 off 时日志可能缺少进程名，不要因此误判 Git 没有发请求。ipv6 为 false 时，仅 IPv6 远程失败也不能说明 Git 配置没整理好。确认入站与验证规则后，再决定是否写入新的代理值；在旧值未清理前不要叠加新值。

参考资料：
https://wiki.metacubex.one/config/general/
