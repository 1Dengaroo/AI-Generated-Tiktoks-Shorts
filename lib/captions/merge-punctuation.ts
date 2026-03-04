/**
 * Whisper returns words without punctuation. The full transcription text
 * *does* include punctuation. This function walks both in parallel and
 * appends trailing punctuation from the full text onto each word.
 */
export function mergeWordsWithPunctuation(
  words: { word: string; start: number; end: number }[],
  fullText: string,
): { word: string; start: number; end: number }[] {
  let cursor = 0;
  return words.map((w) => {
    // Find this word in the full text starting from cursor
    const cleanWord = w.word.replace(/[^\w']/g, "").toLowerCase();
    const idx = fullText.toLowerCase().indexOf(cleanWord, cursor);
    if (idx === -1) return w;

    const afterWord = idx + cleanWord.length;
    cursor = afterWord;

    // Grab any trailing punctuation (.,!?;:—)
    let trailing = "";
    let pos = afterWord;
    while (
      pos < fullText.length &&
      /[.,!?;:\u2014\u2013\-\u2026)"]/.test(fullText[pos])
    ) {
      trailing += fullText[pos];
      pos++;
    }
    cursor = pos;

    return {
      ...w,
      word: trailing ? w.word + trailing : w.word,
    };
  });
}
