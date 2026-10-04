---
title: "Clash 使用代理集合筛选条件前怎样列出目标节点"
description: "Clash 使用代理集合筛选条件前怎样列出目标节点。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash 代理集合里，真正参与 `filter`、`exclude-filter` 的是各条代理的 `name`，参与 `exclude-type` 的是各条代理的 `type`。写筛选条件之前，应先列出当前集合里实际存在的目标节点，而不是用集合自身的标识去代替这份清单。集合顶层的 `name`（如文档中的 `provider1`）只表示提供器名称，必须唯一、且建议不与策略组重名，它不是节点列表。

## 适用条件

适用于已经为 `proxy-providers` 指定 `type` 为 `http`、`file` 或 `inline`，并准备新增或修改筛选字段的场合。`http` 从 `url` 下载集合文件；`path` 可选，不填则用 `url` 的 MD5 作为文件名。该路径只能落在 HomeDir（启动参数 `-d`）内，其它位置需设置 `SAFE_PATHS`。`file` 直接读 `path`。`inline` 的节点写在 `payload`。当 `http` 或 `file` 解析失败时，也可以使用 `payload` 作为备用代理，此时清单来源是备用条目，不是远程原文。`health-check` 只做健康检查（延迟测试），没有“列出全部节点名称”的字段，不能拿测试地址或延迟结果充当名单。

## 从生效来源列出 name 与 type

先确认此刻真正解析成功的那份内容。对 `http` 与 `file`，打开 HomeDir 内对应 YAML，逐条抄下每条代理的 `name` 和 `type`。对 `inline`，直接读取配置里 `payload` 各元素的这两个字段。解析失败并启用了 `payload` 备用时，只采用备用列表。`filter` 与 `exclude-filter` 筛选或排除“满足关键词或正则表达式的节点”，多个正则可用反引号区分，因此名称必须按完整字符串登记，不能只记地区简称。`exclude-type` 不支持正则，通过 `|` 分割，并使用配置文件中的 `type` 进行排除，故类型字面量要与将写入的片段一致，例如文档示例中的 `ss`、`http`。清单应同时包含拟保留和拟丢弃的样本。判断依据：对每一条都能说明它将面对哪一个筛选字段，再开始写表达式。

## 列出时并排登记名称覆写

同一集合还可配置 `override.additional-prefix`、`additional-suffix`、`override.proxy-name`（`pattern` 为匹配、`target` 为替换目标，支持正则）以及 `override-expr`（可对 `.name` 赋值，且晚于固定字段覆写生效）。文档未写明筛选相对这些覆写的先后。因此除原始 `name` 外，要把加前缀、加后缀、`proxy-name` 替换后的字符串并排写上，避免只按下载原文编写正则。订阅 `url` 与 `health-check.url` 都不是节点名。

## 失败时的下一步

打不开文件时，先查 `path` 是否越出 HomeDir、下载是否被 `size-limit` 截断、`http` 是否未落盘。解析失败则改读 `payload` 备用，不要对未解析文件写 `filter`。清单为空时优先修复集合来源，而不是先加筛选条件。

https://wiki.metacubex.one/config/proxy-providers/
