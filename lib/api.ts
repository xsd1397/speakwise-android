const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://speakwise-wsicpu2u.manus.space";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";

export type DialogueRole = "user" | "assistant";
export type DialogueMessage = { role: DialogueRole; text: string; translation?: string; correction?: string };
export type EvaluationResult = { transcript: string; duration: number; overallScore: number; pronunciationScore: number; fluencyScore: number; accuracyScore: number; transcriptAccuracy: number; wordErrorRate: number; summary: string; issues: string[]; suggestions: string[] };

const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL;

export function getApiBaseUrl() {
  return configuredBaseUrl ? configuredBaseUrl.replace(/\/$/, "") : "";
}

async function callMutation<T>(procedure: string, input: unknown): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) throw new Error("尚未配置后端地址，请在 app.config.ts 或 EXPO_PUBLIC_API_BASE_URL 中设置。");
  const response = await fetch(`${baseUrl}/api/trpc/${procedure}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: input })
  });
  const payload = await response.json() as { result?: { data?: { json?: T } }; error?: { json?: { message?: string } }; };
  if (!response.ok) throw new Error(payload.error?.json?.message ?? `请求失败（${response.status}）`);
  const result = payload.result?.data?.json;
  if (result === undefined) throw new Error("服务端返回了无法识别的数据。");
  return result;
}

export async function replyToDialogue(input: { level: "beginner" | "intermediate" | "advanced"; scene: "greetings" | "travel" | "business" | "housing" | "medical" | "banking" | "shopping" | "transit" | "government" | "school" | "restaurant" | "emergency"; history: DialogueMessage[]; userMessage: string }) {
  return callMutation<{ reply: string; translation?: string; correction?: string; correctedEnglish?: string }>("dialogue.reply", input);
}

export async function translateToChinese(text: string) {
  const value = text.trim();
  if (!value) return value;
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=en|zh-CN`);
    const payload = await response.json() as { responseData?: { translatedText?: string } };
    return payload.responseData?.translatedText?.trim() || "中文翻译暂不可用";
  } catch {
    return "中文翻译暂不可用";
  }
}

export async function translateToEnglish(text: string) {
  const value = text.trim();
  if (!value) return value;
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=zh-CN|en`);
    const payload = await response.json() as { responseData?: { translatedText?: string } };
    const translated = payload.responseData?.translatedText?.trim();
    return translated || value;
  } catch {
    return value;
  }
}

async function readAudio(uri: string) {
  if (!uri) throw new Error("没有找到真实录音文件，请重新录制。");
  const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  if (!audioBase64) throw new Error("录音文件为空，请重新录制。");
  return audioBase64;
}

export async function evaluateRecording(uri: string, targetSentence: string, mimeType = "audio/mp4") {
  return callMutation<EvaluationResult>("voice.evaluate", { audioBase64: await readAudio(uri), mimeType, targetSentence, language: "en" });
}

export async function transcribeRecording(uri: string, mimeType = "audio/mp4", language: "auto" | "en" | "zh" = "auto") {
  return callMutation<{ text: string; duration?: number }>("voice.transcribe", { audioBase64: await readAudio(uri), mimeType, language });
}

export async function checkGrammarError(userInput: string): Promise<{ hasError: boolean; correctedText: string; explanation: string }> {
  try {
    const res = await replyToDialogue({
      level: "intermediate",
      scene: "greetings",
      history: [],
      userMessage: `Please check and correct this sentence: "${userInput}". Provide corrections if needed.`
    });
    if (res.correction || res.correctedEnglish) {
      return {
        hasError: true,
        correctedText: res.correctedEnglish || userInput,
        explanation: res.correction || "句子表达不够标准，建议使用更地道的说法。"
      };
    }
    return {
      hasError: false,
      correctedText: userInput,
      explanation: "表达非常地道，没有发现明显错误！"
    };
  } catch {
    return {
      hasError: false,
      correctedText: userInput,
      explanation: "暂未发现语法错误或纠错服务无响应。"
    };
  }
}

export interface DialogueHistoryMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface DialogueSuggestionsParams {
  level: 'beginner' | 'intermediate' | 'advanced';
  scene: 'greetings' | 'travel' | 'business' | 'housing' | 'medical' | 'banking' | 'shopping' | 'transit' | 'government' | 'school';
  history: DialogueHistoryMessage[];
  aiMessage: string;
}

export async function fetchDialogueSuggestions(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  aiMessage: string;
}): Promise<string[]> {
  try {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://speakwise-wsicpu2u.manus.space";
    const url = `${baseUrl}/api/trpc/dialogue.suggestions?batch=1`;

    // tRPC batch mutation payload
    const bodyPayload = {
      "0": {
        json: {
          level: params.level || "beginner",
          scene: params.scene || "greetings",
          history: params.history || [],
          aiMessage: params.aiMessage || "",
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      console.warn("[fetchDialogueSuggestions] HTTP status:", response.status);
      return [];
    }

    const data = await response.json();

    // 适配 tRPC batch mutation 的响应数据解构
    if (Array.isArray(data)) {
      const firstItem = data[0];
      const jsonRes = firstItem?.result?.data?.json;
      if (Array.isArray(jsonRes)) {
        return jsonRes;
      }
      if (jsonRes?.suggestions && Array.isArray(jsonRes.suggestions)) {
        return jsonRes.suggestions;
      }
      if (firstItem?.result?.data && Array.isArray(firstItem.result.data)) {
        return firstItem.result.data;
      }
    }

    if (data?.result?.data?.json) {
      const jsonRes = data.result.data.json;
      if (Array.isArray(jsonRes)) return jsonRes;
      if (jsonRes?.suggestions && Array.isArray(jsonRes.suggestions)) return jsonRes.suggestions;
    }

    return [];
  } catch (err) {
    console.error("[fetchDialogueSuggestions] Error:", err);
    return [];
  }
}): Promise<string[]> {
  try {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://speakwise-wsicpu2u.manus.space";
    // 构造 tRPC query 参数
    const inputPayload = JSON.stringify({
      "0": {
        json: {
          level: params.level || "beginner",
          scene: params.scene || "greetings",
          history: params.history || [],
          aiMessage: params.aiMessage || "",
        }
      }
    });

    const url = `${baseUrl}/api/trpc/dialogue.suggestions?batch=1&input=${encodeURIComponent(inputPayload)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("[fetchDialogueSuggestions] HTTP error:", response.status);
      return [];
    }

    const data = await response.json();
    
    // 自动兼容各种 tRPC 响应格式与普通数组格式
    if (Array.isArray(data)) {
      const firstItem = data[0];
      if (firstItem?.result?.data?.json && Array.isArray(firstItem.result.data.json)) {
        return firstItem.result.data.json;
      }
      if (firstItem?.result?.data && Array.isArray(firstItem.result.data)) {
        return firstItem.result.data;
      }
    }
    if (data?.result?.data?.json && Array.isArray(data.result.data.json)) {
      return data.result.data.json;
    }
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (err) {
    console.error("[fetchDialogueSuggestions] Error:", err);
    return [];
  }
}






