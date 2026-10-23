package com.licensing.platform.dto;

import java.time.Instant;

public class ApplicationStatusHistoryResponse {

    private Long id;
    private String fromStatus;
    private String toStatus;
    private Long changedByUserId;
    private String changedByUserName;
    private String notes;
    private Instant createdAt;

    public ApplicationStatusHistoryResponse() {
    }

    public ApplicationStatusHistoryResponse(Long id, String fromStatus, String toStatus,
                                            Long changedByUserId, String changedByUserName,
                                            String notes, Instant createdAt) {
        this.id = id;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedByUserId = changedByUserId;
        this.changedByUserName = changedByUserName;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(String fromStatus) {
        this.fromStatus = fromStatus;
    }

    public String getToStatus() {
        return toStatus;
    }

    public void setToStatus(String toStatus) {
        this.toStatus = toStatus;
    }

    public Long getChangedByUserId() {
        return changedByUserId;
    }

    public void setChangedByUserId(Long changedByUserId) {
        this.changedByUserId = changedByUserId;
    }

    public String getChangedByUserName() {
        return changedByUserName;
    }

    public void setChangedByUserName(String changedByUserName) {
        this.changedByUserName = changedByUserName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
