---
title: "Clash Meta 手机端（Android）：应用分流前怎样列出需要接管的应用"
description: "Clash Meta 手机端（Android）：应用分流前怎样列出需要接管的应用。了解适用条件、操作步骤与常见问题的排查方法。"
date: "2026-10-04"
updated: "2026-10-04"
category: "操作教程"
tags: ["操作教程"]
author: "编辑部"
draft: false
---

在 Android 上，Clash Meta for Android 是 Clash.Meta 的图形界面客户端，通过系统 VPN 接口接管流量。所谓应用分流前列出需要接管的应用，指的是：在本地 TUN 接口建立之前，先得到一份**当前已安装、且应以包名写入 per-app VPN 列表**的应用集合。Android 文档写明：VPN 应用可以创建允许列表或拒绝列表，但不能同时使用两者；若不创建这两类列表，系统会把全部网络流量送入 VPN。列表必须在连接建立前设置；若要改列表，必须重新建立 VPN 连接。ClashMetaForAndroid 仓库给出的是内核界面、包名与启停意图，并未单独规定分应用菜单名称，因此下列步骤以平台机制为准，避免把未记载的界面当成操作依据。

## 适用条件

本说明适用于已安装 Clash Meta for Android、系统不低于其最低要求（Android 5.0，文档建议 7.0 及以上）且架构为 `armeabi-v7a`、`arm64-v8a`、`x86` 或 `x86_64` 的设备。每个用户或工作资料同时只能有一个活动的 VPN 服务；新服务启动会自动停止已有服务。首次成为当前 VPN 前，系统会弹出连接请求对话框，须由使用者确认信任。应用必须已经安装，才能加入允许或拒绝列表。未安装的包名不能当作有效接管对象。若设备开启 always-on VPN，连接的启动与停止由系统与设置项控制，列表仍须在每次建立接口前准备好。

## 用包名列出可被接管的应用

Android 用应用包名标识进程。官方示例把 `com.android.chrome`、`com.google.android.youtube` 等写入数组，循环调用 `PackageManager.getPackageInfo`；能查到则 `addAllowedApplication`，捕获 `NameNotFoundException` 则跳过未安装项。因此“列出需要接管的应用”应输出**已安装包名**，而不是应用在桌面上的显示名称。

列举时可在系统已安装应用信息中核对包名，或在可调试设备上用 `adb shell pm list packages` 导出全量包名，再筛出真正会产生网络连接、需要进入 TUN 的项。Clash Meta for Android 的应用包名为 `com.github.metacubex.clash.meta`，它自身作为 VPN 客户端，建立隧道套接字前应使用 `VpnService.protect()`，避免套接字再次进入系统 VPN 形成环路；这与“被接管的目标应用列表”不是同一份名单。允许列表非空时，只有列表内应用走 VPN，其余应用如同 VPN 未运行。拒绝列表中的应用走系统网络，其余应用走 VPN。允许列表为空时，全部应用走 VPN。

## 判断某应用是否应进入接管清单

判断依据是：该应用的流量是否必须被系统送入 VPN 本地接口，从而交给 Clash.Meta 内核。若只希望少数应用进入内核，应采用允许列表，只纳入这些包名。若希望绝大多数应用进入 VPN、仅排除个别应用，应采用拒绝列表。系统应用只要已安装且会发起网络连接，同样按包名处理。官方示例中故意放入一个缺失应用，说明未安装项必须忽略，不能当作已接管。

列出清单后，须在 `VpnService.Builder.establish()` 之前完成 `addAllowedApplication` 或 `addDisallowedApplication`，并至少配置 `addAddress()` 与 `addRoute()`。`establish()` 在未准备或权限被撤销时返回空，此时接口不会建立，清单也不会生效。文档还提示：在拦截非 VPN 流量时，不在允许列表、也不在拒绝列表语义下的应用会失去网络，制定名单时应把这一后果考虑进去。

## 清单列不全或未生效时的下一步

若某应用“列不出来”：先确认已安装，再用包名而不是显示名核对；未安装时 `getPackageInfo` 会失败，不能加入列表。若名单已改但分流未变：检查是否在改列表之后重新建立了连接。若试图同时维护允许与拒绝两类列表：按文档只能二选一，需重新规划。若权限对话框被拒绝或服务被系统停止：重新 `VpnService.prepare()`，并在设置中的 Network & Internet > VPN 确认该应用仍被允许。工作资料与个人资料的清单互相独立，不能跨资料套用。需要主动停启服务时，仓库记载可向 `com.github.kr328.clash.ExternalControlActivity` 发送 `START_CLASH`、`STOP_CLASH` 或 `TOGGLE_CLASH` 意图，包名为 `com.github.metacubex.clash.meta`。完成包名核对并重建接口后，再根据允许或拒绝语义验证流量是否进入 TUN。

https://developer.android.com/develop/connectivity/vpn
https://github.com/MetaCubeX/ClashMetaForAndroid
