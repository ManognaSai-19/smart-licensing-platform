import { ResearchBenchmarkResponse } from '../types/research';

export async function fetchResearchBenchmark(): Promise<ResearchBenchmarkResponse> {
  const response = await fetch('/api/research/benchmark', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to execute research benchmark: ${response.statusText}`);
  }

  return response.json();
}
