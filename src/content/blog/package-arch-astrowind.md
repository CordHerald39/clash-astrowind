---
title: "Clash 电脑端：安装包怎么按处理器架构选择"
description: "Clash 电脑端：安装包怎么按处理器架构选择。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-09-30"
updated: "2026-09-30"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash Verge Rev 的安装包按操作系统和处理器架构拆分。选包依据是准备安装的那台机器的系统与架构，而不是下载所用电脑或网盘备注。仓库要求到发布页下载对应安装包。仓库总览给出的架构范围，与当前 Release 下载分区列出的选项并不完全相同，下载前须两处对照。

https://github.com/clash-verge-rev/clash-verge-rev
https://github.com/clash-verge-rev/clash-verge-rev/releases

## 适用条件与对照顺序

适用条件：在本机安装或升级 Clash Verge Rev。仓库总览写明支持 Windows（x64/x86）、Linux（x64/arm64）和 macOS 11 及以上（intel/apple）。同一版本发布说明再按 Windows、macOS、Linux 分区给出当次可下的架构。当前正式版还标明 Windows 不再支持 Win7。

具体操作：确认目标系统落在总览范围内；打开同一版本发布页，只进入对应系统的下载分区；在当次已列出的架构标签中选择，不要用总览里出现过、但本版本未提供的项去改下其他系统的包。正式版、预发布与 AutoBuild 不要混用。仓库将 Stable 标为适合日常使用的正式版，将 AutoBuild 标为滚动更新、适合测试反馈。

下载后先核对三点：文件是否来自目标系统分区；发布页标签或文件名是否对应所需架构（如 64 位、ARM64、ARMv7、x64、aarch64、arm64、armhf）；版本通道是否同属一条。

## Windows：总览含 x86，当前发布页为 64 位与 ARM64

仓库总览写 Windows 支持 x64/x86。当前 Release 则写：正常版本（推荐）提供 64 位（常用）和 ARM64（不常用）；内置 Webview2 版体积较大，仅在企业版系统或无法安装 webview2 时使用，同样分 64 位与 ARM64。当次发布说明未再列出 x86 安装包。

判断依据：目标环境对应发布页的 64 位时，选正常版本的 64 位；需要 ARM64 时选 ARM64。未落入“企业版或无法安装 webview2”条件时，用正常版本；只有满足该条件时，才改用同架构的内置 Webview2 包。系统须不在已不再支持的 Win7 之列。

失败时下一步：回到同一 Release 的 Windows 分区，更换为当次列表中与目标架构一致的正常版本，不要改下 macOS 或 Linux 文件。若需要的是总览中的 x86，而当前 Release 未提供，则该版本没有对应安装包，不能用 64 位、ARM64 或其他系统的包代替。

## macOS：按 Apple M 芯片或 Intel 芯片与文件名对应

仓库总览写 macOS 11+（intel/apple）。发布页标签为 Apple M 芯片与 Intel 芯片。当前正式版 Assets 中，`aarch64.dmg`、`aarch64.app.tar.gz` 对应 Apple M 芯片；`x64.dmg`、`x64.app.tar.gz` 对应 Intel 芯片。适用条件：芯片类型与文件名中的 aarch64 或 x64 一致，且系统不低于 macOS 11。

判断依据：按本机是 Apple 芯片还是 Intel 芯片，下载同版本对应标签。dmg 与 app.tar.gz 只是封装不同，架构后缀仍须匹配。不要把 x64 包当作 Apple M 芯片包使用，也不要把 aarch64 包当作 Intel 芯片包使用。

失败时下一步：仍在同一 Release 的 macOS 分区，按 aarch64 与 x64 后缀换成另一组同版本文件，不要改用 Windows 或 Linux 资源。

## Linux：总览为 x64/arm64，当前 Release 另列 ARMv7

仓库总览写 Linux 支持 x64/arm64。当前 Release 在 DEB 包（Debian 系，使用 apt 加本地路径安装）和 RPM 包（Redhat 系，使用 dnf 加本地路径安装）下均列出 64 位、ARM64、ARMv7。Assets 中 `arm64.deb`、`aarch64.rpm` 对应 ARM64；`armhf.deb`、`armhfp.rpm` 对应 ARMv7；64 位包对应总览中的 x64。

判断依据：先按发行版族选择 DEB 或 RPM，再在当次列出的三个架构中选择。ARMv7 以当前 Release 为准，不能只用总览的两种架构去排除已提供的第三种包。不要跨格式、跨系统取包。

失败时下一步：留在同一版本、同一包格式内，只更换架构后缀正确的文件。不要用另一系统分区的安装包，也不要改用预发布或 AutoBuild 来凑架构。核心规则：系统决定包格式与下载分区，处理器决定在当次发布页已列出的架构中选哪一项；macOS 则在 Apple M 芯片与 Intel 芯片之间按文件名后缀对应。
