---
title: "Clash 使用域名分类规则前怎样核对数据来源"
description: "Clash 使用域名分类规则前怎样核对数据来源。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

在 Clash 里使用域名分类规则前，先核对数据来源，是为了分清「配置里写的分类名」和「实际参与匹配的那批域名」是不是同一回事。官方路由规则把 GEOSITE 定义为匹配 Geosite 内的域名，并写明部分内容参考 v2fly/domain-list-community；把 RULE-SET 定义为引用规则集合，且需配置 rule-providers。未核对来源就直接写分类名，请求可能按从上到下的顺序滑到后续规则，甚至被 MATCH 接走。本文只处理使用前的来源核对，不把任何分类写成对特定网站的效果保证。

## 适用条件：哪些写法算域名分类规则

适用条件是 rules 中准备使用 GEOSITE，或使用以域名为主要内容的 RULE-SET。GEOSITE 的匹配对象是 Geosite 数据集中的域名，分类名只是进入该数据集的索引，不是配置文件里逐条列出的后缀。RULE-SET 的匹配对象来自名为 providername 的规则集合，官方示例写作 RULE-SET,providername,proxy，并明确需要配置 rule-providers。若你只使用 DOMAIN、DOMAIN-SUFFIX、DOMAIN-KEYWORD、DOMAIN-WILDCARD、DOMAIN-REGEX，匹配范围由配置字面决定，不属于「先核对外部域名分类数据来源」的情形；但同一段 rules 里只要同时存在 GEOSITE 或 RULE-SET，仍应先分清两类规则各自读哪份数据。

判断是否需要核对的依据：配置中出现分类名或集合名，而你无法在配置文本里直接看到该名称对应的域名清单。此时来源不明，就不能把分类规则当作关键站点的唯一入口。

## 使用前逐项核对来源的步骤

第一步，把 rules 里所有域名相关行分成三组：字面规则、GEOSITE、RULE-SET。字面规则的数据来源就是配置本身，例如官方示例中的 DOMAIN,ad.com,REJECT。GEOSITE 的数据来源是 Geosite，官方指出部分内容参考 v2fly/domain-list-community，因此分类名是否存在、包含哪些域名，取决于当前加载的 Geosite，而不是取决于你在规则行里写下的出站名称。RULE-SET 的数据来源是 rule-providers 所指向的集合，未配置提供者时，官方类型说明中的「需配置」条件不满足，这一行不能当作已生效的分类来源。

第二步，核对该分类名是否只被当成「一组域名」使用。GEOSITE 不匹配 IP 国家代码，也不匹配进程、端口或入站类型；那些是 GEOIP、PROCESS-NAME、DST-PORT、IN-TYPE 等其他类型的职责。若目标对象其实是 IP 或进程，却写成域名分类，来源再完整也不会命中。判断依据是官方对各规则类型匹配对象的定义，而不是分类名的中文含义。

第三步，核对优先级是否允许分类规则真正被问到。规则将按照从上到下的顺序匹配。若更靠前的 DOMAIN-KEYWORD 或 DOMAIN-SUFFIX 已经覆盖同一请求，分类数据来源再正确，该请求也不会进入 GEOSITE。使用 AND、OR、NOT 时，payload 必须是「规则类型和其他 payload」，并注意括号；来源正确但括号错误，分类规则同样不会按预期执行。

第四步，确认 MATCH 之前仍有可核对的分类命中点。MATCH 匹配所有请求、无需条件。如果分类来源尚未核对清楚，就把关键站点放在只依赖 GEOSITE 的位置，一旦集合为空或名称无效，流量会直接落到 MATCH。使用前应明确：分类规则只是列表中的一行，来源无效时不会自动报错改写其他行。

## 核对失败时的下一步

核对失败的判断依据包括：说不清 GEOSITE 对应的是哪份 Geosite 数据；RULE-SET 没有对应的 rule-providers；分类名在配置中出现，但无法与官方示例所展示的「类型,条件,出站」结构对应；或者你无法区分该行与字面域名规则的数据来源。出现上述任一情况，不要启用该分类行作为关键站点的唯一规则。

下一步应改用配置内可直接审查的规则：对完整主机名用 DOMAIN，对后缀用 DOMAIN-SUFFIX，对关键字、通配符或正则分别用 DOMAIN-KEYWORD、DOMAIN-WILDCARD、DOMAIN-REGEX。通配符类型仅支持 * 和 ?，且官方注明这里的通配符和配置文件其他地方的 Clash 格式通配符不相同，来源核对不到分类数据时，更不宜再用另一套未说明的通配语法去「补分类」。若仍然需要一组可更新的域名列表，应先完成 rule-providers 再写 RULE-SET，而不是把未核来源的 GEOSITE 名称继续留在列表中。逻辑组合需求用 AND、OR、NOT 表达，并在修正括号后再重新核对来源。

https://wiki.metacubex.one/config/rules/
