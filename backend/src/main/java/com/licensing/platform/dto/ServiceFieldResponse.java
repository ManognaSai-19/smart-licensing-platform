package com.licensing.platform.dto;

import com.licensing.platform.model.enums.FieldDataType;

public class ServiceFieldResponse {

    private Long id;
    private String fieldKey;
    private String labelEn;
    private String labelTe;
    private FieldDataType dataType;
    private boolean required;
    private String validationRules;
    private String optionsJson;
    private Integer displayOrder;

    public ServiceFieldResponse() {
    }

    public ServiceFieldResponse(Long id, String fieldKey, String labelEn, String labelTe,
                                FieldDataType dataType, boolean required, String validationRules,
                                String optionsJson, Integer displayOrder) {
        this.id = id;
        this.fieldKey = fieldKey;
        this.labelEn = labelEn;
        this.labelTe = labelTe;
        this.dataType = dataType;
        this.required = required;
        this.validationRules = validationRules;
        this.optionsJson = optionsJson;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
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
