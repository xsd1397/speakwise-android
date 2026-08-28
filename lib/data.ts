export type LevelKey = "beginner" | "intermediate" | "advanced";

export type Speaker = "Alex" | "Mia";

export type PracticeLine = {
  id: string;
  speaker: Speaker;
  text: string;
};

export type ListeningLine = PracticeLine & {
  translation: string;
  note: string;
};

export const LEVELS: Array<{ key: LevelKey; title: string; subtitle: string }> = [
  { key: "beginner", title: "初级", subtitle: "Beginner" },
  { key: "intermediate", title: "中级", subtitle: "Intermediate" },
  { key: "advanced", title: "高级", subtitle: "Advanced" },
];

export const SCENES = [
  { key: "greetings", title: "日常问候", subtitle: "打招呼与寒暄" },
  { key: "travel", title: "旅游出行", subtitle: "机场、酒店与问路" },
  { key: "business", title: "商务交流", subtitle: "会议、协作与表达" },
  { key: "housing", title: "租房居住", subtitle: "看房、签租约与报修" },
  { key: "medical", title: "就医看诊", subtitle: "预约、看病与买药" },
  { key: "banking", title: "银行开户", subtitle: "开户、存取与转账" },
  { key: "shopping", title: "购物用餐", subtitle: "超市、点餐与退换" },
  { key: "transit", title: "交通通勤", subtitle: "公交、地铁与驾照" },
  { key: "government", title: "政务办理", subtitle: "证件、邮局与税务" },
  { key: "school", title: "学校沟通", subtitle: "入学、家校与请假" },
] as const;

export type SceneKey = (typeof SCENES)[number]["key"];

export const PRACTICE_DIALOGUE: PracticeLine[] = [
  { id: "alex-1", speaker: "Alex", text: "Hi, I'm Alex. Nice to meet you." },
  { id: "mia-1", speaker: "Mia", text: "Nice to meet you too. How are you today?" },
  { id: "alex-2", speaker: "Alex", text: "I'm good, thank you. How about you?" },
  { id: "mia-2", speaker: "Mia", text: "I'm doing great. Are you new to this neighborhood?" },
  { id: "alex-3", speaker: "Alex", text: "Yes, I just moved in last weekend." },
  { id: "mia-3", speaker: "Mia", text: "That's wonderful. Welcome to the community." },
  { id: "alex-4", speaker: "Alex", text: "Thank you so much. Do you live around here?" },
  { id: "mia-4", speaker: "Mia", text: "Yes, just down the street. Let me know if you need any recommendations." },
  { id: "alex-5", speaker: "Alex", text: "I definitely will. Thanks for being so kind." },
  { id: "mia-5", speaker: "Mia", text: "You're very welcome. Have a wonderful day!" },
];

