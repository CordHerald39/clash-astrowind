---
title: "Windows 上的 Clash：系统代理与 TUN 如何选择"
description: "按安装、配置与流量接管三个阶段完成 Windows 设置，理解系统代理和 TUN 的边界。"
date: "2026-09-30"
updated: "2026-09-30"
category: "电脑版"
tags: ["Clash", "电脑版"]
author: "Clash 指南编辑部"
draft: false
---

## 先确认安装包适合电脑

在 Windows 设置的系统信息中查看系统类型。x64 与 ARM64 是不同架构，下载时结合客户端发行说明选择。Clash Verge Rev 的安装文档列出相应架构，旧 Windows 系统应单独确认支持范围。

## 系统代理覆盖哪些软件

开启系统代理后，遵循 Windows 代理设置的应用才会使用它。浏览器常能直接验证，但某些程序有独立网络设置。若浏览器可用、其他程序不可用，先检查客户端连接记录里有没有该程序的请求。

## 什么时候考虑 TUN

需要接管更多网络流量时，可根据客户端文档设置 TUN。它可能需要服务权限，也可能与其他 VPN、虚拟网卡产生冲突。先用系统代理建立一个可工作的基准，再启用 TUN，比同时打开多个开关更容易排错。

全局模式决定已进入内核的流量采用哪个代理组，不会自动保证每个程序都把流量交给客户端。

## 退出后的检查

正常退出后打开一个直连页面，确认系统代理没有遗留本地端口。强制结束进程后尤其要检查 Windows 代理设置。遇到故障先恢复直连，再分阶段重新启用。

## 来源

[Clash Verge Rev 项目](https://github.com/clash-verge-rev/clash-verge-rev)及[使用文档](https://www.clashverge.dev/guide/quickstart.html)，查阅于 2026-09-30。
