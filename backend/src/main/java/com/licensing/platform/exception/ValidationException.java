package com.licensing.platform.exception;

import java.util.Collections;
import java.util.Map;

public class ValidationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public ValidationException(String message) {
        super(message);
        this.fieldErrors = Collections.emptyMap();
    }

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors != null ? fieldErrors : Collections.emptyMap();
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