const greetingPairs: Array<[Speaker, string, string, string]> = [
  ["Alex", "Good morning! Did you sleep well last night?", "早上好！昨晚睡得好吗？", "用 sleep well 询问睡眠质量。"],
  ["Mia", "Morning, Alex! Yes, I did, though I stayed up a bit late reading.", "早啊，亚历克斯！是的，不过我读书稍微熬夜了一会儿。", "用 stayed up a bit late 表达熬夜。"],
  ["Alex", "What kind of book were you reading? Anything interesting?", "你在读什么书？有什么有意思的内容吗？", "用 What kind of book 开启共同话题。"],
  ["Mia", "It's a novel about modern art history. Quite fascinating actually.", "是一本关于现代艺术史的小说。其实挺引人入胜的。", "用 Quite fascinating 增强赞叹语气。"],
  ["Alex", "I've always found art history inspiring. Do you visit galleries often?", "我一直觉得艺术史很启发灵感。你经常去画廊吗？", "用 inspiring 表达受到启发。"],
  ["Mia", "Whenever I have a free weekend, I try to check out a new exhibition.", "每逢周末有空，我都尽量看看新的展览。", "用 Whenever 表示每当。"],
  ["Alex", "That sounds like a wonderful habit. Are you heading to work now?", "听起来是个很棒的习惯。你现在正要去上班吗？", "用 By the way 自然转换话题。"],
  ["Mia", "Yes, taking the subway. It's usually quite busy at this hour.", "对，坐地铁去。这个点人通常挺多的。", "用 quite busy 形容早高峰。"],
  ["Alex", "Have you had your breakfast yet, or are you grabbing coffee on the way?", "你吃过早餐了吗，还是在路上买咖啡？", "用 grabbing coffee 表达顺便买咖啡。"],
  ["Mia", "I grabbed a quick pastry and a latte near the station.", "我在车站附近买了个糕点和拿铁。", "用 grabbed a quick 表达快捷饮食。"],
  ["Alex", "What are your main tasks scheduled for today?", "你今天安排的主要工作任务是什么？", "用 scheduled for today 询问日程。"],
  ["Mia", "I need to finalize a quarterly design report and review team feedback.", "我需要完成季度设计报告并审核团队反馈。", "用 finalize 表示最后定稿。"],
  ["Alex", "Sounds like a productive morning ahead. Good luck with that!", "听起来上午会很充实。祝你一切顺利！", "Good luck with that 是常用祝愿。"],
  ["Mia", "Thanks, Alex! What about your schedule? Working remotely today?", "谢谢！你今天在家远程办公吗？", "用 Working remotely 询问办公方式。"],
  ["Alex", "No, I'm at the office today. We have a brainstorming session this afternoon.", "不，我今天在办公室，下午有头脑风暴会。", "用 brainstorming session 表达会议。"],
  ["Mia", "Ah, team collaboration is always energetic. Hope you get great ideas.", "团队协作总是充满活力。希望你们碰撞出好点子。", "用 energetic 描述团队氛围。"],
  ["Alex", "Oh, look at the weather outside, looks like rain.", "哦，你看外面的天气，好像要下雨了。", "用 looks like rain 预测天气。"],
  ["Mia", "Good thing I packed my umbrella in the bag this morning.", "幸亏我今天早上带了雨伞。", "用 Good thing 表示幸亏。"],
  ["Alex", "That's foresight! Always be prepared for unexpected showers.", "真有远见！总得准备应对突如其来的阵雨。", "用 foresight 表示有远见。"],
  ["Mia", "Definitely. My stop is coming up soon. Have a great day!", "我的站快到了。祝你今天愉快！", "用 stop is coming up 表示即将到站。"],
  ["Alex", "You too, Mia! Enjoy your workday and stay dry.", "你也是！工作愉快，注意别淋湿了。", "用 stay dry 表达雨天问候。"],
  ["Mia", "Will do. Catch you later online or this weekend.", "好的，回头网上或者周末再联系。", "用 Will do 简洁应答。"],
  ["Alex", "Sounds like a plan. Goodbye!", "就这么定啦。再见！", "用 Sounds like a plan 表示赞同。"],
  ["Mia", "Bye-bye, Alex!", "拜拜，亚历克斯！", "日常道别。"],
  ["Alex", "Did you try that new bakery downtown yesterday?", "你昨天尝过市中心那家新面包店了吗？", "用疑问句继续闲聊。"],
  ["Mia", "Yes, I did! Their cinnamon rolls are absolute perfection.", "尝过了！他们的肉桂卷简直完美。", "用 absolute perfection 形容美味。"],
  ["Alex", "I must go there this Saturday morning then.", "那这周六早上我一定得去。", "用 I must go 表达强烈兴趣。"],
  ["Mia", "You won't regret it. Arrive early before lines form.", "你不会后悔的，记得趁早去免得排长队。", "用 You won't regret it 给出推荐保证。"],
  ["Alex", "Got it. The early bird gets the delicious pastry.", "明白了。早起的鸟儿有甜点吃。", "引用英语谚语。"],
  ["Mia", "Haha, exactly right. Enjoy your coffee!", "哈哈，完全正确。好好享用咖啡吧！", "愉快收尾。"],
  ["Alex", "Thanks again, Mia. See you around.", "再次谢谢你，米娅。回头见。", "日常寒暄。"],
  ["Mia", "Take care, Alex.", "保重，亚历克斯。", "温和回应。"],
  ["Alex", "Cheers to a lovely week ahead.", "预祝接下来一周心情美妙。", "用 Cheers to 表达祝愿。"],
  ["Mia", "Cheers! Have a wonderful day.", "干杯！祝你有美好的一天。", "回以祝福。"],
  ["Alex", "See you!", "再见！", "简短道别。"],
  ["Mia", "See you!", "再见！", "呼应告别。"],
  ["Alex", "Remember to stay hydrated today.", "今天记得多喝水补水哦。", "健康提醒。"],
  ["Mia", "I will, thanks for reminding.", "我会的，谢谢提醒。", "感谢关心。"],
  ["Alex", "No problem at all. Bye!", "不用客气。再见！", "道别收尾。"],
  ["Mia", "Goodbye!", "再见！", "最终告别。"],
];

export const LISTENING_LINES: ListeningLine[] = greetingPairs.map(([speaker, text, translation, note], index) => ({
  id: `greetings-${index + 1}`,
  speaker,
  text,
  translation,
  note,
}));

export function getLevelLabel(level: LevelKey) {
  return LEVELS.find((item) => item.key === level)?.title ?? "初级";
}

export function getSceneLabel(scene: string) {
  return SCENES.find((item) => item.key === scene)?.title ?? "日常问候";
}
