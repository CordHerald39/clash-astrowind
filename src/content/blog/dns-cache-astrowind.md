---
title: "Clash 怀疑 DNS 缓存时怎样安排复测"
description: "Clash 怀疑 DNS 缓存时怎样安排复测。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件

当你已经改过解析相关字段，但短时间内同一域名的结果仍与改前一致，才需要按缓存未失效来安排复测。适用前先确认 `dns.enable` 为 `true`：文档写明该值为 `false` 时改用系统 DNS，Clash 内部缓存不是观察对象。`enhanced-mode` 为 `fake-ip` 时，复测还要同时考虑 `fake-ip-ttl`；为默认 `redir-host` 时，重点观察真实解析是否被 `cache-algorithm` 保留。

`cache-algorithm` 支持 `lru`（Least Recently Used，默认）和 `arc`（Adaptive Replacement Cache）。两种都说明解析结果会被缓存并按算法淘汰，因此复测必须固定配置、拉开时间、对比同一查询，而不是连续叠加修改。`fake-ip-ttl` 控制 fake-ip 查询返回的 TTL，文档要求非必要不要修改，安排复测时应迁就现有寿命，不能靠把 TTL 改成立刻过期来当验证手段。

## 复测前必须排除的干扰

按官方优先级排除「看起来像缓存、实际没走到新上游」的情况，否则时间表没有意义。

第一，`use-hosts` 与 `use-system-hosts` 默认均为 `true`。命中配置 hosts 或系统 hosts 会直接回应，不会访问你刚改的 `nameserver`。判断依据：该域名若在 hosts 中有静态记录，结果不变不能记成缓存命中，也不能记成配置失败。

第二，`nameserver-policy` 优先于 `nameserver` 和 `fallback`，键支持域名通配，也可用 geosite。域名仍匹配旧策略时，改默认上游不会改变查询路径。

第三，节点域名走 `proxy-server-nameserver`（不填则回落 policy、nameserver、fallback）；`proxy-server-nameserver-policy` 仅当前者非空时生效。direct 出口走 `direct-nameserver`，`direct-nameserver-follow-policy` 默认不遵守 policy。复测必须写明测的是哪一类域名。

第四，配置 `fallback` 后默认启用 `fallback-filter`，`geoip-code` 默认为 `CN`。`ipcidr`、`domain` 会把部分结果视为污染；`geosite` 字段已废弃，应改看 `nameserver-policy`。过滤造成的结果选择与缓存寿命不是同一类问题。

只有确认已启用 Clash DNS、未被 hosts 短路、未被更高优先级 policy 绑死，才进入按时间安排的复测。

## 按缓存安排的复测步骤

第一步，记下配置快照：`enable`、`cache-algorithm`、`enhanced-mode`、是否显式配置 `fake-ip-ttl`、相关 policy 键，以及目标域名属于普通查询、节点域名还是 direct 出口。

第二步，短间隔复测。不改 YAML，对同一域名立即再查。结果与首次相同，只能说明当前仍可能命中缓存或 hosts/policy，不能证明上游改动无效。

第三步，长间隔复测。配置保持不变，等待明显长于所怀疑的缓存保留时间后再查同一域名。两次之间禁止再改 nameserver 列表，以免把配置漂移和缓存过期混在一起。fake-ip 模式下把已有 `fake-ip-ttl` 当作返回寿命参考，而不是去改它。

第四步，若使用 `fallback`，记录 `fallback-lazy-query`。默认 `false`；为 `true` 时会先判断 nameserver 结果是否满足过滤再决定是否发起 fallback。不记录该开关，就无法解释有时只查一次、有时查两次。

第五步，汇总首次、短间隔、长间隔三次路径。仅在长间隔后出现预期上游特征，缓存解释才站得住；三次完全一致，则停止空等，转入其他字段排查。

## 失败时下一步

长间隔后仍无变化时，缓存不再作为第一假设。接着检查：`default-nameserver` 是否为 IP（文档要求必须为 IP，用于解析 DNS 服务器域名，也可为加密 DNS）；`respect-rules` 是否让 DNS 连接遵守路由（需同时配置 `proxy-server-nameserver`，并强烈不建议与 `prefer-h3` 同用）；`fake-ip-filter-mode` 为 `rule` 时语法已改为与路由类似，未按新语法书写会仍走旧映射。完成这些核对后，再看 `fallback-filter` 的 `ipcidr` 与 `domain` 是否把 nameserver 结果判为污染。不要修改 `fake-ip-ttl` 来制造过期。

资料来源：https://wiki.metacubex.one/config/dns/
