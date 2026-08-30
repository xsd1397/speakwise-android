import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getWordDefinition, type WordDefinition } from "@/lib/word";

export type SavedWord = WordDefinition & { word: string; example: string; scene: string };
type WordbookContextValue = { words: SavedWord[]; toggleWord: (word: string, example: string, scene: string) => void; hasWord: (word: string) => boolean };
const WordbookContext = createContext<WordbookContextValue | null>(null);

export function WordbookProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<SavedWord[]>([]);
  const toggleWord = (word: string, example: string, scene: string) => {
    const key = word.toLowerCase().replace(/[^a-z'-]/g, "");
    if (!key) return;
    const savedExample = example.trim() || `The word “${word}” appears in this ${scene} scene.`;
    setWords((current) => current.some((item) => item.word === key)
      ? current.filter((item) => item.word !== key)
      : [...current, { word: key, ...getWordDefinition(word), example: savedExample, scene }]);
  };
  const value = useMemo(() => ({ words, toggleWord, hasWord: (word: string) => words.some((item) => item.word === word.toLowerCase().replace(/[^a-z'-]/g, "")) }), [words]);
  return <WordbookContext.Provider value={value}>{children}</WordbookContext.Provider>;
}

const EMPTY_WORDBOOK: WordbookContextValue = { words: [], toggleWord: () => undefined, hasWord: () => false };
export function useWordbook() { return useContext(WordbookContext) ?? EMPTY_WORDBOOK; }
