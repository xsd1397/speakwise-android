export type DialogueMessage = {
  id?: string;
  role: "user" | "assistant";
  text: string;
  translation?: string;
  timestamp?: number | Date;
  evaluation?: EvaluationResult;
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
}) {
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
}) {
  try {
    const res = await callTrpcMutation<any>("dialogue.reply", {
      level: params.level || "beginner",
      scene: params.scene || "greetings",
      history: params.history || [],
      userMessage: params.userMessage,
    });
    return res || { reply: "" };
  } catch (err) {
    console.error("replyToDialogue error:", err);
    throw err;
  }
}

export async function transcribeRecording(params: {
  audioBase64: string;
  mimeType?: string;
}) {
  try {
    const res = await callTrpcMutation<any>("audio.transcribe", {
      audioBase64: params.audioBase64,
      mimeType: params.mimeType || "audio/m4a",
    });
    return res || { text: "" };
  } catch (err) {
    console.error("transcribeRecording error:", err);
    throw err;
  }
}

export async function evaluateRecording(params: {
  text: string;
  audioBase64?: string;
  targetText?: string;
  level?: string;
  scene?: string;
}): Promise<EvaluationResult> {
  try {
    const res = await callTrpcMutation<any>("dialogue.evaluate", {
      text: params.text,
      audioBase64: params.audioBase64,
      targetText: params.targetText,
      level: params.level || "beginner",
      scene: params.scene || "greetings",
    });
    return res || { score: 85, overallScore: 85, feedback: "Good effort!" };
  } catch (err) {
    console.error("evaluateRecording error:", err);
    throw err;
  }
}