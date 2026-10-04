---
title: "Clash 手动选择策略组怎样组织节点"
description: "Clash 手动选择策略组怎样组织节点。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

手动选择策略组对应 proxy-groups 里 type 为 select 的项。组织节点不是临时在界面里拼一份名单，而是用必须字段 name、type，再加上 proxies、use、引入开关和筛选字段，把可选出站固定成一组。name 如有特殊符号，应当使用引号将其包裹。下面只说明如何按官方字段组织这份名单，以及组空或筛空时如何判断。

## 适用条件：什么时候用手动选择组来组织节点

当需要由使用者或调用方明确指定走哪一个出站，而不是把切换交给健康检查时，应使用 select。通用字段里可以写 url、interval、lazy、timeout、max-failed-times、expected-status，但 url 只会检查该组 proxies 字段里的代理，不会检查通过 use 引入的代理集合。因此，若组织目标只是列出可供点选的节点，健康检查不是把名单凑齐的前提，也不应把「测过」当成「已经进入组内」。

判断依据有三条：type 是否为 select；proxies 或 use（以及 include-all 一类开关）是否覆盖打算提供的节点；filter、exclude-filter、exclude-type 是否把不该出现的节点剔除。若还需要嵌套其他策略组，只能写在 proxies 里——include-all、include-all-proxies、include-all-providers 引入时都不包含策略组。

## 用 proxies、use 和三类引入开关排名单

proxies 用于引入出站代理或其他策略组，可以直接写 DIRECT 以及具体节点名。use 用于引入代理集合。需要把全部出站代理和代理集合按名称排序纳入时，使用 include-all；只要全部出站代理时用 include-all-proxies；只要全部代理集合时用 include-all-providers。后一项会使「引入代理集合」失效，选择前要分清要的是节点还是集合。

filter 筛选满足关键词或正则表达式的节点，多个正则可以用反引号区分；exclude-filter 则排除。这两项仅作用于引入代理集合以及引入所有出站代理。exclude-type 不支持正则，通过 | 分割，根据节点类型排除，仅排除引入出站代理，类型名称无视大小写。要把「名称里带港、排除美日、排除某类协议」写成稳定名单，应把意图写进这三项，而不是依赖事后删减。官方示例里 filter 可为 "(?i)港|hk|hongkong|hong kong"，exclude-filter 可为 "美|日"，exclude-type 可为 "Shadowsocks|Http"，阅读配置时以这三项裁剪后的结果为真实可选集合。

## 默认项、空组回退、展示字段和失败处理

default-selected 指定默认选择的节点；该项为空或者设置的节点名不存在时，默认选择组中第一个节点。empty-fallback 在组为空时回退，默认为 COMPATIBLE；这里不支持填写代理组，只支持填写 proxy 名称。筛选过严导致组空时，请求会落到该回退，而不是停留在空的 select 上，组织名单时要把「筛空」当成一种预期结果来检查。

hidden 会在 api 返回 hidden 状态以隐藏该策略组展示，需要使用 api 的前端适配。icon 经 api 返回所输入的字符串。这两项只影响展示，不改变 proxies 构成。disable-udp 会禁用该策略组的 UDP，组织「仅 TCP 可选」的组时，要意识到 UDP 不会获得该组能力。代理组中的 interface-name 与 routing-mark 已弃用，应改到代理节点上配置，优先级为代理节点大于代理策略大于全局。

失败时下一步：预期节点没有出现时，依次核对 name 的引号、type 是否为 select、proxies 与 use 是否指向已存在的名称、include-all 系列是否把策略组误当成已引入、filter 与 exclude-filter 是否过宽或过窄、exclude-type 是否误伤。组为空时检查 empty-fallback 是否为合法 proxy 名。不要把健康检查 url 配在只靠 use 引入的集合上，并指望它替你完成筛选或排序。

https://wiki.metacubex.one/config/proxy-groups/
