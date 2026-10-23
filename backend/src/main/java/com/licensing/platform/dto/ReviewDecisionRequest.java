package com.licensing.platform.dto;

import com.licensing.platform.model.enums.DecisionType;
import jakarta.validation.constraints.NotNull;

public class ReviewDecisionRequest {

    @NotNull(message = "Decision (APPROVED or REJECTED) is required")
    private DecisionType decision;

    private String rejectionReason;

    private String internalNotes;

    public ReviewDecisionRequest() {
    }

    public ReviewDecisionRequest(DecisionType decision, String rejectionReason, String internalNotes) {
        this.decision = decision;
        this.rejectionReason = rejectionReason;
        this.internalNotes = internalNotes;
    }

    public DecisionType getDecision() {
        return decision;
    }

    public void setDecision(DecisionType decision) {
        this.decision = decision;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getInternalNotes() {
        return internalNotes;
    }

    public void setInternalNotes(String internalNotes) {
        this.internalNotes = internalNotes;
    }
}
