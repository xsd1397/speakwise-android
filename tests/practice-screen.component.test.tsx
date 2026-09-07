import React from "react";
import { render, waitFor } from "@testing-library/react-native";

// 使用 default import 匹配 export default IndexScreen
import IndexScreen from "../app/(tabs)/index";

// 场景配置数据
import { SCENES } from "../lib/data";

// Mock Expo 语音模块
jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

// Mock Expo 音频录制模块（含 useAudioRecorderState）
jest.mock("expo-audio", () => ({
  useAudioRecorder: jest.fn(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    stop: jest.fn().mockResolvedValue(undefined),
    uri: "mock-recording-uri",
  })),
  useAudioRecorderState: jest.fn(() => ({
    isRecording: false,
    recordingTime: 0,
    meter: -160,
  })),
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock API 请求
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
  it("renders every configured practice scene", async () => {
    const { getByText } = render(<IndexScreen />);

    // 验证页面主标题渲染
    expect(getByText("SpeakWise AI Coach")).toBeTruthy();

    // 验证场景列表中所有 Scene 标题渲染
    SCENES.forEach((scene) => {
      expect(getByText(scene.title)).toBeTruthy();
    });

    // ✅ 等待 useEffect 中的异步 fetchDialogueSuggestions 状态更新完成，消除 act 警告
    await waitFor(() => {
      expect(getByText("Suggestion 1")).toBeTruthy();
    });
  });
});