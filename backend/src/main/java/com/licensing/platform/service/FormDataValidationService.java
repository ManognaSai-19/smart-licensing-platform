package com.licensing.platform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.exception.ValidationException;
import com.licensing.platform.model.ServiceField;
import com.licensing.platform.model.enums.FieldDataType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class FormDataValidationService {

    private static final Logger log = LoggerFactory.getLogger(FormDataValidationService.class);
    private final ObjectMapper objectMapper;

    public FormDataValidationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Validates form data against dynamic service field definitions.
     * Throws ValidationException with all field-level errors if validation fails.
     */
    public void validateFormData(Map<String, Object> formData, List<ServiceField> fields) {
        Map<String, String> errors = new LinkedHashMap<>();
        Map<String, Object> data = formData != null ? formData : Collections.emptyMap();

        for (ServiceField field : fields) {
            String key = field.getFieldKey();
            Object rawValue = data.get(key);

            // 1. Required Check
            if (field.isRequired()) {
                if (rawValue == null || (rawValue instanceof String str && str.trim().isEmpty())) {
                    errors.put(key, field.getLabelEn() + " is required");
                    continue;
                }
            }

            // If empty and not required, skip type & rule checks
            if (rawValue == null || (rawValue instanceof String str && str.trim().isEmpty())) {
                continue;
            }

            String stringValue = rawValue.toString().trim();

            // 2. Data Type Checks
            Double numericValue = null;
            LocalDate dateValue = null;

            if (field.getDataType() == FieldDataType.NUMBER) {
                try {
                    numericValue = Double.parseDouble(stringValue);
                } catch (NumberFormatException e) {
                    errors.put(key, field.getLabelEn() + " must be a valid number");
                    continue;
                }
            } else if (field.getDataType() == FieldDataType.DATE) {
                try {
                    dateValue = LocalDate.parse(stringValue);
                } catch (DateTimeParseException e) {
                    errors.put(key, field.getLabelEn() + " must be a valid date in YYYY-MM-DD format");
                    continue;
                }
            } else if (field.getDataType() == FieldDataType.SELECT) {
                if (field.getOptionsJson() != null && !field.getOptionsJson().trim().isEmpty()) {
                    try {
                        List<String> allowedOptions = objectMapper.readValue(field.getOptionsJson(), new TypeReference<List<String>>() {});
                        if (!allowedOptions.contains(stringValue)) {
                            errors.put(key, field.getLabelEn() + " must be one of the allowed options: " + allowedOptions);
                            continue;
                        }
                    } catch (Exception e) {
                        log.warn("Failed to parse optionsJson for field '{}': {}", key, e.getMessage());
                    }
                }
            }

            // 3. Validation Rules (JSON Object)
            if (field.getValidationRules() != null && !field.getValidationRules().trim().isEmpty()) {
                try {
                    JsonNode rules = objectMapper.readTree(field.getValidationRules());

                    if (rules.has("minLength") && stringValue.length() < rules.get("minLength").asInt()) {
                        errors.put(key, field.getLabelEn() + " must be at least " + rules.get("minLength").asInt() + " characters");
                    }

                    if (rules.has("maxLength") && stringValue.length() > rules.get("maxLength").asInt()) {
                        errors.put(key, field.getLabelEn() + " must not exceed " + rules.get("maxLength").asInt() + " characters");
                    }

                    if (rules.has("min") && numericValue != null && numericValue < rules.get("min").asDouble()) {
                        errors.put(key, field.getLabelEn() + " must be at least " + rules.get("min").asText());
                    }

                    if (rules.has("max") && numericValue != null && numericValue > rules.get("max").asDouble()) {
                        errors.put(key, field.getLabelEn() + " must not exceed " + rules.get("max").asText());
                    }

                    if (rules.has("regex")) {
                        String regex = rules.get("regex").asText();
                        if (!stringValue.matches(regex)) {
                            String formatDesc = rules.has("formatDesc") ? " (" + rules.get("formatDesc").asText() + ")" : "";
                            errors.put(key, field.getLabelEn() + " format is invalid" + formatDesc);
                        }
                    }

                    if (rules.has("minAgeYears") && dateValue != null) {
                        int minAge = rules.get("minAgeYears").asInt();
                        int age = Period.between(dateValue, LocalDate.now()).getYears();
                        if (age < minAge) {
                            errors.put(key, field.getLabelEn() + " indicates age " + age + ", but minimum required age is " + minAge + " years");
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to evaluate validationRules for field '{}': {}", key, e.getMessage());
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(
                    "Application submission failed validation checks on " + errors.size() + " field(s)",
                    errors
            );
        }
    }
}
