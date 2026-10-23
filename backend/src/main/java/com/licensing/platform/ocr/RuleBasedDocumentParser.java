package com.licensing.platform.ocr;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class RuleBasedDocumentParser implements OcrEngine {

    private static final Logger log = LoggerFactory.getLogger(RuleBasedDocumentParser.class);

    private static final Pattern NAME_PATTERN = Pattern.compile(
            "(?:Full\\s+Name|Name|Applicant\\s+Name|Applicant)[:\\s]+([A-Za-z\\s.]+?)(?:\\r?\\n|$|,|;)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DOB_PATTERN = Pattern.compile(
            "(?:DOB|Date\\s+of\\s+Birth|Birth\\s+Date)[:\\s]+([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}[/-][0-9]{2}[/-][0-9]{4})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern AADHAAR_PATTERN = Pattern.compile(
            "(?:Aadhaar(?:\\s+No)?|UID|ID\\s+Number)[:\\s]+([0-9]{4}\\s?[0-9]{4}\\s?[0-9]{4}|[0-9]{12})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ADDRESS_PATTERN = Pattern.compile(
            "(?:Residential\\s+Address|Address)[:\\s]+([A-Za-z0-9\\s,./#\\-]+?)(?:\\r?\\n|$|;)",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public String getName() {
        return "SmartRuleOcrEngine";
    }

    @Override
    public String getVersion() {
        return "1.2.0";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public OcrResult extract(Path filePath, String contentType, String documentCode) {
        log.info("Executing OCR extraction on document file: {}", filePath);

        String rawContent = extractTextFromFile(filePath);
        Map<String, String> extracted = new HashMap<>();

        // Extract Name
        Matcher nameMatcher = NAME_PATTERN.matcher(rawContent);
        if (nameMatcher.find()) {
            extracted.put("fullName", nameMatcher.group(1).trim());
        }

        // Extract DOB
        Matcher dobMatcher = DOB_PATTERN.matcher(rawContent);
        if (dobMatcher.find()) {
            extracted.put("dateOfBirth", dobMatcher.group(1).trim());
        }

        // Extract Aadhaar
        Matcher idMatcher = AADHAAR_PATTERN.matcher(rawContent);
        if (idMatcher.find()) {
            String rawId = idMatcher.group(1).replaceAll("\\s+", "");
            extracted.put("aadhaarNumber", rawId);
        }

        // Extract Address
        Matcher addrMatcher = ADDRESS_PATTERN.matcher(rawContent);
        if (addrMatcher.find()) {
            extracted.put("residentialAddress", addrMatcher.group(1).trim());
        }

        // Check for intentional uncertainty / low quality flags
        BigDecimal confidence;
        if (rawContent.contains("[LOW_QUALITY]") || rawContent.contains("[DEGRADED_SCAN]") || rawContent.contains("[FAINT_PRINT]")) {
            confidence = new BigDecimal("0.4500"); // Low confidence
        } else if (!extracted.isEmpty()) {
            confidence = new BigDecimal("0.9650"); // High confidence
        } else {
            confidence = new BigDecimal("0.7500"); // Baseline moderate
        }

        return new OcrResult(
                getName(),
                getVersion(),
                rawContent,
                extracted,
                confidence,
                "COMPLETED"
        );
    }

    private String extractTextFromFile(Path filePath) {
        try {
            byte[] bytes = Files.readAllBytes(filePath);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to read document bytes for OCR extraction: {}", filePath, e);
            return "";
        }
    }
}
