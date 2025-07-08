import Papa from 'papaparse';

export interface Prompt {
  role: string;
  title: string;
  prompt: string;
}

export async function fetchPrompts(): Promise<Prompt[]> {
  const res = await fetch('/prompts.csv');
  const csvText = await res.text();
  const { data } = Papa.parse<Prompt>(csvText, { header: true, skipEmptyLines: true });
  return data as Prompt[];
} 