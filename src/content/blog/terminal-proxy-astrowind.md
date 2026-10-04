---
title: "Clash 电脑端：终端工具使用前怎样查看代理环境变量"
description: "Clash 电脑端：终端工具使用前怎样查看代理环境变量。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

## 文档边界与适用条件

在终端运行网络类工具之前查看代理环境变量，适用对象是当前这条 shell 会话，而不是整个图形界面。全局配置能够确认的是：内核提供 http(s)、socks、mixed 入站；可用 authentication 与 skip-auth-prefixes 约束谁能免密；用 bind-address 与 allow-lan 约束谁能连上端口。该页明确写出的环境变量是 SAFE_PATHS，用于把外部用户界面路径加入安全路径，语法同本操作系统 PATH：Windows 下以分号分割，其他系统下以冒号分割。文档没有把终端代理写成由内核自动注入的一组变量名。因此查看动作的含义是：检查当前会话是否自行指向了上述入站，并把打印结果与配置对照，而不是去寻找未记载的内核开关。

## 同一会话内的查看步骤

第一步，必须在即将运行工具的同一个终端里打印环境。Windows 命令提示符可用 set 查看会话变量；PowerShell 可用环境驱动器列出；类 Unix 系统可用 env 或 printenv。记录是否存在指向本机或局域网地址的代理类变量，同时看 SAFE_PATHS 是否被设置。第二步，把变量里的主机对照 bind-address。若配置绑定的是单个 IPv4 或单个 IPv6，而变量仍写着未绑定地址，则该值对当前内核无效，应视为过期。第三步，对照 authentication。变量若只有主机、没有文档要求的 user:pass 形态，则仅当源地址落在 skip-auth-prefixes（文档含 127.0.0.1/8 与 ::1/128）时才可能免密成功；其他前缀上的工具会被拒绝。第四步，对照 allow-lan、lan-allowed-ips、lan-disallowed-ips。allow-lan 为 false 时，指向非本机入站的变量没有意义；黑名单优先于白名单，变量落到禁止段时应先清空再启动工具。第五步，确认 mode 不是 direct，否则即使变量指向正确入站，流量仍按全局直连处理。global 模式下还需要 GLOBAL 策略组已选择代理。

判断“已经看过变量”的标准是：打印结果来自即将运行工具的同一会话，并且主机与认证已经对照过当前配置。其他窗口里的环境信息不能作为本条命令的依据。变量属于进程环境，不是配置文件的一部分，新开终端后必须再打印一次。

## 查看失败或结论矛盾时的下一步

若打印结果里没有任何代理类变量，只能说明当前会话没有这些变量，不能说明入站已关闭。应回到配置确认 bind-address、allow-lan 与 authentication，并把 log-level 设为 info 或 debug，观察工具连入时是验证失败还是绑定不匹配；silent 与 error 不足以区分“没设变量”和“变量指向旧地址”。find-process-mode 为 off 时不匹配进程，为 always 时强制匹配所有进程，为 strict 时由内核判断；该字段影响进程规则，不负责生成环境变量。不要把 external-controller 的 127.0.0.1:9090、Unix socket 或 namedpipe 写进终端代理变量，它们是 REST API，访问密钥为 secret，与 mixed/http/socks 入站不同。若只是外部界面路径报错，应检查 SAFE_PATHS 是否按 PATH 规则加入了工作目录之外的路径，而不是改代理变量。ipv6 为 false 时，变量里的 IPv6 字面量应删除后再查看一次。

https://wiki.metacubex.one/config/general/
