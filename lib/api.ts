// lib/api.ts

export interface DialogueMessage {
  role: 'user' | 'assistant';
  text: string;
  translation?: string;
  correction?: string;
}

export interface EvaluationResult {
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  accuracyScore: number;
  transcript: string;
  summary: string;
}

export interface ReplyResponse {
  reply: string;
  translation?: string;
  correction?: string;
  correctedEnglish?: string;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

// 获取配置的 API Base URL
export function getApiBaseUrl(): string {
  // 根据你的实际环境变量或配置修改
  return process.env.EXPO_PUBLIC_API_URL || '';
}

// 评估录音评分
export async function evaluateRecording(
  uri: string,
  targetText: string
): Promise<EvaluationResult> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);
  formData.append('targetText', targetText);

  const res = await fetch(`${baseUrl}/api/evaluate`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('录音评分请求失败');
  return res.json();
}

// AI 对话回复
export async function replyToDialogue(params: {
  level: string;
  scene: string;
  history: DialogueMessage[];
  userMessage: string;
}): Promise<ReplyResponse> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error('AI 对话请求失败');
  return res.json();
}

// 获取回复提示建议
export async function getReplySuggestions(params: {
  level: string;
  scene: string;
  history: { role: string; text: string }[];
  aiMessage: string;
}): Promise<SuggestionsResponse> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error('获取建议失败');
  return res.json();
}

// 录音转文字 (STT)
export async function transcribeRecording(
  uri: string,
  mimeType: string = 'audio/mp4',
  language: string = 'auto'
): Promise<{ text: string }> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'audio.m4a',
    type: mimeType,
  } as any);
  formData.append('language', language);

  const res = await fetch(`${baseUrl}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('语音识别失败');
  return res.json();
}

// 中文翻译
export async function translateToChinese(text: string): Promise<string> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return text;

  try {
    const res = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang: 'zh' }),
    });
    const data = await res.json();
    return data.translation || text;
  } catch {
    return text;
  }
}

// 英文翻译
export async function translateToEnglish(text: string): Promise<string> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return text;

  try {
    const res = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang: 'en' }),
    });
    const data = await res.json();
    return data.translation || text;
  } catch {
    return text;
  }
}