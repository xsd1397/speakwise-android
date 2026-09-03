import { Audio } from "expo-av";

export type DialogueMessage = {
  id?: string;
  role: "user" | "assistant";
  text: string;
  timestamp?: number | Date;
};

export type EvaluationResult = {
  score?: number;
  overallScore?: number;
  feedback?: string;
  grammar?: string[];
  pronunciation?: string[];
  vocabulary?: string[];
  [key: string]: any;
};

export const getApiBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL || "https://speakwise-wsicpu2u.manus.space";
};

/**
 * 通用 tRPC Mutation 请求封装 (1:1 适配后端 tRPC 格式)
 */
async function callTrpcMutation<T>(path: string, inputData: Record<string, any>): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/trpc/${path}?batch=1`;

  const bodyPayload = {
    "0": {
      json: inputData,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    throw new Error(`tRPC Mutation ${path} failed with HTTP status ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.result?.data?.json) {
    return data[0].result.data.json as T;
  }

  if (data?.result?.data?.json) {
    return data.result.data.json as T;
  }

  throw new Error(`Invalid tRPC response structure from ${path}`);
}

/**
 * 1. 获取对话回复提示 (dialogue.suggestions - tRPC POST Mutation)
 */
export async function fetchDialogueSuggestions(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  aiMessage: string;
}): Promise<string[]> {
  try {
    const res = await callTrpcMutation<{ suggestions: string[] }>("dialogue.suggestions", {
      level: params.level || "beginner",
      scene: params.scene || "greetings",
      history: params.history || [],
      aiMessage: params.aiMessage,
    });
    return res?.suggestions || [];
  } catch (err) {
    console.error("[fetchDialogueSuggestions] Error:", err);
    return [];
  }
}

/**
 * 2. AI 对话回复 (dialogue.reply - tRPC POST Mutation)
 */
export async function replyToDialogue(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  userMessage: string;
}): Promise<string> {
  try {
    const res = await callTrpcMutation<{ reply: string }>("dialogue.reply", {
      level: params.level || "beginner",
      scene: params.scene || "greetings",
      history: params.history || [],
      userMessage: params.userMessage,
    });
    return res?.reply || "";
  } catch (err) {
    console.error("[replyToDialogue] Error:", err);
    return "";
  }
}

export const sendDialogueMessage = replyToDialogue;

/**
 * 3. 英文翻译为中文 (translation.toChinese - tRPC POST Mutation)
 */
export async function translateToChinese(text: string): Promise<string> {
  try {
    const res = await callTrpcMutation<{ translation: string }>("translation.toChinese", { text });
    return res?.translation || "";
  } catch (err) {
    console.error("[translateToChinese] Error:", err);
    return "";
  }
}

/**
 * 4. 中文表达生成英文 (translation.toEnglish - tRPC POST Mutation)
 */
export async function translateToEnglish(text: string): Promise<string> {
  try {
    const res = await callTrpcMutation<{ translation: string }>("translation.toEnglish", { text });
    return res?.translation || "";
  } catch (err) {
    console.error("[translateToEnglish] Error:", err);
    return "";
  }
}

/**
 * 5. 语音转文字 (API Route)
 */
export async function transcribeRecording(audioUri: string): Promise<string> {
  try {
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append("file", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    } as any);

    const response = await fetch(`${baseUrl}/api/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) return "";
    const data = await response.json();
    return data.text || "";
  } catch (err) {
    console.error("[transcribeRecording] Error:", err);
    return "";
  }
}

/**
 * 6. 发音评估 (dialogue.evaluate)
 */
export async function evaluateRecording(params: {
  audioUri?: string;
  userText?: string;
  referenceText?: string;
}): Promise<EvaluationResult> {
  try {
    const res = await callTrpcMutation<EvaluationResult>("dialogue.evaluate", params);
    return res || {};
  } catch (err) {
    console.error("[evaluateRecording] Error:", err);
    return {};
  }
}

/**
 * 7. 语音合成 (TTS)
 */
export async function speakText(text: string): Promise<Audio.Sound | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) return null;

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const { sound } = await Audio.Sound.createAsync(
          { uri: base64data },
          { shouldPlay: true }
        );
        resolve(sound);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("[speakText] Error:", error);
    return null;
  }
}