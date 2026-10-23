package com.licensing.platform.dto;

import com.licensing.platform.model.enums.DecisionType;
import java.time.Instant;

public class ReviewDecisionResponse {

    private Long id;
    private Long officerId;
    private String officerName;
    private DecisionType decision;
    private String rejectionReason;
    private String internalNotes;
    private Instant decidedAt;

    public ReviewDecisionResponse() {
    }

    public ReviewDecisionResponse(Long id, Long officerId, String officerName,
                                  DecisionType decision, String rejectionReason,
                                  String internalNotes, Instant decidedAt) {
        this.id = id;
        this.officerId = officerId;
        this.officerName = officerName;
        this.decision = decision;
        this.rejectionReason = rejectionReason;
        this.internalNotes = internalNotes;
        this.decidedAt = decidedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOfficerId() {
        return officerId;
    }

    public void setOfficerId(Long officerId) {
        this.officerId = officerId;
    }

    public String getOfficerName() {
        return officerName;
    }

    public void setOfficerName(String officerName) {
        this.officerName = officerName;
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

    public Instant getDecidedAt() {
        return decidedAt;
    }

    public void setDecidedAt(Instant decidedAt) {
        this.decidedAt = decidedAt;
    }
}
