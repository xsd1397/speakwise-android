import { describe, expect, it } from "vitest";

import { LISTENING_LINES, PRACTICE_DIALOGUE } from "./data";

describe("SpeakWise learning content", () => {
  it("contains exactly 40 listening lines", () => {
    expect(LISTENING_LINES).toHaveLength(40);
    expect(LISTENING_LINES.every((line) => line.text.length > 0 && line.translation.length > 0)).toBe(true);
  });

  it("keeps Alex and Mia speaker labels in the practice dialogue", () => {
    expect(PRACTICE_DIALOGUE.some((line) => line.speaker === "Alex")).toBe(true);
    expect(PRACTICE_DIALOGUE.some((line) => line.speaker === "Mia")).toBe(true);
  });
});
