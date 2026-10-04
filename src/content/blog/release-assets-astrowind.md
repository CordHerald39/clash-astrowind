---
title: "Clash 电脑端：发行页里多个附件怎么选"
description: "Clash 电脑端：发行页里多个附件怎么选。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

打开 Clash Verge Rev 的 GitHub 正式版发行页后，同一版本号下面会挂出大量附件。这些文件按操作系统、处理器架构和打包方式拆分，并不能互相替代。选错的典型后果是安装包无法在本机运行，或把签名、清单文件当成安装程序。判断依据以仓库安装说明和该条发布正文里的「下载地址」分组为准，而不是 Assets 列表的排列顺序或文件体积。

## 先定通道和系统，再进入对应发布

仓库将发行通道分为三类：Stable 为正式版，面向日常使用；Alpha 已标明废弃；AutoBuild 为滚动更新，面向测试反馈，并写明可能存在缺陷。电脑端日常安装应打开正式版 Release 列表，进入带版本号的发布，而不是 Alpha 或 AutoBuild 标签页。

仓库写明支持范围：Windows（x64/x86）、Linux（x64/arm64）、macOS 11 及以上（Intel / Apple）。各正式版发布说明对 Windows 另有一条限制：不再支持 Win7。系统不在上述范围内时，附件列表里不会出现可用的替代安装包，应先确认系统版本是否仍被支持，而不是在旧系统上改下其他后缀的文件。

## 按「下载地址」分组对照文件名

Windows 发布说明把安装包分成两组。一组为「正常版本」，正文标为推荐：文件名形如 Clash.Verge_版本号_x64-setup.exe，对应 64 位（常用）；形如 Clash.Verge_版本号_arm64-setup.exe，对应 ARM64（不常用）。另一组文件名含 fixed_webview2，说明写明体积较大，仅在企业版系统或无法安装 WebView2 时使用。本机是常见的 64 位 Windows 时，对应不含 fixed_webview2 的 x64-setup.exe；仅当处理器为 ARM64 时才选 arm64。只有确认处于企业版限制或无法安装 WebView2 的条件，才改选同一架构的 fixed_webview2 安装包。不要把 x64 与 arm64 混用。

macOS 发布条目对应两个 dmg：aarch64.dmg 给 Apple M 芯片，x64.dmg 给 Intel 芯片。芯片类型必须与文件名中的 aarch64、x64 一致。同一发布的 Assets 里还可能出现 aarch64.app.tar.gz、x64.app.tar.gz。发布正文的 macOS 下载地址指向的是 dmg，选择时应与该分组一致，而不是在多种 macOS 打包之间任意替换。

Linux 按软件包格式和架构拆分。Debian 系使用 deb，发布说明写明用 apt ./路径 安装：64 位为 amd64.deb，ARM64 为 arm64.deb，ARMv7 为 armhf.deb。Red Hat 系使用 rpm，说明写明用 dnf ./路径 安装：对应 x86_64.rpm、aarch64.rpm、armhfp.rpm。先确认本机应使用 deb 还是 rpm，再匹配 amd64/x86_64、arm64/aarch64 或 armhf/armhfp，只保留一个文件。

## 哪些附件不是安装包，选错后如何核对

Assets 中常混有 .sig 与 latest.json。前者是安装包的签名文件，后者是版本清单，都不能当作安装程序运行。跨系统文件也不要混用：Windows 不要选择 deb、rpm 或 dmg；macOS 不要选择 exe；Linux 不要选择 setup.exe。版本号相同但架构后缀不同，视为不同附件，不能互相替换。

下载后无法安装，或提示架构、运行库不符时，回到同一条发布做三步核对：系统是否仍在支持列表内（含 Win7 已排除）；文件名中的 x64、amd64、arm64、aarch64、armhf、armhfp 是否与本机处理器一致；Windows 是否在普通环境与「企业版或无法安装 WebView2」之间选错了 fixed_webview2。仍无法判断时，以该条正文「下载地址」的分组标题和链接为准。仓库同时写明安装说明和常见问题在文档页，发布正文也列出 FAQ 入口；对照文件名后仍失败，应转去查阅该说明，而不是改下其他架构或其他通道的附件。

https://github.com/clash-verge-rev/clash-verge-rev/releases
https://github.com/clash-verge-rev/clash-verge-rev
