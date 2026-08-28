import { describe, expect, it } from "vitest";
import type { Voice } from "expo-speech";

import { selectVoiceForSpeaker } from "./voice";

const voice = (name: string, language = "en-US"): Voice => ({ identifier: name.toLowerCase().replaceAll(" ", "-"), name, quality: "Default" as Voice["quality"], language });

describe("selectVoiceForSpeaker", () => {
  it("prefers a recognizable male voice for Alex", () => {
    const result = selectVoiceForSpeaker([voice("Samantha"), voice("David")], "Alex");
    expect(result.voice?.name).toBe("David");
    expect(result.matchedGender).toBe(true);
    expect(result.fallback).toBe(false);
  });

  it("prefers a recognizable female voice for Mia", () => {
    const result = selectVoiceForSpeaker([voice("David"), voice("Samantha")], "Mia");
    expect(result.voice?.name).toBe("Samantha");
    expect(result.matchedGender).toBe(true);
  });

  it("does not guess gender from an unknown voice name", () => {
    const result = selectVoiceForSpeaker([voice("English System Voice")], "Mia");
    expect(result.voice).toBeUndefined();
    expect(result.matchedGender).toBe(false);
    expect(result.fallback).toBe(true);
  });

  it("prefers English voices when other languages are present", () => {
    const result = selectVoiceForSpeaker([voice("Samantha", "zh-CN"), voice("Samantha", "en-US")], "Mia");
    expect(result.voice?.language).toBe("en-US");
  });
});
