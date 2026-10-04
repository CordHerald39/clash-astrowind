---
title: "怎样确认 Clash 当前使用哪份配置"
description: "怎样确认 Clash 当前使用哪份配置。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

要确认 Clash 当前使用哪份配置，全局配置页没有提供「当前配置文件路径」字段。能依据的事实是：内核按全局项运行，并可用 RESTful API 控制；相对路径相对 Clash 工作目录解析；日志级别仅在控制台和控制页面输出。因此确认方式是用候选 YAML 里可观察的全局项去核对运行行为，而不是猜测文件名。

## 适用条件

适用于同一环境里可能有多份 YAML、或相对路径依赖工作目录、需要判断此刻内核行为对应哪一份的场合。适用于能看到控制台或控制页面日志，或能连上本页所述外部控制地址。不适用于订阅是否下载成功。本页未记载图形菜单，不把未写出的按钮当作步骤。

## 用可观察全局项核对

1. 先列出各候选文件中互不相同的全局项。可用作身份标记的包括：mode（rule、global、direct，默认规则模式）、log-level（silent、error、warning、info、debug）、external-controller 监听地址、secret、allow-lan 与 bind-address、ipv6、find-process-mode。两份文件若这些项完全相同，单靠对照无法区分。
2. 再观察运行中的对应行为。log-level 只在控制台和控制页面输出：若候选文件写 debug，而运行侧只有 error 级别内容，则该文件未成为当前运行配置，或尚未进入内核。external-controller 写成 127.0.0.1:9090 时，RESTful API 应在该地址监听；还可另有 Unix socket、Windows namedpipe 与 TLS 端口。从 Unix socket 或 namedpipe 访问 API 不会验证 secret，连错入口会误判「连上了但密钥不对」。
3. 相对路径必须连同工作目录解释。external-ui 可以是绝对路径，或工作目录的相对路径；路径不在工作目录时需要设置 SAFE_PATHS，语法与操作系统 PATH 相同（Windows 用分号，其他系统用冒号）。打开另一目录下的同名相对路径文件，不等于内核读到的那一份。
4. 用局域网相关项当身份时，先看 allow-lan。其为 false 时，bind-address、lan-allowed-ips、lan-disallowed-ips 不会表现为对其它设备开放。黑名单优先于白名单。
5. 判断依据：运行中的日志级别、API 监听、局域网绑定与某一份文件声明一致，且相对路径按同一工作目录解释得通。若 API 改过内核，还须考虑 profile.store-selected 会保存策略组选择供下次启动使用，YAML 原文可能与启动后的选择不一致。

## 失败时下一步

多份文件全局项雷同，只改其中一份的 log-level 或监听端口再对照，不要同时改很多项。对不上时检查是否连到了 TLS 端口、Unix socket 或 namedpipe。仍无法判断则停止把未在本页出现的路径写成「当前配置」，回到行为对照。

资料来源：
https://wiki.metacubex.one/config/general/
