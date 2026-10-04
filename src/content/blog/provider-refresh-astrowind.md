---
title: "Clash 代理集合的更新间隔应该怎样理解"
description: "Clash 代理集合的更新间隔应该怎样理解。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

Clash 配置里的代理集合写在 `proxy-providers` 下。字段 `interval` 在资料中的含义是「更新 provider 的时间，单位为秒」。它说的是该集合何时再去更新内容，不是节点延迟测试的节奏，也不是策略组如何选节点。同一条目还可以写 `health-check.interval`，单位同样是秒，但属于健康检查。把两个间隔当成一件事，会误判集合该不该已经换源。

## 适用条件

适用于 `type` 为 `http`、需要理解 `interval` 在代理集合中含义的场合。适用于同一条目里同时写了 `interval` 与 `health-check` 的场合。`type` 为 `inline` 时内容来自 `payload`，本页没有把 `interval` 解释成「定期改写 payload」。`type` 为 `file` 时来源是文件，`interval` 仍按「更新 provider 的时间」来读，本页未另给 file 的定时细节。资料未给出 `interval` 缺省值，也未说明写成 0 时的语义，这两处不要自行补成关闭或立即更新。

## 怎样理解两个间隔

1. 只把 `interval` 读成秒级的 provider 更新时间。示例里的 `3600` 就是 3600 秒。不要把字段值按分钟或毫秒理解。
2. 健康检查是另一套时间。`health-check.interval` 单位为秒，`health-check.timeout` 单位为毫秒。`health-check.lazy` 默认为 true：不使用该集合节点时，不进行测试。lazy 只决定测不测延迟，不能用来推断集合有没有按 `interval` 更新。
3. `http` 类型的一次更新还要满足下载条件：`url` 为来源，可选 `header`、`proxy`（经过指定代理下载或更新）、`size-limit`（字节，默认 0 表示不限制）。`path` 为落盘路径，不填时使用 `url` 的 MD5 作为文件名；路径只允许落在 HomeDir（启动参数 `-d`）或环境变量 `SAFE_PATHS` 指定的安全路径内。这些条件决定更新能否写入集合，它们不是间隔字段的换算规则。
4. 判断依据：配置里能分开指出「更新 provider 的秒数」和「健康检查的秒数」，才算理解了更新间隔。节点很久没测延迟，应核对 `health-check.enable`、`health-check.interval` 和 lazy，而不是去改 `interval`。集合内容长期不变时，`interval` 只说明计划中的更新时间尺度，还要结合类型、来源和下载是否完成来看。

## 失败时下一步

无法判断当前用的是哪一个间隔时，在同一 provider 条目下分别标出 `interval` 与 `health-check.interval`，并确认 timeout 才是毫秒。集合内容与远程 `url` 对不上，接着核对 `type` 是否为 `http`、`path` 是否合法、`size-limit` 是否限制了体积，以及 `http` 或 `file` 解析失败时是否改用了 `payload` 备用代理。不要用健康检查有没有跑完来证明 `interval` 已经完成一次更新。

资料来源：
https://wiki.metacubex.one/config/proxy-providers/
