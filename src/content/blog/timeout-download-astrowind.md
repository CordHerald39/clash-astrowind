---
title: "Clash 订阅下载超时时先检查哪一段连接"
description: "Clash 订阅下载超时时先检查哪一段连接。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

http 类型的代理集合在下载、更新时，走的是「核心 → `proxy` 指定的出站 → `url`」这一段。健康检查是另一段连接：已加载节点去访问 `health-check.url`。订阅下载超时，应先核对下载这一段用了哪一跳出站、目标是哪个 `url`，不要先去改健康检查地址或超时。

## 适用条件

适用于 `type` 为 http、现象是拉取或更新 provider 一直等不到结果的情况。`file` 只读本地文件，`inline` 只用 `payload`，都不经 `url` 下载，不适用「先查哪一段连接」。节点延迟测试失败，检查对象是健康检查，也不是订阅下载。

## 按字段把下载路径拆成几段

1. 先确认 `type` 为 http 且已写 `url`。缺 `url` 是配置不完整，不是某一跳网络在超时。
2. 第一段看出站：文档写明「经过指定代理进行下载/更新」，示例为 DIRECT。若这里填写了某个代理名，下载必须先经过该出站。判断：超时出现在更新集合，且 `proxy` 不是 DIRECT 时，先核对该出站本身能否工作，而不是先改订阅 `url`。
3. 第二段看目标：`url` 才是实际 HTTP 下载地址，请求还会带上 `header`（文档示例含 Authorization）。在 `proxy` 为 DIRECT 或该出站可工作的前提下仍超时，再把重点放到 `url` 与请求头。
4. 不要把 `health-check.url` 当成第一段。文档推荐的是 Cloudflare 或 Google 的检测地址，由 `health-check.timeout`（单位毫秒）约束，和订阅下载不是同一条连接。
5. 下载完成之后才会用 `age-secret-key` 解密、写入 `path`、再按 `filter` 筛选。`path` 不在 HomeDir、未设置 `SAFE_PATHS`、`size-limit` 超限，属于落盘或限大小，不能解释成「连接哪一段超时」。

## 判断依据和失败时下一步

等待时间接近 `health-check.timeout`（文档示例为 5000 毫秒）且伴随节点延迟，应改查健康检查段。现象出现在 `interval` 触发的更新上，则按「proxy → url」的顺序查下载段。`interval` 单位是秒，只表示多久再更新一次，不是单次下载的等待上限。

两段都查过仍失败时，再核对 `path` 是否唯一且在 HomeDir、`size-limit`（字节，0 为不限制）是否拒文件。不要用加大 `health-check.timeout` 去修订阅下载；那一项管的是节点访问检测地址的等待时间。需要把现场说清楚时，说明 `type`、`proxy` 取值和超时发生在更新还是延迟测试即可，不必把真实 `url` 或令牌贴出。

资料来源：
https://wiki.metacubex.one/config/proxy-providers/
