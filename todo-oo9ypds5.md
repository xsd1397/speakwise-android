# SpeakWise Android TODO

- [x] 配置 SpeakWise 品牌主题、Expo Router 和 Android 应用基础信息
- [x] 建立首页、级别选择、场景选择和底部导航结构
- [x] 迁移口语目标句、对话列表和 AI 对话整句语音播放
- [x] 接入真实录音权限、录音控制、上传、转写和严格评分状态
- [x] 迁移听力 40 句会话、Alex/Mia 角色声线与默认声音回退
- [x] 增加移动端滚动回顶、加载、错误和无障碍状态
- [x] 接入现有 SpeakWise 后端 API 契约并提供环境变量示例
- [x] 补充单元/组件测试、Android 构建配置和 README
- [x] 运行类型检查、测试、Expo 导出/Android 构建验证并保存检查点（Android bundle 导出通过；本地 Gradle 因无 Android SDK 未执行；源码 Git 检查点：3331090）
- [x] 补全 Android 首页的场景选择 UI，确保 SCENES 中全部场景都可见、可选并可传入 AI 对话接口
- [x] 为 Android 首版补充组件/渲染测试，覆盖首页场景选择、录音状态切换、AI 对话发送/错误态、返回顶部、听力播放速度与声线回退（9 项 Jest 组件测试通过）
- [ ] 手动补充动态 app.config.ts 的 extra.eas.projectId，并验证新 EAS 项目关联后构建 APK（当前仅配置解析验证通过；需在已登录的本机继续执行 EAS 关联与构建）
- [x] 将 GitHub Actions 改为绕过 EAS、在 GitHub runner 上执行 Expo prebuild/Gradle 并上传 Debug APK（本地 Expo prebuild 与配置检查通过；实际 GitHub runner 构建需用户触发）
- [ ] 修复 GitHub APK 无法离线加载 JavaScript bundle：已改用内置 bundle 的 Release APK；待用户重新运行 GitHub Actions 并完成手机安装验证
