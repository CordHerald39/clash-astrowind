---
title: "使用 Clash 控制接口前要确认哪些配置"
description: "使用 Clash 控制接口前要确认哪些配置。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

使用 Clash（mihomo）控制接口前，应把监听、鉴权、传输与界面相关项逐项对齐。外部控制接口通过 RESTful API 管理内核，和代理端口不是同一组字段。漏配、混用或未理解“哪些路径不校验密钥”，都会让后续面板或脚本调用失败，或把接口暴露在未预期的地址上。

## 适用条件

适用于已经准备配置文件、即将用面板、脚本或内置静态页访问 API 的场景。官方文档将外部控制器定义为：可以用 RESTful API 控制 Clash 内核。若只用本机回环、且调用方不是浏览器跨域页面，重点仍是地址与密钥；一旦涉及 HTTPS、Unix socket、Windows named pipe、外部用户界面，或在 REST 端口上开启 DOH，就必须同时满足对应字段的前置条件。尚未决定调用通道时，不要先改监听范围。

## 使用前要逐项确认的配置

先确认 API 监听。`external-controller` 的示例为 `127.0.0.1:9090`。文档写明可以把 `127.0.0.1` 改成 `0.0.0.0` 以监听所有 IP。使用前要能回答：调用方连接的主机和端口，是否就是内核将监听的那一组。仅本机管理时，回环地址通常已足够；只有明确需要其他设备访问 API 时，才考虑监听全部地址，并评估暴露范围。Linux 上还可为监听 socket 设置 `external-controller-routing-mark`，该项仅支持 Linux。

再确认密钥与“不校验密钥”的例外。`secret` 是 API 的访问密钥。走 TCP 上的 REST 时，应按文档把它当作访问控制。同时必须记下三条例外：从 Unix socket 访问 API 不会验证 secret；从 Windows named pipe 访问也不会验证 secret；在 RESTful API 端口上开启的 DOH 路径同样不验证 secret。文档对这三类能力都写明：若开启，请自行保证安全。因此使用前要分清调用走的是端口、TLS 端口、套接字、管道还是 DOH 路径，不能默认“填了 secret 就一定会被校验”。

若准备用 HTTPS-API，还要确认 `external-controller-tls` 与 `tls`。HTTPS 监听需要配置证书和私钥；使用 TLS 时也必须填写 `external-controller`。只写 TLS 地址、不写 `external-controller`，不符合文档要求。证书与私钥可以是 PEM 文本或路径。自指定版本起，当这些字段指向本地文件时支持自动重载，但这不改变“TLS 与明文 API 监听同时存在”的配置关系。

若面板以静态页形式挂在内核上，确认 `external-ui`。静态资源运行在 Clash API 上，路径为 API 地址加 `/ui`。路径可以是绝对路径或工作目录相对路径。若路径不在工作目录，需手动设置 `SAFE_PATHS` 环境变量加入安全路径；该变量语法与操作系统 PATH 相同，Windows 下以分号分割，其他系统以冒号分割。浏览器访问时再核对 `external-controller-cors` 的 `allow-origins` 与 `allow-private-network`，避免页面来源不被接受。

不要把 `allow-lan`、`bind-address`、`authentication`、`skip-auth-prefixes` 当成控制接口的前置项。文档把它们归在允许局域网与代理用户验证，作用对象是 http(s)/socks/mixed 代理端口，不是 REST 控制接口。

## 判断依据与失败时下一步

可以按这条链判断是否具备使用条件：面板或脚本将连接的地址端口，是否等于 `external-controller`（若走 HTTPS 则还要核对其 TLS 端口）；`secret` 是否与当前通道的校验规则一致；TLS 是否同时具备证书、私钥和明文 API 监听；界面路径是否落在工作目录或已进入 `SAFE_PATHS`；跨域来源是否被允许。Unix socket 与 named pipe 一旦启用，判断重点转向路径权限，而不是密钥是否填写。

核对后仍无法进入可用状态时：先排除把代理端口误当成 API 端口；再检查 HTTPS 是否缺证书或漏写 `external-controller`；界面无法加载时检查 `external-ui` 与 `SAFE_PATHS`。确认无误后再启动或重载内核，避免带着错误监听进入调用阶段。

参考资料：https://wiki.metacubex.one/config/general/
