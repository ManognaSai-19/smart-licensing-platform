package com.licensing.platform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.*;
import com.licensing.platform.exception.ResourceNotFoundException;
import com.licensing.platform.model.ServiceDefinition;
import com.licensing.platform.model.ServiceField;
import com.licensing.platform.model.VoiceInteractionLog;
import com.licensing.platform.repository.ServiceDefinitionRepository;
import com.licensing.platform.repository.ServiceFieldRepository;
import com.licensing.platform.repository.VoiceInteractionLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VoiceGuidanceService {

    private static final Logger log = LoggerFactory.getLogger(VoiceGuidanceService.class);

    private final ServiceDefinitionRepository serviceRepository;
    private final ServiceFieldRepository serviceFieldRepository;
    private final VoiceInteractionLogRepository voiceLogRepository;
    private final ObjectMapper objectMapper;

    // English Month map
    private static final Map<String, Integer> ENGLISH_MONTHS = new LinkedHashMap<>();
    // Telugu Month map
    private static final Map<String, Integer> TELUGU_MONTHS = new LinkedHashMap<>();
    // Spoken digit words
    private static final Map<String, String> WORD_TO_DIGIT = new LinkedHashMap<>();

    static {
        // English months
        ENGLISH_MONTHS.put("january", 1);
        ENGLISH_MONTHS.put("jan", 1);
        ENGLISH_MONTHS.put("february", 2);
        ENGLISH_MONTHS.put("feb", 2);
        ENGLISH_MONTHS.put("march", 3);
        ENGLISH_MONTHS.put("mar", 3);
        ENGLISH_MONTHS.put("april", 4);
        ENGLISH_MONTHS.put("apr", 4);
        ENGLISH_MONTHS.put("may", 5);
        ENGLISH_MONTHS.put("june", 6);
        ENGLISH_MONTHS.put("jun", 6);
        ENGLISH_MONTHS.put("july", 7);
        ENGLISH_MONTHS.put("jul", 7);
        ENGLISH_MONTHS.put("august", 8);
        ENGLISH_MONTHS.put("aug", 8);
        ENGLISH_MONTHS.put("september", 9);
        ENGLISH_MONTHS.put("sep", 9);
        ENGLISH_MONTHS.put("sept", 9);
        ENGLISH_MONTHS.put("october", 10);
        ENGLISH_MONTHS.put("oct", 10);
        ENGLISH_MONTHS.put("november", 11);
        ENGLISH_MONTHS.put("nov", 11);
        ENGLISH_MONTHS.put("december", 12);
        ENGLISH_MONTHS.put("dec", 12);

        // Telugu months
        TELUGU_MONTHS.put("జనవరి", 1);
        TELUGU_MONTHS.put("ఫిబ్రవరి", 2);
        TELUGU_MONTHS.put("మార్చి", 3);
        TELUGU_MONTHS.put("ఏప్రిల్", 4);
        TELUGU_MONTHS.put("మే", 5);
        TELUGU_MONTHS.put("జూన్", 6);
        TELUGU_MONTHS.put("జూలై", 7);
        TELUGU_MONTHS.put("ఆగస్టు", 8);
        TELUGU_MONTHS.put("ఆగష్టు", 8);
        TELUGU_MONTHS.put("సెప్టెంబర్", 9);
        TELUGU_MONTHS.put("అక్టోబర్", 10);
        TELUGU_MONTHS.put("నవంబర్", 11);
        TELUGU_MONTHS.put("డిసెంబర్", 12);

        // Word to digit conversions (English)
        WORD_TO_DIGIT.put("zero", "0");
        WORD_TO_DIGIT.put("one", "1");
        WORD_TO_DIGIT.put("two", "2");
        WORD_TO_DIGIT.put("three", "3");
        WORD_TO_DIGIT.put("four", "4");
        WORD_TO_DIGIT.put("five", "5");
        WORD_TO_DIGIT.put("six", "6");
        WORD_TO_DIGIT.put("seven", "7");
        WORD_TO_DIGIT.put("eight", "8");
        WORD_TO_DIGIT.put("nine", "9");

        // Telugu number words
        WORD_TO_DIGIT.put("సున్నా", "0");
        WORD_TO_DIGIT.put("ఒకటి", "1");
        WORD_TO_DIGIT.put("రెండు", "2");
        WORD_TO_DIGIT.put("మూడు", "3");
        WORD_TO_DIGIT.put("నాలుగు", "4");
        WORD_TO_DIGIT.put("ఐదు", "5");
        WORD_TO_DIGIT.put("ఆరు", "6");
        WORD_TO_DIGIT.put("ఏడు", "7");
        WORD_TO_DIGIT.put("ఎనిమిది", "8");
        WORD_TO_DIGIT.put("తొమ్మిది", "9");
    }

    public VoiceGuidanceService(ServiceDefinitionRepository serviceRepository,
                                ServiceFieldRepository serviceFieldRepository,
                                VoiceInteractionLogRepository voiceLogRepository,
                                ObjectMapper objectMapper) {
        this.serviceRepository = serviceRepository;
        this.serviceFieldRepository = serviceFieldRepository;
        this.voiceLogRepository = voiceLogRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate bilingual voice guidance and prompts for an active service.
     */
    @Transactional(readOnly = true)
    public VoiceServiceGuidanceResponse getGuidanceForService(String serviceCode, String lang) {
        ServiceDefinition service = serviceRepository.findByCode(serviceCode)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with code: " + serviceCode));

        String language = (lang != null && lang.trim().toLowerCase().startsWith("te")) ? "te" : "en";
        boolean isTelugu = "te".equals(language);

        List<ServiceField> fields = serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(service.getId());
        List<VoicePromptDto> promptDtos = new ArrayList<>();

        for (ServiceField field : fields) {
            String label = isTelugu && field.getLabelTe() != null && !field.getLabelTe().isBlank()
                    ? field.getLabelTe()
                    : field.getLabelEn();

            String spokenPrompt = buildSpokenPrompt(field.getFieldKey(), label, field.getDataType().name(), isTelugu);
            String spokenExample = buildSpokenExample(field.getFieldKey(), isTelugu);
            String readbackTemplate = isTelugu
                    ? "మీరు {value} అన్నారు. ఇది సరైనదా? ముందుకు వెళ్ళడానికి అవును అనండి, మార్చడానికి కాదు అనండి."
                    : "You said {value}. Is this correct? Say yes to proceed, or no to change.";

            List<String> options = null;
            if (field.getOptionsJson() != null && !field.getOptionsJson().isBlank()) {
                try {
                    options = objectMapper.readValue(field.getOptionsJson(), new TypeReference<List<String>>() {});
                } catch (Exception e) {
                    log.warn("Could not parse optionsJson for field {}", field.getFieldKey());
                }
            }

            promptDtos.add(new VoicePromptDto(
                    field.getFieldKey(),
                    label,
                    spokenPrompt,
                    spokenExample,
                    field.getDataType().name(),
                    field.isRequired(),
                    readbackTemplate,
                    options,
                    field.getValidationRules()
            ));
        }

        String welcomePrompt = isTelugu
                ? service.getName() + " కొరకు వాయిస్ సహాయకుడికి స్వాగతం. నేను ప్రతి విభాగాన్ని దశలవారీగా అడుగుతాను. మీరు మాట్లాడవచ్చు లేదా టైప్ చేయవచ్చు."
                : "Welcome to the voice application assistant for " + service.getName() + ". I will guide you through each required field step-by-step. You can speak clearly or use keyboard typing anytime.";

        String completionPrompt = isTelugu
                ? "అన్ని వివరాలు నమోదు చేయబడ్డాయి. దయచేసి వివరాలను పరిశీలించి, అవసరమైన పత్రాలను అప్‌లోడ్ చేయండి."
                : "All fields have been filled. Please review the summary and proceed to upload your supporting documents.";

        String errorPrompt = isTelugu
                ? "నేను వినలేకపోయాను. దయచేసి మైక్రోఫోన్‌లో స్పష్టంగా మాట్లాడండి, లేదా టైప్ చేయండి."
                : "I didn't quite catch that. Please speak clearly into your microphone, or choose to type.";

        return new VoiceServiceGuidanceResponse(
                service.getCode(),
                service.getName(),
                language,
                welcomePrompt,
                completionPrompt,
                errorPrompt,
                promptDtos
        );
    }

    /**
     * Intelligent normalization of spoken transcripts into structured field values.
     */
    public VoiceNormalizationResponse normalizeSpokenInput(VoiceNormalizationRequest request) {
        String raw = request.getRawTranscript() != null ? request.getRawTranscript().trim() : "";
        String lang = (request.getLanguage() != null && request.getLanguage().toLowerCase().startsWith("te")) ? "te" : "en";
        String dataType = request.getDataType() != null ? request.getDataType().toUpperCase() : "TEXT";
        String fieldKey = request.getFieldKey() != null ? request.getFieldKey() : "";

        // Detect high-level confirmation intent first
        String intent = detectIntent(raw, lang);
        if ("CONFIRM_YES".equals(intent) || "CONFIRM_NO".equals(intent) || "REPEAT".equals(intent)) {
            String readback = "CONFIRM_YES".equals(intent)
                    ? (lang.equals("te") ? "ధృవీకరించబడింది" : "Confirmed")
                    : (lang.equals("te") ? "రద్దు చేయబడింది, దయచేసి మళ్ళీ చెప్పండి" : "Cancelled, please repeat");
            return new VoiceNormalizationResponse(raw, intent, intent, 0.95, readback);
        }

        String normalizedValue = raw;

        if ("NUMBER".equals(dataType) || "aadhaarNumber".equalsIgnoreCase(fieldKey) || (!fieldKey.isEmpty() && fieldKey.toLowerCase().contains("phone"))) {
            normalizedValue = normalizeNumericSpeech(raw);
        } else if ("DATE".equals(dataType) || "dateOfBirth".equalsIgnoreCase(fieldKey)) {
            normalizedValue = normalizeDateSpeech(raw);
        } else if ("SELECT".equals(dataType) || "bloodGroup".equalsIgnoreCase(fieldKey) || "vehicleClass".equalsIgnoreCase(fieldKey)) {
            normalizedValue = normalizeSelectSpeech(fieldKey, raw);
        } else {
            // Text field clean up (capitalize name appropriately)
            if ("fullName".equalsIgnoreCase(fieldKey) || "ownerName".equalsIgnoreCase(fieldKey) || "businessName".equalsIgnoreCase(fieldKey)) {
                normalizedValue = capitalizeWords(raw);
            }
        }

        String readbackText = lang.equals("te")
                ? "నమోదు చేయబడింది: " + normalizedValue
                : "Recorded: " + normalizedValue;

        return new VoiceNormalizationResponse(raw, normalizedValue, "VALUE_INPUT", 0.90, readbackText);
    }

    /**
     * Persist voice interaction telemetry for research evaluation.
     */
    @Transactional
    public VoiceTelemetryResponse recordTelemetry(VoiceTelemetryRequest request) {
        VoiceInteractionLog logEntity = new VoiceInteractionLog(
                request.getApplicationId(),
                request.getServiceCode(),
                request.getFieldKey(),
                request.getLanguage(),
                request.getRawTranscript(),
                request.getNormalizedValue(),
                request.getConfidenceScore(),
                request.getDurationMs(),
                request.getCorrectionCount(),
                request.getConfirmedByUser(),
                request.getInputMode()
        );

        VoiceInteractionLog saved = voiceLogRepository.save(logEntity);
        log.info("Voice telemetry logged: id={}, service={}, field={}, mode={}, confirmed={}",
                saved.getId(), saved.getServiceCode(), saved.getFieldKey(), saved.getInputMode(), saved.getConfirmedByUser());

        return new VoiceTelemetryResponse(
                saved.getId(),
                saved.getApplicationId(),
                saved.getServiceCode(),
                saved.getFieldKey(),
                saved.getLanguage(),
                saved.getConfirmedByUser(),
                saved.getInputMode(),
                saved.getCreatedAt()
        );
    }

    /**
     * Compute aggregated voice interaction statistics for evaluation.
     */
    @Transactional(readOnly = true)
    public VoiceStatsResponse getVoiceStats() {
        long total = voiceLogRepository.count();
        long confirmed = voiceLogRepository.countByConfirmedByUserTrue();
        double confirmationRate = total > 0 ? ((double) confirmed / total) * 100.0 : 0.0;

        Double avgConfidence = voiceLogRepository.getAverageConfidenceScore();
        Double avgCorrections = voiceLogRepository.getAverageCorrectionCount();

        Map<String, Long> languageMap = new HashMap<>();
        List<Object[]> langCounts = voiceLogRepository.countByLanguageGroup();
        for (Object[] row : langCounts) {
            String lang = row[0] != null ? row[0].toString() : "unknown";
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            languageMap.put(lang, count);
        }

        Map<String, Long> modeMap = new HashMap<>();
        List<Object[]> modeCounts = voiceLogRepository.countByInputModeGroup();
        for (Object[] row : modeCounts) {
            String mode = row[0] != null ? row[0].toString() : "UNKNOWN";
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            modeMap.put(mode, count);
        }

        return new VoiceStatsResponse(
                total,
                confirmed,
                Math.round(confirmationRate * 100.0) / 100.0,
                avgConfidence != null ? Math.round(avgConfidence * 100.0) / 100.0 : 0.0,
                avgCorrections != null ? Math.round(avgCorrections * 100.0) / 100.0 : 0.0,
                languageMap,
                modeMap
        );
    }

    // -------------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------------

    private String detectIntent(String text, String lang) {
        if (text == null || text.isBlank()) return "UNKNOWN";
        String lower = text.trim().toLowerCase();

        // Yes confirmations
        List<String> yesWords = List.of(
                "yes", "yeah", "yep", "correct", "confirm", "right", "sure", "ok", "okay", "true",
                "అవును", "సరే", "కరెక్ట్", "నిజమే", "సరైనది", "ఖరారు", "హౌ"
        );
        for (String y : yesWords) {
            if (lower.equals(y) || lower.startsWith(y + " ") || lower.endsWith(" " + y)) {
                return "CONFIRM_YES";
            }
        }

        // No cancellations / corrections
        List<String> noWords = List.of(
                "no", "nope", "wrong", "incorrect", "change", "cancel", "not this",
                "కాదు", "తప్పు", "వద్దు", "మార్చు"
        );
        for (String n : noWords) {
            if (lower.equals(n) || lower.startsWith(n + " ") || lower.endsWith(" " + n)) {
                return "CONFIRM_NO";
            }
        }

        // Repeat requests
        List<String> repeatWords = List.of("repeat", "say again", "once more", "మళ్ళీ", "మరలా");
        for (String r : repeatWords) {
            if (lower.contains(r)) {
                return "REPEAT";
            }
        }

        return "VALUE_INPUT";
    }

    /**
     * Converts spoken numbers, Telugu digits, and words into numeric digits.
     */
    public String normalizeNumericSpeech(String transcript) {
        if (transcript == null || transcript.isBlank()) return "";

        String text = transcript.trim().toLowerCase();

        // Convert Telugu digits Unicode (౦-౯) to Western digits
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            if (c >= '\u0C66' && c <= '\u0C6F') {
                sb.append((char) ('0' + (c - '\u0C66')));
            } else {
                sb.append(c);
            }
        }
        text = sb.toString();

        // Tokenize and replace spoken word digits
        String[] tokens = text.split("[\\s,-]+");
        StringBuilder digits = new StringBuilder();
        for (String token : tokens) {
            token = token.trim();
            if (token.isEmpty()) continue;

            if (WORD_TO_DIGIT.containsKey(token)) {
                digits.append(WORD_TO_DIGIT.get(token));
            } else if (token.matches("^[0-9]+$")) {
                digits.append(token);
            }
        }

        if (digits.length() > 0) {
            return digits.toString();
        }

        // Fallback: extract any digits from string
        String extracted = transcript.replaceAll("[^0-9]", "");
        return extracted.isEmpty() ? transcript.trim() : extracted;
    }

    /**
     * Converts spoken dates into standard ISO YYYY-MM-DD.
     */
    public String normalizeDateSpeech(String transcript) {
        if (transcript == null || transcript.isBlank()) return "";

        String text = transcript.trim().toLowerCase();

        // Check if already in standard ISO format YYYY-MM-DD
        if (text.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            return text;
        }

        // Check DD/MM/YYYY or DD-MM-YYYY
        Pattern dmyPattern = Pattern.compile("^(\\d{1,2})[/\\-.](\\d{1,2})[/\\-.](\\d{4})$");
        Matcher dmyMatcher = dmyPattern.matcher(text);
        if (dmyMatcher.matches()) {
            int d = Integer.parseInt(dmyMatcher.group(1));
            int m = Integer.parseInt(dmyMatcher.group(2));
            int y = Integer.parseInt(dmyMatcher.group(3));
            return String.format("%04d-%02d-%02d", y, m, d);
        }

        // Spoken format: "15th August 1995", "15 August 1995", "August 15 1995", "15 ఆగస్టు 1995"
        Integer day = null;
        Integer month = null;
        Integer year = null;

        // Strip ordinal suffixes: 1st, 2nd, 3rd, 4th -> 1, 2, 3, 4
        text = text.replaceAll("(\\d+)(st|nd|rd|th)", "$1");

        // Find month name
        for (Map.Entry<String, Integer> entry : ENGLISH_MONTHS.entrySet()) {
            if (text.contains(entry.getKey())) {
                month = entry.getValue();
                break;
            }
        }
        if (month == null) {
            for (Map.Entry<String, Integer> entry : TELUGU_MONTHS.entrySet()) {
                if (text.contains(entry.getKey())) {
                    month = entry.getValue();
                    break;
                }
            }
        }

        // Find numbers in text
        Pattern numPattern = Pattern.compile("\\b(\\d{1,4})\\b");
        Matcher numMatcher = numPattern.matcher(text);
        List<Integer> numbers = new ArrayList<>();
        while (numMatcher.find()) {
            numbers.add(Integer.parseInt(numMatcher.group(1)));
        }

        for (int num : numbers) {
            if (num > 1900 && num < 2100) {
                year = num;
            } else if (num >= 1 && num <= 31 && day == null) {
                day = num;
            } else if (month == null && num >= 1 && num <= 12) {
                month = num;
            }
        }

        if (year != null && month != null && day != null) {
            try {
                LocalDate date = LocalDate.of(year, month, day);
                return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (Exception e) {
                log.debug("Invalid parsed date components: {}-{}-{}", year, month, day);
            }
        }

        return transcript.trim();
    }

    /**
     * Normalizes SELECT field options (blood group, vehicle class, etc.).
     */
    public String normalizeSelectSpeech(String fieldKey, String transcript) {
        if (transcript == null || transcript.isBlank()) return "";
        String text = transcript.trim().toLowerCase();

        if ("bloodGroup".equalsIgnoreCase(fieldKey)) {
            if (text.contains("o positive") || text.contains("ఓ పాజిటివ్") || text.equals("o+")) return "O+";
            if (text.contains("o negative") || text.contains("ఓ నెగెటివ్") || text.equals("o-")) return "O-";
            if (text.contains("b positive") || text.contains("బి పాజిటివ్") || text.equals("b+")) return "B+";
            if (text.contains("b negative") || text.contains("బి నెగెటివ్") || text.equals("b-")) return "B-";
            if (text.contains("a positive") || text.contains("ఏ పాజిటివ్") || text.equals("a+")) return "A+";
            if (text.contains("a negative") || text.contains("ఏ నెగెటివ్") || text.equals("a-")) return "A-";
            if (text.contains("ab positive") || text.contains("ఏబి పాజిటివ్") || text.equals("ab+")) return "AB+";
            if (text.contains("ab negative") || text.contains("ఏబి నెగెటివ్") || text.equals("ab-")) return "AB-";
        }

        if ("vehicleClass".equalsIgnoreCase(fieldKey)) {
            if (text.contains("without gear") || text.contains("mcwog") || text.contains("గేర్ లేని")) {
                return "Motorcycle without Gear (MCWOG)";
            }
            if (text.contains("motorcycle") || text.contains("with gear") || text.contains("mcwg") || text.contains("ద్విచక్ర")) {
                return "Motorcycle with Gear (MCWG)";
            }
            if (text.contains("light motor") || text.contains("car") || text.contains("lmv") || text.contains("నాలుగు చక్రాలు")) {
                return "Light Motor Vehicle (LMV)";
            }
        }

        if ("tradeCategory".equalsIgnoreCase(fieldKey)) {
            if (text.contains("retail") || text.contains("రిటైల్")) return "Retail Merchant";
            if (text.contains("wholesale") || text.contains("హోల్‌సేల్")) return "Wholesale Trading";
            if (text.contains("food") || text.contains("hospitality") || text.contains("ఆహార")) return "Food & Hospitality";
            if (text.contains("manufacturing") || text.contains("తయారీ")) return "Manufacturing & Assembly";
            if (text.contains("service") || text.contains("సేవలు")) return "Services & Consulting";
        }

        return transcript.trim();
    }

    private String buildSpokenPrompt(String fieldKey, String label, String dataType, boolean isTelugu) {
        if (isTelugu) {
            switch (fieldKey) {
                case "fullName": return "దయచేసి మీ ఆధార్ కార్డు ప్రకారం మీ పూర్తి పేరు స్పష్టంగా చెప్పండి.";
                case "dateOfBirth": return "దయచేసి మీ పుట్టిన తేదీని చెప్పండి. ఉదాహరణకు 15 ఆగస్టు 1995.";
                case "bloodGroup": return "దయచేసి మీ రక్త వర్గం చెప్పండి, ఉదాహరణకు ఓ పాజిటివ్ లేదా బి పాజిటివ్.";
                case "vehicleClass": return "దయచేసి మీరు దరఖాస్తు చేసుకునే వాహన తరగతిని ఎంచుకోండి.";
                case "aadhaarNumber": return "దయచేసి మీ 12 అంకెల ఆధార్ సంఖ్యను స్పష్టంగా చెప్పండి.";
                case "residentialAddress": return "దయచేసి మీ శాశ్వత నివాస చిరునామాను వివరంగా చెప్పండి.";
                case "businessName": return "దయచేసి మీ వ్యాపార లేదా సంస్థ పేరు చెప్పండి.";
                case "ownerName": return "దయచేసి యజమాని లేదా భాగస్వామి పూర్తి పేరు చెప్పండి.";
                case "tradeCategory": return "దయచేసి మీ వ్యాపార కేటగిరీని ఎంచుకోండి.";
                case "businessAddress": return "దయచేసి మీ వ్యాపార స్థలం చిరునామాను చెప్పండి.";
                case "annualTurnover": return "దయచేసి అంచనా వార్షిక టర్నోవర్ మొత్తాన్ని రూపాయల్లో చెప్పండి.";
                case "panNumber": return "దయచేసి మీ 10 అంకెల పాన్ సంఖ్యను స్పష్టంగా చెప్పండి.";
                default: return "దయచేసి మీ " + label + " వివరాలు చెప్పండి.";
            }
        } else {
            switch (fieldKey) {
                case "fullName": return "Please speak your full legal name as shown on your official ID proof.";
                case "dateOfBirth": return "Please state your date of birth, for example, 15th August 1995.";
                case "bloodGroup": return "Please state your blood group, such as O positive or B positive.";
                case "vehicleClass": return "Please select the vehicle class you are applying for.";
                case "aadhaarNumber": return "Please dictate your 12-digit Aadhaar number clearly.";
                case "residentialAddress": return "Please speak your complete permanent residential address.";
                case "businessName": return "Please state the official name of your business establishment.";
                case "ownerName": return "Please state the proprietor or managing partner's full name.";
                case "tradeCategory": return "Please select your trade category.";
                case "businessAddress": return "Please state the physical address of your business premises.";
                case "annualTurnover": return "Please state your estimated annual turnover in Indian Rupees.";
                case "panNumber": return "Please state your 10-character alphanumeric PAN number.";
                default: return "Please provide your " + label + ".";
            }
        }
    }

    private String buildSpokenExample(String fieldKey, boolean isTelugu) {
        if (isTelugu) {
            switch (fieldKey) {
                case "fullName": return "ఉదాహరణకు: రమేష్ కుమార్";
                case "dateOfBirth": return "ఉదాహరణకు: 15 ఆగస్టు 1995";
                case "bloodGroup": return "ఉదాహరణకు: ఓ పాజిటివ్ (O+)";
                case "vehicleClass": return "ఉదాహరణకు: మోటార్ సైకిల్ లేదా కారు (LMV)";
                case "aadhaarNumber": return "ఉదాహరణకు: 1234 5678 9012";
                case "residentialAddress": return "ఉదాహరణకు: ఇంటి నెం 4-50, గాంధీ రోడ్, హైదరాబాద్";
                case "businessName": return "ఉదాహరణకు: శ్రీ సాయి ట్రేడర్స్";
                case "ownerName": return "ఉదాహరణకు: వెంకటేశ్వర రావు";
                case "tradeCategory": return "ఉదాహరణకు: రిటైల్ మర్చెంట్";
                case "panNumber": return "ఉదాహరణకు: ABCDE 1234 F";
                default: return "";
            }
        } else {
            switch (fieldKey) {
                case "fullName": return "e.g., Ramesh Kumar";
                case "dateOfBirth": return "e.g., 15th August 1995";
                case "bloodGroup": return "e.g., O positive (O+)";
                case "vehicleClass": return "e.g., Motorcycle with Gear or Light Motor Vehicle";
                case "aadhaarNumber": return "e.g., 1234 5678 9012";
                case "residentialAddress": return "e.g., Plot 42, Jubilee Hills, Hyderabad 500033";
                case "businessName": return "e.g., Sri Sai Traders";
                case "ownerName": return "e.g., Venkateswara Rao";
                case "tradeCategory": return "e.g., Retail Merchant";
                case "panNumber": return "e.g., ABCDE 1234 F";
                default: return "";
            }
        }
    }

    private String capitalizeWords(String input) {
        if (input == null || input.isBlank()) return "";
        String[] words = input.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            String w = words[i];
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0)));
                if (w.length() > 1) {
                    sb.append(w.substring(1).toLowerCase());
                }
                if (i < words.length - 1) {
                    sb.append(" ");
                }
            }
        }
        return sb.toString();
    }
}
