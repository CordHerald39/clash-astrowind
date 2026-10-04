---
title: "Clash 添加 fake-ip 过滤项前怎样确定问题域名"
description: "Clash 添加 fake-ip 过滤项前怎样确定问题域名。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

在 Clash 核心采用 mihomo 的 DNS 处理时，enhanced-mode 设为 fake-ip 会为查询分配来自 fake-ip-range 的地址用于后续连接。部分域名拿到虚假地址后无法正常工作，因此在写入 fake-ip-filter 之前必须先锁定这些问题域名。以下内容仅依据官方 DNS 配置字段说明适用条件、判断依据、操作步骤以及无法锁定时的后续处理。

## 确认模式与过滤生效前提
先核验 dns.enable 是否为 true。若为 false 则走系统 DNS，fake-ip 相关项全部不生效。接着确认 enhanced-mode 的值必须是 fake-ip，此时才会分配虚假映射。fake-ip-range 决定所用网段，tun 默认地址也参考该值。判断是否进入本场景的依据是：同一域名在 fake-ip 下连接失败，而改为 redir-host 或直接使用系统解析时恢复。同时查看 ipv6 开关，false 时 AAAA 回应为空，可能让双栈域名的表现与预期不符。cache-algorithm、prefer-h3、listen 等项不直接决定过滤对象，但应一并读取以免配置被忽略。

适用条件还包括 use-hosts 与 use-system-hosts 均为默认 true 的情况，已写入 hosts 的名称若仍被分配 fake-ip，即可列为候选。respect-rules 为 true 时 DNS 查询会遵守路由规则，必须同时配置 proxy-server-nameserver，否则可能出现解析循环，干扰对问题域名的判断。

## 按官方语法对照失败域名
fake-ip-filter 的值支持域名通配以及引入域名集合，文档示例给出 '*.lan'，表明局域网或内部后缀是优先检查对象。操作步骤为：列出当前失败应用实际访问的域名，逐一对照是否符合通配、是否出现在 nameserver-policy 的键中。nameserver-policy 优先于 nameserver 与 fallback，键同样支持域名通配。若某域名被单独指定解析服务器，其结果类型可能与 fake-ip 分配产生冲突。

再检查 fallback-filter。其中 domain 列表会被视为已污染并直接使用 fallback 解析，geosite 字段已废弃但若仍存在也会只走 fallback。ipcidr 网段结果同样视为污染。将这些列表与失败域名做匹配，匹配上的即可作为问题域名候选。判断依据是文档原句：过滤列表中的地址不会下发 fakeip 映射用于连接。fake-ip-filter-mode 默认 blacklist，匹配项即不下发；若当前已改为 whitelist，则只有匹配成功才返回 fake-ip，未匹配的域名行为会完全相反，必须先确认模式再锁定对象。

## 交叉验证与无法确定时的处理
结合 direct-nameserver。该列表专用于 direct 出口的域名解析，不填则回落到 nameserver-policy、nameserver 与 fallback。若某域名预期走 direct 却仍拿到 fake-ip，应优先列入过滤。proxy-server-nameserver-policy 仅在 proxy-server-nameserver 非空时生效，节点域名本身通常不必过滤。fake-ip-ttl 可配置返回 TTL，文档明确非必要情况下请勿修改，故不能作为确定问题域名的手段。

若以上步骤仍无法锁定具体名称，下一步将 fake-ip-filter-mode 临时改为 whitelist 做隔离观察，或改为 rule 模式。rule 模式下 fake-ip-filter 写法与路由规则一致，支持 RULE-SET、GEOSITE、DOMAIN、DOMAIN-SUFFIX、MATCH，且必须自上而下，最后一项决定默认 fake-ip 或 real-ip。可先写入单条 DOMAIN 项进行最小验证。配置变更后需让核心重新加载 DNS 模块。所有判断均来自官方字段定义，不涉及未记载的日志或外部工具。

https://wiki.metacubex.one/config/dns/
