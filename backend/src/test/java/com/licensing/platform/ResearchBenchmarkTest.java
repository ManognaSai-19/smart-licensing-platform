package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.ResearchBenchmarkResponse;
import com.licensing.platform.service.ResearchEvaluationBenchmarkService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ResearchBenchmarkTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ResearchEvaluationBenchmarkService benchmarkService;

    @Test
    @DisplayName("Research Benchmark: Dataset generates exactly 60 labeled samples across 5 distinct cohorts")
    void testBenchmarkDatasetGeneration() {
        var dataset = benchmarkService.generateSyntheticBenchmarkDataset();
        assertThat(dataset).hasSize(60);

        long cohortA = dataset.stream().filter(s -> s.cohortCode().equals("COHORT_A")).count();
        long cohortB = dataset.stream().filter(s -> s.cohortCode().equals("COHORT_B")).count();
        long cohortC = dataset.stream().filter(s -> s.cohortCode().equals("COHORT_C")).count();
        long cohortD = dataset.stream().filter(s -> s.cohortCode().equals("COHORT_D")).count();
        long cohortE = dataset.stream().filter(s -> s.cohortCode().equals("COHORT_E")).count();

        assertThat(cohortA).isEqualTo(12);
        assertThat(cohortB).isEqualTo(12);
        assertThat(cohortC).isEqualTo(12);
        assertThat(cohortD).isEqualTo(12);
        assertThat(cohortE).isEqualTo(12);
    }

    @Test
    @DisplayName("Research Benchmark: Proposed method eliminates false rejections compared to rigid baseline")
    void testComparativeEvaluationMetrics() {
        ResearchBenchmarkResponse response = benchmarkService.runBenchmarkEvaluation();

        assertThat(response.totalDatasetSamples()).isEqualTo(60);

        // Baseline metrics verification
        var baseline = response.baselineMetrics();
        assertThat(baseline.totalEvaluated()).isEqualTo(60);
        // Baseline rejects Cohort C (12) and Cohort E (12) = 24 false positives
        assertThat(baseline.falsePositives()).isEqualTo(24);
        assertThat(baseline.falseRejectionRate()).isGreaterThan(0.50); // ~66.7% FRR

        // Proposed metrics verification
        var proposed = response.proposedMetrics();
        assertThat(proposed.totalEvaluated()).isEqualTo(60);
        assertThat(proposed.falsePositives()).isZero();
        assertThat(proposed.falseRejectionRate()).isZero(); // 0.0% FRR
        assertThat(proposed.f1Score()).isGreaterThan(baseline.f1Score());
        assertThat(proposed.manualReviewRoutingRate()).isGreaterThan(0.15); // Routes Cohort E safely

        // Verify Cohort E is routed to human review, not rejected
        var cohortE = response.cohortBreakdown().stream()
                .filter(c -> c.cohortCode().equals("COHORT_E"))
                .findFirst()
                .orElseThrow();
        assertThat(cohortE.proposedManualReviewRoutes()).isEqualTo(12);
        assertThat(cohortE.baselineRejections()).isEqualTo(12);
    }

    @Test
    @DisplayName("Research Benchmark: REST API endpoint returns 200 OK and complete research payload")
    void testBenchmarkRestEndpoint() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/research/benchmark"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.researchQuestion", notNullValue()))
                .andExpect(jsonPath("$.totalDatasetSamples", is(60)))
                .andExpect(jsonPath("$.baselineMetrics.f1Score", notNullValue()))
                .andExpect(jsonPath("$.proposedMetrics.f1Score", notNullValue()))
                .andExpect(jsonPath("$.cohortBreakdown", hasSize(5)))
                .andExpect(jsonPath("$.scientificFindings", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.voiceGuidanceEvaluationDisclaimer", containsString("academic integrity")))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        ResearchBenchmarkResponse response = objectMapper.readValue(json, ResearchBenchmarkResponse.class);
        assertThat(response.baselineMetrics().falseRejectionRate()).isGreaterThan(response.proposedMetrics().falseRejectionRate());
    }
}
