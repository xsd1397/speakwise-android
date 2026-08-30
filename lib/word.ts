export type WordDefinition = { phonetic: string; meaning: string };
const WORDS: Record<string, WordDefinition> = {
  a: { phonetic: "/ə/", meaning: "一个；一" }, an: { phonetic: "/ən/", meaning: "一个；一" }, the: { phonetic: "/ðə/", meaning: "这；那；这些；那些" }, i: { phonetic: "/aɪ/", meaning: "我" }, "i've": { phonetic: "/aɪv/", meaning: "我已经；我一直" }, "i'm": { phonetic: "/aɪm/", meaning: "我是" }, "it's": { phonetic: "/ɪts/", meaning: "它是；这是" }, you: { phonetic: "/juː/", meaning: "你；你们" }, your: { phonetic: "/jʊr/", meaning: "你的；你们的" }, we: { phonetic: "/wiː/", meaning: "我们" }, they: { phonetic: "/ðeɪ/", meaning: "他们" }, have: { phonetic: "/hæv/", meaning: "有；已经" }, been: { phonetic: "/bɪn/", meaning: "是；一直处于" }, what: { phonetic: "/wʌt/", meaning: "什么" }, how: { phonetic: "/haʊ/", meaning: "怎样；如何" }, are: { phonetic: "/ɑːr/", meaning: "是" }, hi: { phonetic: "/haɪ/", meaning: "嗨；你好" }, hello: { phonetic: "/həˈloʊ/", meaning: "你好" }, nice: { phonetic: "/naɪs/", meaning: "友好的；不错的" }, meet: { phonetic: "/miːt/", meaning: "遇见；见面" }, today: { phonetic: "/təˈdeɪ/", meaning: "今天" }, while: { phonetic: "/waɪl/", meaning: "一段时间；当……时" }, well: { phonetic: "/wel/", meaning: "好；顺利地" }, busy: { phonetic: "/ˈbɪzi/", meaning: "忙碌的" }, work: { phonetic: "/wɜːrk/", meaning: "工作" }, feeling: { phonetic: "/ˈfiːlɪŋ/", meaning: "感觉" }, catch: { phonetic: "/kætʃ/", meaning: "赶上；叙旧" }, soon: { phonetic: "/suːn/", meaning: "很快" }, definitely: { phonetic: "/ˈdefɪnətli/", meaning: "当然；肯定地" }, free: { phonetic: "/friː/", meaning: "空闲的；免费的" }, weekend: { phonetic: "/ˌwiːkˈend/", meaning: "周末" }, saturday: { phonetic: "/ˈsætərdeɪ/", meaning: "星期六" }, afternoon: { phonetic: "/ˌæftərˈnuːn/", meaning: "下午" }, works: { phonetic: "/wɜːrks/", meaning: "奏效；合适" }, perfectly: { phonetic: "/ˈpɜːrfɪktli/", meaning: "完美地；完全地" }, great: { phonetic: "/ɡreɪt/", meaning: "很棒的；大的" }, "let's": { phonetic: "/lets/", meaning: "让我们" }, cafe: { phonetic: "/kæˈfeɪ/", meaning: "咖啡馆" }, downtown: { phonetic: "/ˌdaʊnˈtaʊn/", meaning: "市中心" }, heard: { phonetic: "/hɜːrd/", meaning: "听说；听到" }, things: { phonetic: "/θɪŋz/", meaning: "事情；事物" }, coffee: { phonetic: "/ˈkɔːfi/", meaning: "咖啡" }, disappointed: { phonetic: "/ˌdɪsəˈpɔɪntɪd/", meaning: "失望的" }, shall: { phonetic: "/ʃæl/", meaning: "将；好吗" }, say: { phonetic: "/seɪ/", meaning: "说；表示" }, around: { phonetic: "/əˈraʊnd/", meaning: "大约；在周围" }, looking: { phonetic: "/ˈlʊkɪŋ/", meaning: "期待；看" }, forward: { phonetic: "/ˈfɔːrwərd/", meaning: "向前；期待" }, productive: { phonetic: "/prəˈdʌktɪv/", meaning: "高效的" }, enjoying: { phonetic: "/ɪnˈdʒɔɪɪŋ/", meaning: "享受" }, lately: { phonetic: "/ˈleɪtli/", meaning: "最近" }, taking: { phonetic: "/ˈteɪkɪŋ/", meaning: "参加；拿取" }, photography: { phonetic: "/fəˈtɑːɡrəfi/", meaning: "摄影" }, class: { phonetic: "/klæs/", meaning: "课程；班级" }, fascinating: { phonetic: "/ˈfæsəneɪtɪŋ/", meaning: "迷人的；极有趣的" }, subjects: { phonetic: "/ˈsʌbdʒɪkts/", meaning: "主题；科目" }, focus: { phonetic: "/ˈfoʊkəs/", meaning: "专注；焦点" }, mostly: { phonetic: "/ˈmoʊstli/", meaning: "主要地" }, street: { phonetic: "/striːt/", meaning: "街道" }, architecture: { phonetic: "/ˈɑːrkɪtektʃər/", meaning: "建筑；建筑学" }, city: { phonetic: "/ˈsɪti/", meaning: "城市" }, urban: { phonetic: "/ˈɜːrbən/", meaning: "城市的" }, life: { phonetic: "/laɪf/", meaning: "生活；生命" }, requires: { phonetic: "/rɪˈkwaɪərz/", meaning: "需要" }, timing: { phonetic: "/ˈtaɪmɪŋ/", meaning: "时机" }, patience: { phonetic: "/ˈpeɪʃəns/", meaning: "耐心" }, details: { phonetic: "/ˈdiːteɪlz/", meaning: "细节" }, considered: { phonetic: "/kənˈsɪdərd/", meaning: "考虑过" }, exhibiting: { phonetic: "/ɪɡˈzɪbɪtɪŋ/", meaning: "展出" }, gallery: { phonetic: "/ˈɡæləri/", meaning: "画廊" }, portfolio: { phonetic: "/pɔːrtˈfoʊlioʊ/", meaning: "作品集" }, perspective: { phonetic: "/pərˈspektɪv/", meaning: "视角；观点" }, encouragement: { phonetic: "/ɪnˈkɜːrɪdʒmənt/", meaning: "鼓励" }, appreciate: { phonetic: "/əˈpriːʃieɪt/", meaning: "感激；欣赏" }, travel: { phonetic: "/ˈtrævəl/", meaning: "旅行" }, account: { phonetic: "/əˈkaʊnt/", meaning: "账户" }, doctor: { phonetic: "/ˈdɑːktər/", meaning: "医生" }, school: { phonetic: "/skuːl/", meaning: "学校" }, welcome: { phonetic: "/ˈwelkəm/", meaning: "欢迎" }, good: { phonetic: "/ɡʊd/", meaning: "好的" }, morning: { phonetic: "/ˈmɔːrnɪŋ/", meaning: "早上" }, please: { phonetic: "/pliːz/", meaning: "请" }, thank: { phonetic: "/θæŋk/", meaning: "感谢" }, water: { phonetic: "/ˈwɔːtər/", meaning: "水" }, station: { phonetic: "/ˈsteɪʃən/", meaning: "车站" }, hotel: { phonetic: "/hoʊˈtel/", meaning: "酒店" }, meeting: { phonetic: "/ˈmiːtɪŋ/", meaning: "会议" }, payment: { phonetic: "/ˈpeɪmənt/", meaning: "付款" }, appointment: { phonetic: "/əˈpɔɪntmənt/", meaning: "预约" }, package: { phonetic: "/ˈpækɪdʒ/", meaning: "包裹" }, teacher: { phonetic: "/ˈtiːtʃər/", meaning: "老师" }
};
export function getWordDefinition(word: string): WordDefinition { const clean = cleanLookupWord(word); return WORDS[clean] ?? { phonetic: "", meaning: "正在查询中文释义…" }; }


