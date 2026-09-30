---
title: "Clash 电脑版下载与 Windows 配置"
description: "找到 Windows 客户端原始下载入口，区分 x64 与 ARM64，完成系统代理与连接检查。"
date: "2026-09-30"
updated: "2026-09-30"
category: "下载与教程"
tags: ["Clash", "下载与教程"]
author: "Clash 指南编辑部"
draft: false
---

## 选择桌面客户端

[Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases)和[FlClash](https://github.com/chen08209/FlClash/releases)提供 Windows 发行包。Clash for Windows 是不同的历史客户端名称，不应将所有桌面项目当作其连续升级版。

## 确认系统类型

在 Windows 设置的“系统 → 关于”查看系统类型。x64 对应常见 Intel/AMD 64 位系统，ARM64 对应相应 Windows on ARM 环境。EXE 可能是安装器也可能是程序本体，按资产名称和开发者说明判断。

## 导入与开启代理

导入订阅，更新并激活配置，然后选择模式与节点。先用系统代理测试浏览器；需要接管其他程序时再按照文档配置 TUN。全局模式与流量接管范围是两回事。

## 验证与退出

查看连接记录中的目标域名和命中规则，比较一个目标网页与日常直连页面。退出后确认 Windows 没有遗留不可用的本地代理设置。

详细说明：[Windows 设置](../blog/windows-setup/)、[订阅导入](../blog/subscription-import/)。
