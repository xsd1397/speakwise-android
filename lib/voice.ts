import type { Voice } from "expo-speech";

export type Speaker = "Alex" | "Mia";

export type VoiceSelection = {
  voice?: Voice;
  matchedGender: boolean;
  fallback: boolean;
};

const PREFERRED_NAMES: Record<Speaker, RegExp[]> = {
  Alex: [
    /\balex\b/i,
    /david|daniel|andrew|brian|guy|mark|ryan|tom|fred|ralph|oliver|arthur/i,
    /male|george/i,
  ],
  Mia: [
    /\bmia\b/i,
    /samantha|karen|susan|victoria|jenny|aria|hazel|libby|fiona|allison|ava|emma|joanna|kendra|kimberly|salli|ivy|moira|zira/i,
    /female|jenny|aria/i,
  ],
};

const GENDER_NAMES: Record<Speaker, RegExp> = {
  Alex: /david|daniel|andrew|brian|guy|mark|ryan|tom|fred|ralph|oliver|arthur|male|george/i,
  Mia: /samantha|karen|susan|victoria|jenny|aria|hazel|libby|fiona|allison|ava|emma|joanna|kendra|kimberly|salli|ivy|moira|zira|female/i,
};

export function selectVoiceForSpeaker(voices: Voice[], speaker: Speaker): VoiceSelection {
  const english = voices.filter((voice) => /^en([_-]|$)/i.test(voice.language));
  const candidates = english.length > 0 ? english : voices;
  const preferred = candidates.find((voice) => PREFERRED_NAMES[speaker].some((pattern) => pattern.test(`${voice.name} ${voice.identifier}`)));
  const genderMatch = candidates.find((voice) => GENDER_NAMES[speaker].test(`${voice.name} ${voice.identifier}`));
  const voice = preferred ?? genderMatch;

  return {
    voice,
    matchedGender: Boolean(voice),
    fallback: !voice,
  };
}

export function getSpeechRate(rate: number) {
  return Math.max(0.5, Math.min(2, rate));
}