export function cleanLookupWord(word: string) { return word.toLowerCase().replace(/[^a-z'-]/g, ""); }
const remoteCache = new Map<string, WordDefinition>();

export async function lookupWordDefinition(word: string): Promise<WordDefinition> {
  const clean = cleanLookupWord(word);
  const local = getWordDefinition(clean);
  if (!clean) return local;
  const cached = remoteCache.get(clean);
  if (cached) return cached;
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`);
    if (!response.ok) return local;
    const payload = await response.json() as Array<{ phonetic?: string; phonetics?: Array<{ text?: string }>; meanings?: Array<{ definitions?: Array<{ definition?: string }> }> }>;
    const entry = payload[0];
    const phonetic = entry?.phonetic ?? entry?.phonetics?.find((item) => item.text)?.text ?? local.phonetic;
    const englishMeaning = entry?.meanings?.flatMap((meaning) => meaning.definitions ?? []).map((item) => item.definition).find(Boolean);
    if (!englishMeaning) return { phonetic, meaning: local.meaning };
    try {
      const translationResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishMeaning)}&langpair=en|zh-CN`);
      const translationPayload = await translationResponse.json() as { responseData?: { translatedText?: string } };
      const result = { phonetic, meaning: translationPayload.responseData?.translatedText?.trim() || local.meaning };
      remoteCache.set(clean, result);
      return result;
    } catch {
      return { phonetic, meaning: local.meaning };
    }
  } catch {
    return local;
  }
}
