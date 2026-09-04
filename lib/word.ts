export interface WordDefinition {
  phonetic?: string;
  meaning?: string;
}

const staticDictionary: Record<string, WordDefinition> = {
  "hello": { phonetic: "/həˈloʊ/", meaning: "int. 喂，你好" },
  "world": { phonetic: "/wɜːrld/", meaning: "n. 世界；地球" },
  "practice": { phonetic: "/ˈpræktɪs/", meaning: "v. & n. 练习，实践" },
  "good": { phonetic: "/ɡʊd/", meaning: "adj. 好的，优良的" },
  "morning": { phonetic: "/ˈmɔːrnɪŋ/", meaning: "n. 早晨，上午" },
  "name": { phonetic: "/neɪm/", meaning: "n. 名字；v. 命名" },
  "meet": { phonetic: "/miːt/", meaning: "v. 遇见，见到" },
  "please": { phonetic: "/pliːz/", meaning: "int. 请；v. 使高兴" },
  "thank": { phonetic: "/θæŋk/", meaning: "v. 感谢" },
  "you": { phonetic: "/juː/", meaning: "pron. 你，你们" },
};

const SUFFIXES = ["ies", "es", "s", "ed", "ing", "ly", "er", "est"];

/**
 * 智能解析单词（对齐网页端测试逻辑，支持词缀还原与双写字母处理）
 */
export function resolveWordDefinition(rawWord: string): WordDefinition | null {
  const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanWord) return null;

  // 1. 直接匹配原形
  if (staticDictionary[cleanWord]) {
    return staticDictionary[cleanWord];
  }

  // 2. 遍历后缀规则进行词根还原
  for (const suffix of SUFFIXES) {
    if (!cleanWord.endsWith(suffix) || cleanWord.length - suffix.length < 2) continue;
    const base = cleanWord.slice(0, cleanWord.length - suffix.length);
    
    if (staticDictionary[base]) {
      return staticDictionary[base];
    }
    // 处理末尾双写字母还原（如 running -> run）
    if (base.length > 1 && base.at(-1) === base.at(-2) && staticDictionary[base.slice(0, -1)]) {
      return staticDictionary[base.slice(0, -1)];
    }
  }

  return null;
}

export function getWordDefinition(word: string): WordDefinition {
  const resolved = resolveWordDefinition(word);
  if (resolved) return resolved;
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  return {
    phonetic: `/${cleanWord}/`,
    meaning: "点击查看详细释义",
  };
}

export async function lookupWordDefinition(word: string): Promise<WordDefinition | null> {
  const resolved = resolveWordDefinition(word);
  if (resolved) {
    return resolved;
  }
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  return {
    phonetic: `/${cleanWord}/`,
    meaning: "暂无直接释义",
  };
}