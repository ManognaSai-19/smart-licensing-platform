package com.licensing.platform.dto;

import java.util.Map;

public class VoiceStatsResponse {

    private long totalInteractions;
    private long confirmedInteractions;
    private double confirmationRate;
    private Double averageConfidence;
    private Double averageCorrectionCount;
    private Map<String, Long> languageBreakdown;
    private Map<String, Long> inputModeBreakdown;

    public VoiceStatsResponse() {
    }

    public VoiceStatsResponse(long totalInteractions, long confirmedInteractions, double confirmationRate,
                              Double averageConfidence, Double averageCorrectionCount,
                              Map<String, Long> languageBreakdown, Map<String, Long> inputModeBreakdown) {
        this.totalInteractions = totalInteractions;
        this.confirmedInteractions = confirmedInteractions;
        this.confirmationRate = confirmationRate;
        this.averageConfidence = averageConfidence;
        this.averageCorrectionCount = averageCorrectionCount;
        this.languageBreakdown = languageBreakdown;
        this.inputModeBreakdown = inputModeBreakdown;
    }

    public long getTotalInteractions() {
        return totalInteractions;
    }

    public void setTotalInteractions(long totalInteractions) {
        this.totalInteractions = totalInteractions;
    }

    public long getConfirmedInteractions() {
        return confirmedInteractions;
    }

    public void setConfirmedInteractions(long confirmedInteractions) {
        this.confirmedInteractions = confirmedInteractions;
    }

    public double getConfirmationRate() {
        return confirmationRate;
    }

    public void setConfirmationRate(double confirmationRate) {
        this.confirmationRate = confirmationRate;
    }

    public Double getAverageConfidence() {
        return averageConfidence;
    }

    public void setAverageConfidence(Double averageConfidence) {
        this.averageConfidence = averageConfidence;
    }

    public Double getAverageCorrectionCount() {
        return averageCorrectionCount;
    }

    public void setAverageCorrectionCount(Double averageCorrectionCount) {
        this.averageCorrectionCount = averageCorrectionCount;
    }

    public Map<String, Long> getLanguageBreakdown() {
        return languageBreakdown;
    }

    public void setLanguageBreakdown(Map<String, Long> languageBreakdown) {
        this.languageBreakdown = languageBreakdown;
    }

    public Map<String, Long> getInputModeBreakdown() {
        return inputModeBreakdown;
    }

    public void setInputModeBreakdown(Map<String, Long> inputModeBreakdown) {
        this.inputModeBreakdown = inputModeBreakdown;
    }
}
