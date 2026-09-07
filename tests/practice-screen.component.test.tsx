import React from "react";
import { render } from "@testing-library/react-native";

// ✅ 1. 使用 default import 导入页面组件
import IndexScreen from "../app/(tabs)/index";

// 2. 导入场景数据，用于遍历验证渲染
import { SCENES } from "../lib/data";

// 3. Mock 原生语音与音频模块 (Expo Native Modules)
jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock("expo-audio", () => ({
  useAudioRecorder: jest.fn(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    stop: jest.fn().mockResolvedValue(undefined),
    uri: "mock-recording-uri",
  })),
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

// 4. Mock API 交互模块，避免测试引发真实网络请求
jest.mock("../lib/api", () => ({
  replyToDialogue: jest.fn().mockResolvedValue({ reply: "Hello back!" }),
  fetchDialogueSuggestions: jest.fn().mockResolvedValue(["Suggestion 1", "Suggestion 2"]),
  transcribeRecording: jest.fn().mockResolvedValue({ text: "Sample transcribed text" }),
  evaluateRecording: jest.fn().mockResolvedValue({
    score: 90,
    feedback: "Good job!",
    pronunciation: [],
    grammar: [],
  }),
}));

describe("PracticeScreen", () => {
  it("renders every configured practice scene", () => {
    const { getByText } = render(<IndexScreen />);

    // 验证页面顶部标题
    expect(getByText("SpeakWise AI Coach")).toBeTruthy();

    // 验证 lib/data.ts 中配置的所有场景标题是否都已成功渲染到界面
    SCENES.forEach((scene) => {
      expect(getByText(scene.title)).toBeTruthy();
    });
  });
});