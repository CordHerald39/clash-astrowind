---
title: "怎样为 Clash 控制接口整理访问凭据"
description: "怎样为 Clash 控制接口整理访问凭据。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

为 Clash（mihomo）控制接口整理访问凭据，指的是把官方全局配置里「外部控制 (API)」相关字段抄成一份可核对清单，供仪表板、脚本或其他主机调用 RESTful API。凭据的核心是监听地址与访问密钥，不能与代理端口用户验证、局域网放行混写在同一栏。

## 适用条件

仅在需要外部程序连接 API 时整理。官方把 API 监听写在 `external-controller`，示例为 `127.0.0.1:9090`，并说明可将 `127.0.0.1` 改为 `0.0.0.0` 以监听所有 IP。访问密钥对应字段是 `secret`。若同时配置 Unix socket、Windows named pipe，或在 RESTful API 端口上开启 DOH 服务器，文档写明这些路径不会验证 `secret`，清单必须单独标注，不能假设「填了密钥就覆盖全部入口」。启用 HTTPS-API 时使用 `external-controller-tls`，且文档要求使用 TLS 也必须填写 `external-controller`，证书与私钥在 `tls` 段。

若目的只是给 http(s) / socks / mixed 代理加用户名密码，应使用 `authentication` 与 `skip-auth-prefixes`，那不是控制接口凭据。`allow-lan`、`bind-address`、`lan-allowed-ips`、`lan-disallowed-ips` 约束的是代理端口的局域网访问，也不应写入 API 凭据表。

## 清单要分开记录的三类材料

第一类是会按密钥鉴权的连接信息：`external-controller` 的地址与端口、`secret` 字符串。文档中 `secret` 可以为空字符串，整理结果必须写明「已设置」或「空密钥」，禁止漏行。`external-controller-cors` 的 `allow-origins`（文档示例含 `'*'`）和 `allow-private-network` 影响浏览器跨域能否访问 API，应作备注，但其本身不是密钥。

第二类是官方明确不校验 `secret` 的入口：`external-controller-unix`、`external-controller-pipe`、`external-doh-server`。文档分别提示从 Unix socket、Windows namedpipe 访问 API，以及该 DOH URL，都不会验证 secret，开启后需自行保证安全。清单上应写清套接字或 URL 路径，并加「不验证 secret」标记，避免后续轮换密钥时误判这些入口已失效。

第三类是传输与界面配套：`external-controller-tls` 地址，`tls` 中的 `certificate`、`private-key`，以及可选的 `ech-key`。证书类字段可以是 PEM 文本或路径；路径若不在工作目录，文档要求用 `SAFE_PATHS` 环境变量纳入安全路径，语法同本系统 PATH（Windows 用分号，其他系统用冒号）。`external-ui`、`external-ui-name`、`external-ui-url` 只说明静态网页资源挂在 `API 地址/ui`，可备注路径与下载地址，不能代替 `secret`。Linux 上的 `external-controller-routing-mark` 与密钥无关，一般不必列入凭据。

## 操作步骤与判断依据

从正在生效的配置原文复制上述字段，不凭记忆改写大小写、引号或空密钥。接着核对监听范围：回环地址表示仅本机可达；改为全接口监听时，应同时确认 `secret` 是否仍为空、CORS 来源是否过宽。再把 `authentication` 整段移出本清单，防止把代理账号填进面板密钥。最后确认 TLS 项是否成套：有 `external-controller-tls` 就必须有证书与私钥，且未缺少明文 `external-controller`。

判断整理完成的依据是：清单地址端口与配置一致；`secret` 与配置字节级一致（含空字符串）；凡文档写明不验证 secret 的入口都有单独警告；证书路径若越出工作目录，已记录 `SAFE_PATHS` 需求。外部调用方应使用该地址访问 API，并在需要鉴权的入口携带同一 `secret`。

## 失败时下一步

若实际监听与清单不符，先查 `external-controller` 是否被改端口或只写了 TLS 地址。unix 或 namedpipe 能通但密钥无效，属于文档预期行为，应收紧套接字权限而不是反复改 `secret`。证书无法加载时检查 PEM、文件路径和 `SAFE_PATHS`。不要用代理端口的 `authentication` 去填 API 密钥。字段含义仍对不上时，按官方「外部控制 (API)」各条说明重新抄录。

https://wiki.metacubex.one/config/general/
