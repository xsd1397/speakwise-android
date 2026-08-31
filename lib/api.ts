import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";

export type DialogueRole = "user" | "assistant";
export type DialogueMessage = { role: DialogueRole; text: string; translation?: string; correction?: string };
export type EvaluationResult = { transcript: string; duration: number; overallScore: number; pronunciationScore: number; fluencyScore: number; accuracyScore: number; transcriptAccuracy: number; wordErrorRate: number; summary: string; issues: string[]; suggestions: string[] };

const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL;
export function getApiBaseUrl() { return configuredBaseUrl?.replace(/\/$/, "") ?? ""; }

async function callMutation<T>(procedure: string, input: unknown): Promise<T> { 
  const baseUrl = getApiBaseUrl(); 
  if (!baseUrl) throw new Error("尚未配置后端地址，请在 app.config.ts 或 EXPO_PUBLIC_API_BASE_URL 中设置。"); 
  const response = await fetch(`${baseUrl}/api/trpc/${procedure}`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ json: input }) 
  }); 
  const payload = await response.json() as { result?: { data?: { json?: T } }; error?: { json?: { message?: string } }; }; 
  if (!response.ok) throw new Error(payload.error?.json?.message ?? `请求失败: ${response.status}`); 
  const result = payload.result?.data?.json; 
  if (result === undefined) throw new Error("服务器返回了无法识别的数据。"); 
  return result; 
}

// 1. 对话回复
export async function replyToDialogue(input: { level: "beginner" | "intermediate" | "advanced"; scene: "greetings" | "travel" | "business" | "housing" | "medical" | "banking" | "shopping" | "transit" | "government" | "school"; history: DialogueMessage[]; userMessage: string }) { 
  return callMutation<{ reply: string; translation?: string; correction?: string; correctedEnglish?: string }>("dialogue.reply", input); 
}

// 2. [新增] 获取回复建议 (移植自网页端)
export async function getReplySuggestions(input: { level: "beginner" | "intermediate" | "advanced"; scene: "greetings" | "travel" | "business" | "housing" | "medical" | "banking" | "shopping" | "transit" | "government" | "school"; history: DialogueMessage[]; aiMessage: string }) { 
  return callMutation<{ suggestions: string[] }>("dialogue.suggestions", input); 
}

// 3. 中文翻译
export async function translateToChinese(text: string) { 
  const value = text.trim(); if (!value) return value; 
  try { 
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=en|zh-CN`); 
    const payload = await response.json() as { responseData?: { translatedText?: string } }; 
    return payload.responseData?.translatedText?.trim() || "中文翻译暂时不可用"; 
  } catch { return "中文翻译暂时不可用"; } 
}

// 4. 英文翻译
export async function translateToEnglish(text: string) { 
  const value = text.trim(); if (!value) return value; 
  try { 
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=zh-CN|en`); 
    const payload = await response.json() as { responseData?: { translatedText?: string } }; 
    const translated = payload.responseData?.translatedText?.trim(); 
    return translated || value; 
  } catch { return value; } 
}

async function readAudio(uri: string) { 
  if (!uri) throw new Error("没有找到真实音频文件，请重新录制。"); 
  const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 }); 
  if (!audioBase64) throw new Error("音频文件为空，请重新录制。"); 
  return audioBase64; 
}

export async function evaluateRecording(uri: string, targetSentence: string, mimeType = "audio/mp4") { 
  return callMutation<EvaluationResult>("voice.evaluate", { audioBase64: await readAudio(uri), mimeType, targetSentence, language: "en" }); 
}

export async function transcribeRecording(uri: string, mimeType = "audio/mp4", language: "auto" | "en" | "zh" = "auto") { 
  return callMutation<{ text: string; duration?: number }>("voice.transcribe", { audioBase64: await readAudio(uri), mimeType, language }); 
}
