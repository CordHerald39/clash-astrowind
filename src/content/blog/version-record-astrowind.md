---
title: "Clash 客户端与 Mihomo 内核版本：怎样查看并记录"
description: "Clash 客户端与 Mihomo 内核版本：怎样查看并记录。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

公开手册里的全局配置面向的是 MetaCubeX/mihomo 内核，并不等于某一款带界面的 Clash 发行包。查看并记录版本时，应先分清：你要对齐的是内核能力，还是外壳程序的自称版本。二者写在同一行又不加标注，后续对照配置会失效。

## 适用条件与资料边界

本文只依据 mihomo 全局配置说明，适用于已经能打开 YAML、控制台或外部控制接口，需要把“当前内核处于哪一档能力”写下来的场景。手册列出的是 `mode`、`log-level`、`external-controller`、`tls` 等内核项，没有给出某一图形客户端的关于页或菜单路径，因此不能把流传教程里的界面名称当成官方查看步骤。

若封装程序只提供订阅和开关、完全看不到配置文本，本文只能说明应当记录哪些内核侧信息，不能代替该封装自己的版本展示方式。Android、Linux、Windows 与路由器上可用字段并不相同，记录时必须带运行环境。

## 用手册写明的能力门槛判断内核

本页资料没有给出一条固定的“打印版本号”命令，但可以用已写明的行为门槛做判断。TLS 段规定：当 `certificate`、`private-key` 或 `ech-key` 为本地文件时，自 v1.19.18 起支持自动重载。若你的流程依赖“替换证书文件后无需重启”，记录里应写清：当前内核是否达到该门槛、三项是否指向本地文件。未达门槛时，不能把自动重载当成默认能力。

同时记下与核验直接相关的项：`log-level`（仅在控制台和控制页面输出，取值含 silent、error、warning、info、debug）、`mode`（rule / global / direct，默认规则模式）、`ipv6`、`find-process-mode`（always / strict / off；文档写明路由器上推荐 off）。这些字段能证明实际运行的是 mihomo 配置模型，而不是只记住了安装包上的数字。

外部控制建议一并记录：`external-controller` 地址、是否启用 Unix socket 或 Windows namedpipe、是否配置 `secret`。手册写明从 Unix socket 或 namedpipe 访问 API 不会验证 secret。能连上接口，不等于已经完成鉴权，记录访问方式与记录版本同等重要。

## 记录时如何把客户端和内核分开

建议用固定条目复制到文本，避免只留一张与教程相似的截图：

- 平台：Android 上 `disable-keep-alive` 被强制为 true；Linux 才支持 `routing-mark` 与 `external-controller-routing-mark`；Windows 才涉及 namedpipe；路由器场景应写清是否按建议关闭进程匹配。
- 内核侧：YAML 是否按该手册组织；是否出现 `geodata-mode`、`geodata-loader`、`geo-auto-update`、`global-ua`（默认值为 clash.meta）等仅在该说明中定义的字段。
- 能力门槛：是否需要并实际具备 v1.19.18 起的证书文件自动重载。
- 界面层：`external-ui`、`external-ui-name`、`external-ui-url` 只表示把静态网页挂到 API 的 `/ui`，这是内核提供的外部用户界面，不是安装包版本。
- 已弃用项：全局 TLS 指纹已弃用，应在 proxy 内设置 `client-fingerprint`。配置里若仍有全局指纹，应标明按旧写法保留，不能用来反推新内核。

不要把默认 UA `clash.meta` 直接写成客户端软件名，它只用于外部资源下载。

## 查不到或对不上时的下一步

完全看不到日志时，先确认 `log-level` 不是 silent，并且只到控制台或控制页面查找，不要假设存在未写入该页的日志菜单。无法确认是否已到 v1.19.18 时，不要宣称支持证书自动重载，改为注明“未核验该门槛”。若只有图形教程中的数字、对不上任何全局字段，将该数字标为“客户端或安装包自称版本”，另存一份与手册字段一致的 YAML 片段。外部界面或证书路径若不在工作目录，手册要求设置 `SAFE_PATHS`（语法同系统 PATH：Windows 用分号，其他系统用冒号）；读失败时应先补环境变量，而不是改写版本记录。

https://wiki.metacubex.one/config/general/
