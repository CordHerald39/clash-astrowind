---
title: "Clash 电脑端：按进程分流前怎样确认平台支持"
description: "Clash 电脑端：按进程分流前怎样确认平台支持。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 适用条件：按进程分流前要确认什么

Clash（mihomo）提供 `PROCESS-PATH`、`PROCESS-PATH-WILDCARD`、`PROCESS-PATH-REGEX`、`PROCESS-NAME`、`PROCESS-NAME-WILDCARD`、`PROCESS-NAME-REGEX`。电脑端在按进程分流之前确认平台支持，指的是确认本机能否提供这些规则所要求的匹配对象，并把 payload 写成官方示例那种形式。官方路径示例同时给出了 Unix 风格的 `/usr/bin/wget` 和 Windows 风格的 `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`；进程名示例给出了 `curl` 与 `chrome.exe`。

官方对 `PROCESS-NAME`、`PROCESS-NAME-WILDCARD`、`PROCESS-NAME-REGEX` 另有说明：在 Android 平台可以匹配包名，示例为 `com.termux`。电脑端确认支持时，应把这条理解成包名匹配被标明在 Android，不要把应用包名当成电脑端进程名来写。`UID` 的定义是匹配 Linux USER ID，它不是进程路径规则，也不能当作所有电脑平台上的进程分流替代。

规则仍按从上到下的顺序匹配。即便进程规则写法符合本机路径习惯，写在 `MATCH` 之后也不会执行。`MATCH` 匹配所有请求、无需条件。附加参数 `no-resolve` 与 `src` 仅支持关于目标 IP 的规则，不能用来证明进程规则是否可用。

## 对照官方类型确认本机能否提供匹配对象

第一步，确认本机能否提供完整进程路径。`PROCESS-PATH` 的官方定义是使用完整进程路径匹配。若当前环境里拿不到可执行文件的完整路径，就无法按 `/usr/bin/wget` 或上述 Windows 完整路径这种 payload 来写。Windows 路径在配置里需要按示例使用 `\\`。路径通配只支持 `*` 和 `?`，且与配置文件其他地方的 Clash 格式通配符不相同；需要正则时走 `PROCESS-PATH-REGEX`。

第二步，确认本机进程名是否能写成 `PROCESS-NAME` 示例那种对象：`curl`、`chrome.exe`。这是进程匹配，不是域名，也不是 Android 包名。名称通配同样仅支持 `*` 和 `?`，正则走 `PROCESS-NAME-REGEX`。示例中的 `(?i)` 出现在正则写法里，说明是否忽略大小写取决于正则本身如何书写，不能把这一点套到普通 `PROCESS-NAME` 上。

第三步，把电脑端标识与其它规则对象分开。不要用 `DOMAIN`、`GEOSITE` 验证进程规则是否可用，那些匹配的是域名。不要用 `UID` 去验证 Windows 风格路径是否可用。不要在尚未确认路径分隔符、扩展名能否按官方示例写出时，先用过宽的 `*` 代替平台确认。

## 判断依据与失败时下一步

判断依据：你能指出将要使用的是完整路径还是进程名；payload 的分隔符、文件名与扩展名与官方对应示例同一风格；没有把 Android 包名或 Linux UID 误当成电脑端进程名；该行仍在 `MATCH` 之前。

若无法写出完整路径，不要先启用 `PROCESS-PATH`，改核对能否使用 `PROCESS-NAME` 的进程名形式。若只能得到类似 `com.termux` 的包名，那是官方标明的 Android 匹配对象，不能据此认为电脑端进程规则已经就绪。若路径里的空格、反斜杠与示例不一致，先按完整路径示例改写再谈分流。标识可以按官方形式写出之后，再把进程行放到预期的优先级位置；不要在平台标识尚未对齐时放大通配范围。

https://wiki.metacubex.one/config/rules/
