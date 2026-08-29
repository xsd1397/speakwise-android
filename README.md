# SpeakWise Android

SpeakWise Android 是现有 SpeakWise 网页端的独立 Expo React Native 客户端。它不使用 WebView，而是使用 Android 原生组件重建口语练习、真实录音、AI 对话、听力训练和学习进度入口。

## 本地运行

```bash
pnpm install
cp environment.template .env
pnpm start
```

启动后可使用 Expo CLI 连接 Android 模拟器或真机。录音功能必须在 Android 真机或配置了麦克风的模拟器中测试，并且首次使用时要授予麦克风权限。

## 后端地址

在 `.env` 中设置：

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-speakwise-domain.example
```

客户端会调用现有 SpeakWise 的 `dialogue.reply`、`voice.transcribe` 和 `voice.evaluate` tRPC 路由。不要把数据库连接串、JWT secret、OAuth secret 或服务端 API key 放入移动端环境变量；移动端环境变量会进入客户端包，只能放公开 API 地址或公开配置。

## Android 首版范围

当前首版包含：级别和场景选择、目标句播放、Alex/Mia 对话、真实录音权限和录音控制、真实录音上传与严格评分结果、AI 对话整句语音、听力 40 句、0.75×/1×/1.25×播放速度、Alex 男声/Mia 女声优先和系统默认声音回退、学习进度空状态以及返回顶部交互。

## 构建 APK/AAB

GitHub 用于代码托管和 Actions 自动化，不能单独把网页代码转换成 APK。推荐流程是将本目录推送到独立 GitHub 仓库，再使用 Expo/EAS：

```bash
npx eas login
npx eas build:configure
npx eas build --platform android --profile preview
```

`preview` 通常用于测试安装包，发布时再按 EAS 配置生成 AAB。当前仓库的 GitHub Actions 预览工作流已经改为完全绕过 EAS：它在 GitHub Ubuntu runner 上执行 Expo prebuild、Gradle `assembleRelease`，把 JavaScript bundle 内置进 Release APK，并上传为 GitHub Actions Artifact。这样不会消耗 Expo/EAS 的 Android 构建额度，也不需要连接 Metro。

## GitHub Actions 直接构建 APK

将本目录推送到 GitHub 后，打开 **Actions → Android preview APK (GitHub runner) → Run workflow**，在 `api_base_url` 输入公开 SpeakWise API origin，例如：

```text
https://speakwise-wsicpu2u.manus.space
```

该工作流不需要 `EXPO_TOKEN`，也不需要 Expo 登录。执行顺序为：安装 pnpm 依赖、执行 Expo prebuild、运行 TypeScript/Vitest/Jest 校验、执行 `android/gradlew assembleRelease`，最后上传 `speakwise-android-release-apk` Artifact。工作流运行完成后，进入本次 run 的 **Summary → Artifacts** 下载 APK；Artifact 默认保留 14 天。

该 APK 是用于测试安装的 Release APK，已经内置 JavaScript bundle，不需要 Metro；它仍不是 Google Play 发布用的 AAB。当前 Release 变体使用 Expo prebuild 生成的 debug signing fallback，仅适合内部测试。若以后需要正式发布，仍需配置正式 Android signing keystore 和 AAB 流程。

## 新分支改造

本次改造从 `v0.1.0-android-stable` 创建，分支名为 `feature/dark-theme-web-parity`，稳定版 `main` 未修改。当前分支已接入网页版 10 个场景的完整 40 句听力数据；口语页可按场景加载 10 句练习内容，并提供逐句语音、翻译、录音评分入口、单词点击气泡、音标、中文释义和收藏状态。AI 对话继续调用现有 `dialogue.reply` 路由，并在回复后播放整句语音。全局页面、底部导航、进度页和启动画面已经切换为深色视觉，其中启动画面使用 `assets/images/splash-screen.jpg`。

由于当前沙箱没有 Android SDK，仍需在 Android 真机或 GitHub Actions 上验证启动画面裁切、麦克风权限、真实录音上传、TTS 声线以及不同屏幕尺寸。网页版对照记录保存在 `web_parity_findings.md`。

## 验证

```bash
pnpm typecheck
pnpm test
pnpm test:components
npx expo export --platform web
```

当前开发阶段优先保证 TypeScript、纯函数和组件测试可重复；Android 原生 APK/AAB 使用 EAS 云构建。当前沙箱没有 Android SDK，因此本地 Gradle APK 编译需在开发机或 EAS runner 上完成；最终仍需要在 Android 真机上验证麦克风权限、录音文件上传、TTS 中断恢复和系统声线回退。
