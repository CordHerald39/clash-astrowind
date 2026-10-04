---
title: "修改 Clash 配置后怎样确认已重新加载"
description: "修改 Clash 配置后怎样确认已重新加载。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

修改 Clash 全局项之后，本页并不提供一条名为「已重载」的专用回执。多数项只被写成 YAML 字段；明确写了自动重载的，是 API 使用的 TLS 本地文件。日志则只出现在控制台和控制页面。确认时必须把「证书文件被内核自动重载」「日志行为是否与字段一致」「要到下次启动才用的缓存」分开，不能把未记载的动作当成已经发生。

## 适用条件

适用于 MetaCubeX/mihomo 全局配置中已列出的字段，并且你能看到内核控制台或控制页面。适用于改动 allow-lan、mode、log-level、external-controller、tls 材料、profile 等本页出现的项。不适用于本页未记载的通用重载接口。证书自动重载仅当 certificate、private-key 或 ech-key 指向本地文件，且版本达到该页所写的自 v1.19.18 起。

## 按改动对象选择对照方式

若改的是 TLS 本地文件：确认范围只覆盖 API 的 https 所用材料，不代表整份 YAML 已被重新读取。路径若不在工作目录，该页要求用 SAFE_PATHS 按本操作系统 PATH 规则加入安全路径，否则连加载都可能被拒绝。

若改的是 log-level：silent 不输出；error 仅输出发生错误至无法使用的内容；warning 另含不影响运行的错误；info 再含一般运行内容；debug 尽可能输出运行中所有信息。YAML 已改为 silent 而控制台仍持续出现一般运行内容时，不能认为当前进程已按新字段工作。输出与字段一致，也只说明行为吻合，不能单独证明发生过一次重载，因为本页没有定义这种动作。

若改的是 mode：可选 rule、global、direct，缺省为规则模式。global 还要求在 GLOBAL 策略组选择代理或策略。它只能用来对照「当前模式是否与文件一致」，不是重载成功的充分条件。

## 不能当作重载证据的信号

profile 里 store-selected 储存 API 对策略组的选择，供下次启动使用；store-fake-ip 储存映射表，供域名再次连接。它们说明的是启动或后续连接是否复用缓存。geo-auto-update 与按小时计的 geo-update-interval 是 GEO 更新，和一次改配置不是同一事件。全局 TLS 指纹已弃用，改它不应再按本页预期生效。

核对外接控制时，应对齐 external-controller 与 secret。Unix socket 与 Windows namedpipe 访问不验证 secret，只能说明连上了某个监听，不能证明 YAML 中的 secret 已被加载。

## 失败时下一步

本页未给出通用重载失败码。日志等级或模式与文件持续不一致时，回到上一份仍能启动的配置文本，不要继续叠加修改。证书自动重载不生效时，检查是否确为本地文件、版本是否达到该页起点、路径是否已纳入 SAFE_PATHS。先确认控制面连的是你以为的那一进程，再做字段对照。

资料来源：
https://wiki.metacubex.one/config/general/
