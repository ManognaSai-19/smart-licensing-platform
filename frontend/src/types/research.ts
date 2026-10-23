export interface MethodBenchmarkMetrics {
  methodName: string;
  algorithmDescription: string;
  totalEvaluated: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  extractionAccuracy: number;
  falseRejectionRate: number;
  manualReviewRoutingRate: number;
  averageLatencyMs: number;
}

export interface CohortPerformance {
  cohortCode: string;
  cohortName: string;
  profileDescription: string;
  sampleCount: number;
  baselineRejections: number;
  proposedCleanPasses: number;
  proposedExplainableWarnings: number;
  proposedManualReviewRoutes: number;
  primaryOutcomeDelta: string;
}

export interface ResearchBenchmarkResponse {
  researchQuestion: string;
  hypothesis: string;
  evaluationTimestamp: string;
  totalDatasetSamples: number;
  baselineMetrics: MethodBenchmarkMetrics;
  proposedMetrics: MethodBenchmarkMetrics;
  cohortBreakdown: CohortPerformance[];
  scientificFindings: string[];
  voiceGuidanceEvaluationDisclaimer: string;
}
