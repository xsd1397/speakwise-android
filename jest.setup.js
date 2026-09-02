// jest.setup.js

// 1. 过滤不必要的 warning 日志
const originalWarn = console.warn;

jest.spyOn(console, "warn").mockImplementation((...args) => {
  const message = args.map(String).join(" ");
  if (message.includes("ExpoModulesCoreJSLogger")) return;
  originalWarn(...args);
});

// 2. Mock 通用 Proxy 帮助函数（针对所有矢量图标与 Expo 符号库，防止组件导出为 undefined）
const createComponentMock = () => {
  const { View } = require("react-native");
  return new Proxy(
    { __esModule: true, default: View },
    {
      get: (target, prop) => (prop in target ? target[prop] : View),
    }
  );
};

// 3. Mock 图标及 Expo 符号组件
jest.mock("expo-symbols", () => createComponentMock());
jest.mock("@expo/vector-icons", () => createComponentMock(), { virtual: true });

// 4. Mock ChatControlBar 依赖的 Expo 原生音频与语音模块
jest.mock(
  "expo-audio",
  () => ({
    __esModule: true,
    useAudioRecorder: () => ({
      prepareToRecordAsync: jest.fn(),
      startRecordingAsync: jest.fn(),
      stopRecordingAsync: jest.fn(),
      isRecording: false,
    }),
    useAudioPlayer: () => ({
      play: jest.fn(),
      pause: jest.fn(),
    }),
    AudioModule: {
      requestRecordingPermissionsAsync: jest.fn(() =>
        Promise.resolve({ granted: true })
      ),
    },
  }),
  { virtual: true }
);

jest.mock(
  "expo-speech",
  () => ({
    __esModule: true,
    speak: jest.fn(),
    stop: jest.fn(),
    isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  }),
  { virtual: true }
);

// 5. Mock Safe Area Context
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// 6. Mock 全局 fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);