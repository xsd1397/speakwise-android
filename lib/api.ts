export type DialogueMessage = {
  id?: string;
  role: "user" | "assistant";
  text: string;
  translation?: string;
  timestamp?: number | Date;
  [key: string]: any;
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

async function callTrpcMutation<T>(path: string, inputData: Record<string, any>): Promise<T> {
  const baseUrl = getApiBaseUrl();
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

export async function fetchDialogueSuggestions(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  aiMessage: string;
}): Promise<string[]> {
  try {
    const res = await callTrpcMutation<any>("dialogue.suggestions", {
      level: params.level || "beginner",
      scene: params.scene || "greetings",
      history: params.history || [],
      aiMessage: params.aiMessage,
    });
    return res?.suggestions || [];
  } catch (err) {
    return [];
  }
}

export async function replyToDialogue(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  userMessage: string;
}): Promise<any> {
  try {
    const res = await callTrpcMutation<any>("dialogue.reply", {
      level: params.level || "beginner",
      scene: params.scene || "greetings",
      history: params.history || [],
      userMessage: params.userMessage,
    });
    return res || { reply: "" };
  } catch (err) {
    return { reply: "" };
  }
}

export async function sendDialogueMessage(params: {
  level: string;
  scene: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  userMessage: string;
}): Promise<any> {
  return replyToDialogue(params);
}

export async function translateToChinese(text: string): Promise<string> {
  try {
    const res = await callTrpcMutation<any>("translation.toChinese", { text });
    return res?.translation || "";
  } catch (err) {
    return "";
  }
}

export async function translateToEnglish(text: string): Promise<string> {
  try {
    const res = await callTrpcMutation<any>("translation.toEnglish", { text });
    return res?.translation || "";
  } catch (err) {
    return "";
  }
}

export async function transcribeRecording(audioUri: string, mimeType?: string, language?: string): Promise<{ text: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append("file", {
      uri: audioUri,
      type: mimeType || "audio/m4a",
      name: "recording.m4a",
    } as any);

    const response = await fetch(`${baseUrl}/api/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) return { text: "" };
    const data = await response.json();
    return { text: data.text || "" };
  } catch (err) {
    return { text: "" };
  }
}

// 适配 index.tsx 传入的 (audioUri, referenceText) 两个参数或 FormData 上传
export async function evaluateRecording(
  audioUri?: string | { audioUri?: string; userText?: string; referenceText?: string },
  referenceText?: string
): Promise<EvaluationResult> {
  try {
    const baseUrl = getApiBaseUrl();
    let uri: string | undefined;
    let refText: string | undefined;

    if (typeof audioUri === "object" && audioUri !== null) {
      uri = audioUri.audioUri || audioUri.userText;
      refText = audioUri.referenceText;
    } else {
      uri = audioUri;
      refText = referenceText;
    }

    // 如果传入的是本地音频文件 URI，则使用 FormData 提交到 /api/evaluate 接口
    if (uri && (uri.startsWith("file://") || uri.startsWith("content://") || uri.startsWith("blob:") || uri.includes("/"))) {
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);

      if (refText) {
        formData.append("referenceText", refText);
      }

      const response = await fetch(`${baseUrl}/api/evaluate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Evaluation HTTP error: ${response.status}`);
      }

      const data = await response.json();
      return data as EvaluationResult;
    }

    // 否则回退走原有的 tRPC 突变调用逻辑
    let payload: any = {};
    if (typeof audioUri === "object" && audioUri !== null) {
      payload = audioUri;
    } else {
      payload = { audioUri: uri, referenceText: refText };
    }
    return await callTrpcMutation<EvaluationResult>("dialogue.evaluate", payload);
  } catch (err) {
    console.error("evaluateRecording error:", err);
    return {};
  }
}

export async function speakText(text: string): Promise<any> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) return null;
    return await response.blob();
  } catch (error) {
    return null;
  }
}