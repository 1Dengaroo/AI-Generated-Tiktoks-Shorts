import { mergeWordsWithPunctuation } from "@/lib/captions/merge-punctuation";

describe("mergeWordsWithPunctuation", () => {
  it("appends trailing punctuation to words", () => {
    const words = [
      { word: "Hello", start: 0, end: 0.5 },
      { word: "world", start: 0.5, end: 1.0 },
    ];
    const result = mergeWordsWithPunctuation(words, "Hello, world!");
    expect(result[0].word).toBe("Hello,");
    expect(result[1].word).toBe("world!");
  });

  it("leaves words unchanged when no punctuation follows", () => {
    const words = [
      { word: "No", start: 0, end: 0.3 },
      { word: "punctuation", start: 0.3, end: 1.0 },
    ];
    const result = mergeWordsWithPunctuation(words, "No punctuation");
    expect(result[0].word).toBe("No");
    expect(result[1].word).toBe("punctuation");
  });

  it("handles multiple punctuation characters", () => {
    const words = [{ word: "Really", start: 0, end: 0.5 }];
    const result = mergeWordsWithPunctuation(words, "Really?!");
    expect(result[0].word).toBe("Really?!");
  });

  it("preserves timing data", () => {
    const words = [{ word: "test", start: 1.5, end: 2.0 }];
    const result = mergeWordsWithPunctuation(words, "test.");
    expect(result[0].start).toBe(1.5);
    expect(result[0].end).toBe(2.0);
  });
});
