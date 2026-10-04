---
title: "Clash 电脑端：从 GitHub 找到客户端正式发行页"
description: "Clash 电脑端：从 GitHub 找到客户端正式发行页。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-03"
updated: "2026-10-05"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash 电脑端要找的是带图形界面的客户端发行页，而不是内核二进制仓库。MetaCubeX 手册把 clash-verge-rev 列为 Windows、macOS、Linux 上仍在维护的图形客户端，并把原 clash-verge 标为停止维护。README 写明请到发布页面下载对应安装包；安装文档写明目前仅通过 GitHub Release 发布，请注意辨别。

适用条件以安装文档和 Latest Release 下载说明为准。Windows 为 10/11，现版本不再支持 Windows 7，安装包为 64 位（常用）和 ARM64；不清楚 Windows 架构时，安装文档仅在 Windows 段建议先选 x64。Linux 提供 64 位、ARM64，安装文档与 Release 还列出 ARMv7 的 deb 与 rpm。macOS 安装文档写明支持 12 及以上（Intel 或 Apple 芯片）；macOS 11 需自行替换内核，并建议升级系统。README 另写 Windows (x64/x86) 与 macOS 11+，但安装文档架构表和 Latest Release 说明未列出 x86 安装包，macOS 以 12 及以上为准。MetaCubeX/mihomo 的 Releases 只提供各平台内核压缩包，不能当作客户端安装入口。

## 从仓库进入正式发行页

仓库主页为 https://github.com/clash-verge-rev/clash-verge-rev 。进入仓库后打开 Releases，或直接访问 https://github.com/clash-verge-rev/clash-verge-rev/releases 。README 同样指向该 Release page。到达页面后，以带 Latest 标记的条目作为当前正式版入口，再在该版本的 Assets 中按操作系统选取安装包。Windows 区分普通安装包与带 fix_webview2 字样的包；macOS 区分 Apple 芯片与 Intel；Linux 按发行版选择 deb（Debian 系，用 apt 安装本地包）或 rpm（Red Hat 系，用 dnf/yum 安装）。核对仓库所有者为 clash-verge-rev、仓库名完整，避免进入同名仿页或仅含内核的 MetaCubeX/mihomo。

## 如何判断正式版与测试通道

README 用表格区分通道：Stable 为正式版，面向日常使用，对应主 Releases 列表；Alpha 已废弃，不要再跟 alpha 标签；AutoBuild 是滚动更新通道，面向测试反馈，可能存在缺陷，对应 releases/tag/autobuild。安装文档同样区分 GitHub Release 正式版与测试版。需要正式发行页时，只认 Latest 且未标 Pre-release 的条目。带 Pre-release、rc、autobuild、alpha 的通道都不作为正式版。Windows 带 fix_webview2 的包体积更大，仅在系统缺少且无法安装 WebView2、或无法打开面板时再考虑。Scoop 分发被标明为社区维护，不为下游渠道问题提供支持，不能替代 GitHub 正式发行页。

## 页面异常或下错包时的排查

发行页出现加载失败、No results found 或提示重新加载时，先整页刷新，确认浏览器能打开 github.com，必要时更换网络后再试。若地址落到 https://github.com/MetaCubeX/mihomo/releases ，那是内核页，应改回 clash-verge-rev 的 Releases。若打开的是已停更的 clash-verge，按手册改用 clash-verge-rev。列表同时有 Latest、旧版本和预发布时，以 Latest 非预发布为准；不要把 Source code 的 zip 或 tar.gz 当作安装程序。Windows 确认不是 Win7；macOS 按安装文档核对其为 12 及以上。下载前再核对应系统、架构和包类型：Windows 在 64 位与 ARM64 之间选择；macOS 按 Intel 或 Apple 芯片选择，不能把 Windows 的 x64 建议套到 macOS。

## 仍然找不到时的下一步

