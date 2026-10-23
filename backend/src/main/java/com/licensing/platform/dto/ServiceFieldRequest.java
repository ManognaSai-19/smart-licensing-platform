package com.licensing.platform.dto;

import com.licensing.platform.model.enums.FieldDataType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ServiceFieldRequest {

    @NotBlank(message = "Field key is required")
    @Size(min = 1, max = 100, message = "Field key must be between 1 and 100 characters")
    private String fieldKey;

    @NotBlank(message = "English label is required")
    private String labelEn;

    private String labelTe;

    @NotNull(message = "Data type is required")
    private FieldDataType dataType;

    private Boolean required = true;

    private String validationRules;

    private String optionsJson;

    private Integer displayOrder = 0;

    public ServiceFieldRequest() {
    }

    public ServiceFieldRequest(String fieldKey, String labelEn, String labelTe,
                               FieldDataType dataType, Boolean required,
                               String validationRules, String optionsJson, Integer displayOrder) {
        this.fieldKey = fieldKey;
        this.labelEn = labelEn;
        this.labelTe = labelTe;
        this.dataType = dataType;
        this.required = required != null ? required : true;
        this.validationRules = validationRules;
        this.optionsJson = optionsJson;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public void setLabelEn(String labelEn) {
        this.labelEn = labelEn;
    }

    public String getLabelTe() {
        return labelTe;
    }

    public void setLabelTe(String labelTe) {
        this.labelTe = labelTe;
    }

    public FieldDataType getDataType() {
        return dataType;
    }

    public void setDataType(FieldDataType dataType) {
        this.dataType = dataType;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public String getValidationRules() {
        return validationRules;
    }

    public void setValidationRules(String validationRules) {
        this.validationRules = validationRules;
    }

    public String getOptionsJson() {
        return optionsJson;
    }

    public void setOptionsJson(String optionsJson) {
        this.optionsJson = optionsJson;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
