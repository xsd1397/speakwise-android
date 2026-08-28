import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

const mockReact = React;
const mockScrollToIndex = jest.fn();
const mockScrollToOffset = jest.fn();
const mockSpeak = jest.fn();
const mockStop = jest.fn();

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

jest.mock("react-native", () => {
  const RNReact = require("react");
  const host = (name: string) => {
    const Component = ({ children, ...props }: any) => RNReact.createElement(name, props, children);
    Component.displayName = name;
    return Component;
  };
  const FlatList = RNReact.forwardRef(({ data, renderItem, ListHeaderComponent, ListFooterComponent, ...props }: any, ref: any) => {
    RNReact.useImperativeHandle(ref, () => ({ scrollToIndex: mockScrollToIndex, scrollToOffset: mockScrollToOffset }));
    return RNReact.createElement("FlatList", props,
      ListHeaderComponent,
      ...(data ?? []).map((item: any, index: number) => renderItem({ item, index })),
      ListFooterComponent,
    );
  });
  return {
    ActivityIndicator: host("ActivityIndicator"),
    NativeModules: { ExpoModulesCoreJSLogger: { get: jest.fn(() => undefined) } },
    TurboModuleRegistry: { get: jest.fn(() => null) },
    FlatList,
    Platform: { OS: "android", select: (specifics: any) => specifics.android ?? specifics.native ?? specifics.default },
    Pressable: host("Pressable"),
    StyleSheet: { create: (styles: any) => styles, flatten: (style: any) => style },
    Text: host("Text"),
    View: host("View"),
  };
});

import ListeningScreen from "../app/(tabs)/listening";

describe("ListeningScreen", () => {
  beforeEach(() => {
    mockScrollToIndex.mockClear();
    mockScrollToOffset.mockClear();
    mockSpeak.mockClear();
    mockStop.mockClear();
  });

  it("exposes all supported playback speed controls", () => {
    render(<ListeningScreen />);

    expect(screen.getByLabelText("选择0.75倍速")).toBeTruthy();
    expect(screen.getByLabelText("选择1倍速")).toBeTruthy();
    expect(screen.getByLabelText("选择1.25倍速")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("选择1.25倍速"));
    expect(screen.getAllByText("1.25×").length).toBeGreaterThanOrEqual(1);
  });

  it("switches the play-all control to a stop action", () => {
    render(<ListeningScreen />);

    const playAll = screen.getByLabelText("播放全部40句");
    fireEvent.press(playAll);
    expect(screen.getByLabelText("停止播放全部")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("停止播放全部"));
    expect(screen.getByLabelText("播放全部40句")).toBeTruthy();
  });

  it("shows the default-voice fallback and supports returning to the top", async () => {
    render(<ListeningScreen />);

    expect(await screen.findByText("暂未读取到系统声线，将使用默认英语声音播放")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("返回页面顶部"));
    expect(mockScrollToOffset).toHaveBeenCalledWith({ offset: 0, animated: true });
  });
});
