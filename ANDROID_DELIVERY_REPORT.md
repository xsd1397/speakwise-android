# SpeakWise Android 首版交付报告

## 交付范围

本项目是独立的 Expo React Native Android 客户端，不使用 WebView。当前首版包含 Practice、Listening、Progress 三个底部导航页面；首页支持全部 10 个练习场景与三级难度选择，听力页面迁移 40 句会话并提供 0.75×、1×、1.25× 倍速控制。

口语练习使用 `expo-audio` 申请麦克风权限并保存真实录音，提交评分时通过现有 SpeakWise 后端的 `voice.evaluate` 路由上传音频 Base64；未配置公开后端地址、录音为空或请求失败时，界面会明确提示而不会生成虚假分数。AI 对话调用 `dialogue.reply`，回复以整句文字显示并同步触发语音，不做逐词高亮。

Alex 优先使用男声、Mia 优先使用女声；声线列表为空、系统无法识别角色声线或语音服务不可用时，使用 Android 系统默认英语声音并保留可读提示。所有主页面均提供底部“返回顶部”控件和无障碍标签。

## 验证结果

| 检查项 | 结果 |
|---|---|
| `pnpm typecheck` | 通过 |
| Vitest 纯逻辑测试 | 2 个文件、6 项通过 |
| Expo Jest 组件测试 | 2 个文件、9 项通过 |
| `npx expo export --platform android --clear` | 通过，Android bundle 导出成功 |
| 本地 Gradle Debug APK | 未执行成功，当前沙箱没有 Android SDK；不是源码错误 |

组件测试覆盖全部场景选择、录音开始/停止与保存提示、AI 对话空输入保护、AI 成功回复、AI 请求错误态、返回顶部、听力三档速度、播放全部切换和默认声线回退提示。

## 源码检查点

移动端仓库已保存本地 Git 检查点，最终交付提交为 `3f69167`，功能与测试修复提交为 `f4d0876`，基础提交为 `3331090`。压缩包已排除 `node_modules`、`dist`、`.expo`、Android 本地生成目录、`.git`、环境文件和密钥文件，并通过 `unzip -tq` 完整性检查。

## GitHub 与 EAS

进入项目目录后，将代码推送到用户自己的 GitHub 仓库。随后在本机执行 `npx eas login`，配置 EAS 构建并生成 preview APK：

```bash
pnpm install
cp environment.template .env
# 将 EXPO_PUBLIC_API_BASE_URL 设置为公开可访问的 SpeakWise API origin
npx eas login
npx eas build:configure
npx eas build --platform android --profile preview
```

仓库内已提供 `.github/workflows/android-preview.yml`。在 GitHub 仓库 Secrets 中添加 `EXPO_TOKEN`，手动运行该工作流并填写公开 API 地址即可启动 preview APK 构建。移动端只应使用公开 API origin，不应放入数据库连接串、JWT secret、OAuth secret 或服务端 API key。

## 尚需真机确认

最终上线前应在 Android 真机或带麦克风的模拟器上确认麦克风授权、真实录音文件上传、网络错误提示、TTS 中断恢复、Alex/Mia 声线选择和默认系统声音回退。EAS 云构建可绕过当前沙箱缺少 Android SDK 的限制。