GitHub 持续无法访问时，回到 Clash Verge Rev 安装文档的“发布地址”一节核对：它声明仅通过 GitHub Release 发布。不要把搜索结果里的第三方盘或改名站点当成正式页。需要确认某项目是否仍维护，对照 MetaCubeX 三方客户端列表中的维护状态，再进入对应仓库 Releases。若目标其实是内核而不是图形界面，才使用 mihomo 的 Releases，并阅读该页“我应该下载哪个文件”的说明。Clash Mi 手册虽给出 Windows 包名规则 clashmi_xxx_windows_x64.exe 并指向其 GitHub Release，系统要求 Windows 10 及以上，但其说明定位为移动端代理工具；电脑端从 GitHub 找 Clash 图形客户端正式发行页，仍以 clash-verge-rev 的 Releases 为准。

https://raw.githubusercontent.com/clash-verge-rev/clash-verge-rev/dev/README.md
https://www.clashverge.dev/install.html
https://wiki.metacubex.one/startup/client/client/
https://clashmi.app/guide/

## 更新补充：项目选择与发行来源

Clash电脑端并非单一官方客户端。MetaCubeX手册将相关图形程序列为使用或带有mihomo内核的三方工具/客户端，并写明并不直接控制这些开发，它们未必包含内核官方版本的最新功能与修复。要从GitHub找到电脑端正式发行页，应先按操作系统在该清单确认“维护中”的项目全名，再搜索对应仓库，进入Releases（发行）列表获取安装文件。不要使用论坛附件、网盘或名称相近的fork。

## 适用条件

本流程适用于在Windows、macOS或Linux桌面安装图形客户端，并要求从GitHub发行记录取包的情况。系统必须与手册分区一致，不要用Android、iOS、OpenWRT、Merlin或Shell条目去找电脑安装包。clash-verge、clashN在手册中为停止维护，不宜再作为当前发行来源。Flowvy、ClashMac等备注为不开源的项目通常没有可核对的GitHub Releases，本流程不适用。Clash Verge Rev文档称其为Clash Verge的延续，基于Tauri的Mihomo GUI，内置Clash.Meta(mihomo)内核；可用该站点核对身份，安装文件仍须到对应仓库的Releases查找。

## 从手册确认项目与维护状态

打开手册“三方工具/客户端”页，只看本机系统表格中的项目名称、维护状态和备注。电脑端常见维护中名称包括clash-verge-rev、clash-nyanpasu、sparkle、FlClash、GUI.for.Clash、clashtui、Pandora-Box、pure-clash等，Linux另有mihoro、ShellCrash等。名称须与表格完全一致。备注“前端开源，构建不可复现”表示即使找到仓库，发行包也不保证能按源码完整复现，需自行决定是否使用。手册要求非内核问题反馈给各三方工具，因此GitHub发行页由客户端维护者发布，不是内核文档站点代为托管。

## 在GitHub上打开正式发行页

在GitHub搜索上一步的完整项目名，打开与手册名称对应、说明指向mihomo或Clash图形界面的仓库。正式发行页即该仓库Releases列表，含版本Tag、发布说明和桌面安装文件。同时满足以下依据再继续：仓库名与清单项目对应；由该仓库发布而非无关fork；文件面向Windows、macOS或Linux。不要把Issues或分支上的临时附件当成发行页。出现大量fork时，对照手册维护状态，并查看说明是否写明基于Tauri、使用mihomo。Clash Verge Rev文档导航含“下载、安装与卸载”，可用来排除已停更的clash-verge旧仓库。

## 找不到发行页时的排查

搜索无结果时，核对拼写并确认手册中是否仍为维护中、是否不开源。停更仓库可能留有历史Releases，但不代表继续更新，应改选同系统下其他维护中项目再搜。仅有源码没有Releases，说明安装包可能未在GitHub发布，不要改用转载站同名文件，应换清单中其他维护中且非“不开源”的项目。仓库存在但Releases为空时，等待该项目发布，或改搜clash-verge-rev、sparkle、FlClash等维护中名称。误入clash-verge时，按手册改为clash-verge-rev。选定后按该次发行说明选择匹配本机架构的文件。非内核问题向对应客户端反馈。

https://wiki.metacubex.one/startup/client/client/
https://www.clashverge.dev
