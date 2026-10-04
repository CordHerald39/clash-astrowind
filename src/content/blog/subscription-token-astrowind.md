---
title: "Clash 怎样保存订阅链接避免误发到聊天截图"
description: "Clash 怎样保存订阅链接避免误发到聊天截图。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash 里与“订阅链接”直接对应的，是代理集合（`proxy-providers`）在 `type` 为 `http` 时必须填写的 `url`。该字段会用于下载/更新节点列表，出现在编辑器、终端或配置预览中就可能被聊天截图带走。要避免误发，应把真正的 `url` 只留在本机可加载的配置里，并让可能被拍照的画面里不再出现完整链接。

## 适用条件

适用于使用 `http` 类型代理集合、需要长期保留更新地址的情况。`file` 与 `inline` 并不依赖 `url`：前者用本地 `path`，后者用 `payload`。若集合还配置了 `header`（文档示例含 `Authorization`）、`age-secret-key`，它们与 `url` 同属下载凭据，截图时同样不能露在画面上。`path` 未填写时会用 `url` 的 MD5 作为文件名，文件名本身不是链接，但完整 YAML 仍可能含 `url`。`path` 只能落在 HomeDir（启动参数 `-d` 所指定）内，其它位置需通过 `SAFE_PATHS` 声明；凭据文件应放在该安全目录，而不是桌面或聊天草稿。

## 保存方式与是否会进截图的判断

把含真实 `url` 的片段单独写成仅本机使用的代理集合配置，不要写进教程、群公告或准备粘贴的笔记。需要自动更新时保留 `type: http` 与 `url`，但打开聊天或共享屏幕前关闭该文件；画面中不得出现 `url:` 这一行的完整取值。若更新可改为本地文件，将类型改为 `file`，只保留不可重复的 `path`，这样常见配置视图里不再带订阅链接。`interval`、`size-limit`、`health-check`、`filter` 等不含下载地址，可留在可展示的结构说明里。

自定义 `header` 不要与链接写在同一张图里。文档示例里的 `Authorization: 'token …'` 会随 HTTP 请求发出，和 `url` 一样能证明访问资格。`age-secret-key` 可用命令行 `-age-secret-key` 或环境变量 `CLASH_AGE_SECRET_KEY` 加载，避免密钥出现在 YAML 预览中。判断标准：截图像素里只要能读出 `url`、`Authorization`、`age-secret-key` 或节点 `password`，即视为已发出凭据，与是否裁掉文件名无关。

## 失败时的下一步

若已经把带 `url` 的画面发出，应视该链接及请求头中的令牌为泄露，向提供方更换订阅地址或令牌，并停止继续转发同一张图。本机侧检查代理集合是否仍用 `http` 暴露链接；能改为 `file` 的改为只引用 HomeDir 内路径。随后打开配置，确认没有第二处 `url`、`header` 与 `age-secret-key` 出现在会用于演示的文件中。若下载失败，先核对本机 `url` 与 `header` 是否仍有效，再查 `path` 是否越出 HomeDir、是否需设置 `SAFE_PATHS`，不要把完整链接贴进聊天来“对一下”。

https://wiki.metacubex.one/config/proxy-providers/
