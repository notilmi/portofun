export type QuizOption = {
  key: string;
  text: string;
};

export function parseQuizAnswer(answer: string): QuizOption[] {
  const trimmed = answer.trim();
  if (!trimmed) return [];

  const parts = trimmed.split("|").map((p) => p.trim());
  if (parts.length < 4) return [];
  if (parts.length % 2 !== 0) return [];

  const options: QuizOption[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i];
    const text = parts[i + 1];
    if (!key || !text) return [];
    options.push({ key, text });
  }

  return options;
}
