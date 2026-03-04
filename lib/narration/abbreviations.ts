const ABBREVIATION_MAP: Record<string, string> = {
  AITA: "Am I the asshole",
  NTA: "Not the asshole",
  YTA: "You're the asshole",
  TIFU: "Today I fucked up",
  MIL: "mother-in-law",
  SIL: "sister-in-law",
  FIL: "father-in-law",
  BIL: "brother-in-law",
  SO: "significant other",
};

export function expandAbbreviations(text: string): string {
  let result = text;
  for (const [abbr, expansion] of Object.entries(ABBREVIATION_MAP)) {
    result = result.replace(new RegExp(`\\b${abbr}\\b`, "g"), expansion);
  }
  return result;
}
