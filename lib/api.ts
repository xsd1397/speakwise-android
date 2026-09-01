export interface PreflightResult {
  isEnglish: boolean;
  hasError?: boolean;
  originalText: string;
  correctedText?: string;
  explanation?: string;
  translatedText?: string; // 如果输入为中文，则返回翻译后的英文
}

/**
 * 纠错/翻译预检：自动判断中英文并处理
 */
export async function processPreflightCheck(inputText: string): Promise<PreflightResult> {
  // 正则检测是否主要包含英文字母
  const englishCharCount = (inputText.match(/[a-zA-Z]/g) || []).length;
  const isEnglish = englishCharCount / inputText.length > 0.4;

  if (isEnglish) {
    const prompt = `You are an AI English tutor. Check the following text for spelling, grammar, or phrasing errors.
Text: "${inputText}"
Return strictly JSON format:
{
  "hasError": boolean,
  "correctedText": "corrected English sentence",
  "explanation": "Brief explanation in Chinese if there are errors, otherwise empty"
}`;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      const parsed = JSON.parse(data.text);

      return {
        isEnglish: true,
        hasError: parsed.hasError,
        originalText: inputText,
        correctedText: parsed.correctedText,
        explanation: parsed.explanation,
      };
    } catch {
      return { isEnglish: true, hasError: false, originalText: inputText, correctedText: inputText };
    }
  } else {
    // 中文输入 -> 执行原有的翻译逻辑
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, targetLang: 'en' }),
      });
      const data = await response.json();
      return {
        isEnglish: false,
        originalText: inputText,
        translatedText: data.translatedText,
      };
    } catch {
      return { isEnglish: false, originalText: inputText, translatedText: inputText };
    }
  }
}