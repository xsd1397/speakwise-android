import { describe, expect, it } from "vitest";

import { LISTENING_LINES, PRACTICE_DIALOGUE, SCENE_CONTENT, SCENES } from "./data";

describe("SpeakWise learning content", () => {
  it("contains exactly 40 listening lines", () => {
    expect(LISTENING_LINES).toHaveLength(40);
    expect(LISTENING_LINES.every((line) => line.text.length > 0 && line.translation.length > 0)).toBe(true);
  });

  it("contains twelve scenes with forty complete lines each", () => {
    expect(SCENES).toHaveLength(12);
    for (const scene of SCENES) {
      const lines = SCENE_CONTENT[scene.key];
      expect(lines).toHaveLength(40);
      expect(lines.every((line) => /[A-Za-z]/.test(line.text) && line.translation.length > 0)).toBe(true);
    }
  });

  it("keeps Alex and Mia speaker labels in the practice dialogue", () => {
    expect(PRACTICE_DIALOGUE.some((line) => line.speaker === "Alex")).toBe(true);
    expect(PRACTICE_DIALOGUE.some((line) => line.speaker === "Mia")).toBe(true);
  });
});
