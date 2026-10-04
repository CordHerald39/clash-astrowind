---
title: "Clash 使用域名关键词规则前怎样检查范围"
description: "Clash 使用域名关键词规则前怎样检查范围。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

在 Clash（mihomo）的路由配置中，DOMAIN 匹配完整域名，DOMAIN-SUFFIX 匹配域名后缀，DOMAIN-KEYWORD 是域名关键字匹配。它们都放在 rules 列表中。文档规定：规则将按照从上到下的顺序匹配，列表顶部的规则优先级高于其底下的规则。使用关键字规则之前检查范围，就是根据这些定义预先判断它会命中哪些域名、会不会抢在更精确规则之前、会不会把本该交给 MATCH 或其他类型的请求带走。

## 适用条件

范围检查只适用于对象是域名的情形。文档中的 IP-CIDR、IP-CIDR6、GEOIP、DST-PORT、PROCESS-NAME、IN-TYPE 等各有匹配对象，不能用关键字规则代替。适用关键字的前提是：意图为“域名中出现某一关键字即命中”，而不是整段域名完全一致，也不是从右侧按后缀对齐。若请求还受 NETWORK、DST-PORT 等约束，应把这些条件与关键字一并纳入范围，而不是只看域名字符串。

文档给 DOMAIN-SUFFIX 的例子是：google.com 匹配 www.google.com、mail.google.com 和 google.com，但不匹配 content-google.com。后缀因此具有可核对的边界。DOMAIN-KEYWORD 只有“域名关键字匹配”这一说明，没有同样的排除边界。若你需要的是后缀那种边界，则不适用关键字，应改用后缀或完整域名。逻辑规则 AND、OR、NOT 与 SUB-RULE 可以组合条件，但必须注意括号。RULE-SET 用于引用规则集合。这些都会改写最终范围，检查时要计算在内。

## 检查范围的具体步骤

把关键字单独写成文档示例形态，例如 DOMAIN-KEYWORD,google,auto。不要写入通配符。通配符属于 DOMAIN-WILDCARD，仅支持星号和问号：星号匹配零个或多个字符，问号匹配一个字符；文档注明它与配置文件其他地方的 Clash 格式通配符不相同。正则属于 DOMAIN-REGEX。类型写错则范围检查没有对象。

同时列出希望命中与明确不能命中的域名。不能命中的一侧应包含 content-google.com 这类“含有同一串字符却不是后缀关系”的名字。若业务也不能接受这类命中，就必须承认关键字可能更宽。完整相等用 DOMAIN，有后缀边界用 DOMAIN-SUFFIX。检查时以文档对后缀的正反例子为对照标尺，而不是凭名称相近来估计覆盖。

按从上到下通读 rules。若上方的 DOMAIN、DOMAIN-SUFFIX、GEOSITE 或逻辑规则已能匹配同一请求，关键字不会执行到。若关键字写得过前，它会先于精确规则生效。再核对动作字段，如 REJECT、DIRECT、auto、PROXY，确认该动作可以作用在检查后的整个范围上。目标 IP 类规则的 no-resolve 与关键字不是同一机制，不要混用。若单条关键字无法同时满足希望命中与不能命中，改用 DOMAIN、DOMAIN-SUFFIX、DOMAIN-REGEX 或 AND、OR、NOT。MATCH 匹配所有请求且无需条件，只能作为范围收敛后的兜底。

## 判断依据与失败后的下一步

判断依据是类型定义和优先级。需要完整一致时用 DOMAIN；需要后缀边界并排除类似 content-google.com 的名字时用 DOMAIN-SUFFIX；只有“关键字出现即命中”与意图一致时才用 DOMAIN-KEYWORD。顶部优先是判断谁真正生效的依据。括号是否正确是判断逻辑规则有没有改写范围的依据。

范围过宽时，下一步改为后缀或完整域名，或把更精确规则移到关键字之上，对可列举的误伤用 NOT 排除。完全没有命中时，核对拼写、是否被上方截走、是否误用 DOMAIN-WILDCARD 或 DOMAIN-REGEX。对象其实是 IP、端口或进程时，改用对应类型。逻辑行为异常时检查括号。失败后不要在未核对优先级的情况下连续追加多条关键字，那样只会让范围更难解释。仍无法收敛则回到是否该用关键字，而不是反复改字符串长度。

本文只说明使用域名关键词规则前怎样检查范围。语义以路由规则手册为准。

引用资料：https://wiki.metacubex.one/config/rules/
