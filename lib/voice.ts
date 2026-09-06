import type { Voice } from "expo-speech";
import { Audio } from "expo-av";

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

let activeRecording: Audio.Recording | null = null;

export async function startAudioRecording(): Promise<void> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Microphone permission not granted");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    if (activeRecording) {
      try {
        await activeRecording.stopAndUnloadAsync();
      } catch {}
      activeRecording = null;
    }

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    activeRecording = recording;
  } catch (err) {
    console.error("Failed to start audio recording:", err);
    throw err;
  }
}

export async function stopAudioRecording(): Promise<string | null> {
  if (!activeRecording) return null;

  try {
    await activeRecording.stopAndUnloadAsync();
    const uri = activeRecording.getURI();
    activeRecording = null;
    return uri;
  } catch (err) {
    console.error("Failed to stop audio recording:", err);
    activeRecording = null;
    return null;
  }
}