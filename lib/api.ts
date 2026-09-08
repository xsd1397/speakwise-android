export const STATIC_API_BASE_URL = "https://speakwise-wsicpu2u.manus.space";

export type DialogueMessage = {
  id?: string;
  role: "user" | "assistant";
  text: string;
  translation?: string;
  correction?: string;
  timestamp?: number | Date;
  evaluation?: EvaluationResult;
  [key: string]: any;
};

export type EvaluationResult = {
  score?: number;
  overallScore?: number;
  feedback?: string;
  transcript?: string;
  note?: string;
  grammar?: string[];
  pronunciation?: string[];
  vocabulary?: string[];
  suggestions?: string[];
  [key: string]: any;
};

export type SuggestionsResponse = {
  suggestions?: string[];
  note?: string;
  [key: string]: any;
};

export type PreflightResult = {
  ok?: boolean;
  message?: string;
  [key: string]: any;
};

export type TranslationResult = {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
};

export const getApiBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || STATIC_API_BASE_URL;
};

async function callTrpcMutation<T>(path: string, inputData: Record<string, any>): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/trpc/${path}?batch=1`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "0": { json: inputData } }),
  });

  if (!response.ok) {
    throw new Error(`tRPC ${path} failed: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && data[0]?.result?.data?.json) {
    return data[0].result.data.json as T;
  }
  if (data?.result?.data?.json) {
    return data.result.data.json as T;
  }
  return data as T;
}

async function callTrpcMutationWithFallbacks<T>(paths: string[], inputData: Record<string, any>): Promise<T> {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await callTrpcMutation<T>(path, inputData);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("tRPC call failed");
}

export async function translateText(params: {
  text: string;
  targetLanguage: "en" | "zh";
  sourceLanguage?: "en" | "zh";
}): Promise<TranslationResult> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const input = {
    text: params.text,
    sourceLanguage: params.sourceLanguage,
    targetLanguage: params.targetLanguage,
    language: params.targetLanguage,
  };

  try {
    const result = await callTrpcMutationWithFallbacks<any>(
      ["dialogue.translate", "voice.translate", "translation.translate"],
      input,
    );
    const text =
      result?.text ??
      result?.translation ??
      result?.translatedText ??
      result?.translated ??
      result?.result;

    if (typeof text === "string" && text.trim()) {
      return {
        text: text.trim(),
        sourceLanguage: params.sourceLanguage,
        targetLanguage: params.targetLanguage,
      };
    }
  } catch {
    // Use the public translation fallback below when this deployment has no translation procedure.
  }

  const source = params.sourceLanguage === "zh" ? "zh-CN" : "en";
  const target = params.targetLanguage === "zh" ? "zh-CN" : "en";
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(params.text)}&langpair=${source}|${target}`,
  );

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.status}`);
  }

  const data = await response.json() as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  const text = data.responseData?.translatedText?.trim();

  if (!text || data.responseStatus === 429) {
    throw new Error("Translation response did not contain translated text");
  }

  return {
    text: text.trim(),
    sourceLanguage: params.sourceLanguage,
    targetLanguage: params.targetLanguage,
  };
}

function normalizeEvaluationResult(raw: any): EvaluationResult {
  if (!raw || typeof raw !== "object") {
    return { score: 85, overallScore: 85, feedback: "Good effort!" };
  }

  const score = raw.score ?? raw.overallScore ?? raw.totalScore ?? 85;
  return {
    ...raw,
    score,
    overallScore: raw.overallScore ?? score,
    feedback: raw.feedback ?? raw.note ?? "Good effort!",
    transcript: raw.transcript ?? raw.text ?? raw.sentence ?? "",
  };
}

export async function fetchDialogueSuggestions(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  aiMessage: string;
}) {
  try {
    const res = await callTrpcMutationWithFallbacks<any>(["dialogue.suggestions", "voice.suggestions"], {
      level: params.level || "beginner",
      scene: params.scene || "greetings",
      history: params.history || [],
      aiMessage: params.aiMessage,
    });

    const suggestions =
      res?.suggestions ??
      res?.items ??
      res?.data?.suggestions ??
      res?.result?.data?.json?.suggestions ??
      [];

    return Array.isArray(suggestions) ? suggestions : [];
  } catch (err) {
    return [];
  }
}

export async function getReplySuggestions(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  aiMessage: string;
}) {
  return fetchDialogueSuggestions(params);
}

export async function replyToDialogue(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  userMessage: string;
}) {
  try {
    const res = await callTrpcMutationWithFallbacks<any>(["dialogue.reply", "voice.reply"], {
      level: params.level || "beginner",
      scene: params.scene || "greetings",
      history: params.history || [],
      userMessage: params.userMessage,
    });

    if (res?.reply || res?.message) {
      return { reply: res.reply || res.message };
    }

    return res || { reply: "" };
  } catch (err) {
    console.error("replyToDialogue error:", err);
    throw err;
  }
}

export async function transcribeRecording(params: {
  audioBase64: string;
  mimeType?: string;
  targetSentence?: string;
  language?: string;
}) {
  try {
    const res = await callTrpcMutationWithFallbacks<any>(["voice.transcribe", "audio.transcribe"], {
      audioBase64: params.audioBase64,
      mimeType: params.mimeType || "audio/m4a",
      targetSentence: params.targetSentence,
      language: params.language || "auto",
    });

    if (res && typeof res === "object") {
      const text = res.text ?? res.transcript ?? res.result ?? "";
      return { ...res, text };
    }

    return { text: "" };
  } catch (err) {
    console.error("transcribeRecording error:", err);
    throw err;
  }
}

export async function evaluateRecording(params: {
  text: string;
  audioBase64?: string;
  targetText?: string;
  targetSentence?: string;
  mimeType?: string;
  language?: string;
  level?: string;
  scene?: string;
}): Promise<EvaluationResult> {
  try {
    const targetSentence = params.targetText ?? params.targetSentence ?? params.text;
    const res = await callTrpcMutationWithFallbacks<any>(["voice.evaluate", "dialogue.evaluate"], {
      text: params.text,
      audioBase64: params.audioBase64,
      targetText: targetSentence,
      targetSentence,
      mimeType: params.mimeType || "audio/m4a",
      language: params.language || "en",
      level: params.level || "beginner",
      scene: params.scene || "greetings",
    });

    return normalizeEvaluationResult(res);
  } catch (err) {
    console.error("evaluateRecording error:", err);
    throw err;
  }
}