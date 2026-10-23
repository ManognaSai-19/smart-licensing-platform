package com.licensing.platform.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class CreateApplicationRequest {

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    private String languagePreference = "en";

    private Map<String, Object> initialFormData;

    public CreateApplicationRequest() {
    }

    public CreateApplicationRequest(Long serviceId, String languagePreference, Map<String, Object> initialFormData) {
        this.serviceId = serviceId;
        this.languagePreference = languagePreference != null ? languagePreference : "en";
        this.initialFormData = initialFormData;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getLanguagePreference() {
        return languagePreference;
    }

    public void setLanguagePreference(String languagePreference) {
        this.languagePreference = languagePreference;
    }

    public Map<String, Object> getInitialFormData() {
        return initialFormData;
    }

    public void setInitialFormData(Map<String, Object> initialFormData) {
        this.initialFormData = initialFormData;
    }
}
