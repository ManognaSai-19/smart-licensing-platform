package com.licensing.platform.dto;

import java.util.Map;

public class SubmitApplicationRequest {

    private Map<String, Object> formData;

    public SubmitApplicationRequest() {
    }

    public SubmitApplicationRequest(Map<String, Object> formData) {
        this.formData = formData;
    }

    public Map<String, Object> getFormData() {
        return formData;
    }

    public void setFormData(Map<String, Object> formData) {
        this.formData = formData;
    }
}
