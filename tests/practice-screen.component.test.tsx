import React from "react";

import { fireEvent, render, screen } from "@testing-library/react-native";

const mockScrollTo = jest.fn();
const mockSpeak = jest.fn();
const mockStop = jest.fn();
const mockSendReply = jest.fn();
let mockApiBaseUrl = "";
let mockSetRecordingState: ((isRecording: boolean) => void) | undefined;

jest.mock("expo-audio", () => {
  const RNReact = require("react");
  const recorder = {
    prepareToRecordAsync: jest.fn(),
    record: jest.fn(() => mockSetRecordingState?.(true)),
    stop: jest.fn(async () => {
      mockSetRecordingState?.(false);
    }),
    uri: "file:///tmp/speakwise-test.m4a",
  };
  return {
    __esModule: true,
    RecordingPresets: { HIGH_QUALITY: {} },
    requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })),
    setAudioModeAsync: jest.fn(async () => undefined),
    useAudioRecorder: jest.fn(() => recorder),
    useAudioRecorderState: jest.fn(() => {
      const [isRecording, setIsRecording] = RNReact.useState(false);
      mockSetRecordingState = setIsRecording;
      return { isRecording, durationMillis: isRecording ? 1200 : 0 };
    }),
  };
});

jest.mock("expo-speech", () => ({
  __esModule: true,
  getAvailableVoicesAsync: jest.fn(() => ({ then: (resolve: (voices: unknown[]) => void) => { resolve([]); return { catch: () => undefined }; } })),
  speak: mockSpeak,
  stop: mockStop,
  default: { getAvailableVoicesAsync: jest.fn(() => ({ then: (resolve: (voices: unknown[]) => void) => { resolve([]); return { catch: () => undefined }; } })), speak: mockSpeak, stop: mockStop },
}));

jest.mock("@/components/ScreenContainer", () => {
  const RNReact = require("react");
  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => RNReact.createElement(RNReact.Fragment, null, children),
  };
});

jest.mock("@/lib/api", () => ({
  __esModule: true,
  evaluateRecording: jest.fn(),
  transcribeRecording: jest.fn(async () => ({ text: "Hello there" })),
  getApiBaseUrl: () => mockApiBaseUrl,
  replyToDialogue: jest.fn(),
}));

import PracticeScreen from "../app/(tabs)/index";
import { SCENES } from "../lib/data";
const mockApi = require("@/lib/api") as { replyToDialogue: jest.Mock };

jest.mock("react-native", () => {
  const RNReact = require("react");
  const host = (name: string) => {
    const Component = ({ children, ...props }: any) => RNReact.createElement(name, props, children);
    Component.displayName = name;
    return Component;
  };
  const ScrollView = RNReact.forwardRef(({ children, ...props }: any, ref: any) => {
    RNReact.useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
    return RNReact.createElement("ScrollView", props, children);
  });
  const TextInput = ({ onChangeText, ...props }: any) => RNReact.createElement("TextInput", {
    ...props,
    onChangeText,
    onChange: (event: any) => onChangeText?.(event.nativeEvent?.text ?? ""),
  });
  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    NativeModules: { ExpoModulesCoreJSLogger: { get: jest.fn(() => undefined) } },
    TurboModuleRegistry: { get: jest.fn(() => null) },
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    ScrollView,
    StyleSheet: { create: (styles: any) => styles, flatten: (style: any) => style },
    Text: host("Text"),
  TextInput,
  View: host("View"),
  };
});

describe("PracticeScreen", () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
    mockSpeak.mockClear();
    mockStop.mockClear();
    mockApi.replyToDialogue.mockReset();
    mockApiBaseUrl = "";
    mockSetRecordingState = undefined;
  });

  it("renders every configured practice scene", () => {
    render(<PracticeScreen />);

    for (const scene of SCENES) {
      expect(screen.getByText(scene.title)).toBeTruthy();
    }
  });

  it("protects the send action when the input is empty", () => {
    render(<PracticeScreen />);

    fireEvent.press(screen.getByLabelText("发送 AI 对话回复"));

    expect(mockSendReply).not.toHaveBeenCalled();
  });

  it("shows only the AI recording and reply hint controls", () => {
    render(<PracticeScreen />);

    expect(screen.queryByLabelText("开始真实录音")).toBeNull();
    expect(screen.getByLabelText("开始 AI 录音")).toBeTruthy();
    expect(screen.getByText("回复提示")).toBeTruthy();
  });

  it("appends a successful AI response and keeps whole-sentence speech", async () => {
    mockApiBaseUrl = "https://api.example";
    mockApi.replyToDialogue.mockResolvedValue({ reply: "Nice to meet you too." });
    render(<PracticeScreen />);

    fireEvent.changeText(screen.getByLabelText("输入 AI 对话回复"), "Hello there");
    fireEvent.press(screen.getByLabelText("发送 AI 对话回复"));

    expect(await screen.findByText("Nice to meet you too.")).toBeTruthy();
  });

  it("shows an explicit error when the AI request fails", async () => {
    mockApiBaseUrl = "https://api.example";
    mockApi.replyToDialogue.mockRejectedValue(new Error("AI 请求失败"));
    render(<PracticeScreen />);

    fireEvent.changeText(screen.getByLabelText("输入 AI 对话回复"), "Hello there");
    fireEvent.press(screen.getByLabelText("发送 AI 对话回复"));

    expect(await screen.findByText("AI 请求失败")).toBeTruthy();
  });

  it("exposes the back-to-top control with an accessible label", () => {
    render(<PracticeScreen />);

    const button = screen.getByLabelText("返回页面顶部");
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(mockScrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
  });
});
