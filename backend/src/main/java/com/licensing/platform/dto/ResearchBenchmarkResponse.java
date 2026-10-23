package com.licensing.platform.dto;

import java.time.Instant;
import java.util.List;

public record ResearchBenchmarkResponse(
        String researchQuestion,
        String hypothesis,
        Instant evaluationTimestamp,
        int totalDatasetSamples,
        MethodBenchmarkMetrics baselineMetrics,
        MethodBenchmarkMetrics proposedMetrics,
        List<CohortPerformance> cohortBreakdown,
        List<String> scientificFindings,
        String voiceGuidanceEvaluationDisclaimer
) {
    public record MethodBenchmarkMetrics(
            String methodName,
            String algorithmDescription,
            int totalEvaluated,
            int truePositives,
            int falsePositives,
            int trueNegatives,
            int falseNegatives,
            double precision,
            double recall,
            double f1Score,
            double extractionAccuracy,
            double falseRejectionRate,
            double manualReviewRoutingRate,
            double averageLatencyMs
    ) {}

    public record CohortPerformance(
            String cohortCode,
            String cohortName,
            String profileDescription,
            int sampleCount,
            int baselineRejections,
            int proposedCleanPasses,
            int proposedExplainableWarnings,
            int proposedManualReviewRoutes,
            String primaryOutcomeDelta
    ) {}
}
