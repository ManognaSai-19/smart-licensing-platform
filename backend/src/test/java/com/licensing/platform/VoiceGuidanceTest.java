package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.VoiceNormalizationRequest;
import com.licensing.platform.dto.VoiceTelemetryRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VoiceGuidanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Verify English voice prompts and field guidance for Driving License")
    void testGetVoicePromptsForDrivingLicenseEnglish() throws Exception {
        mockMvc.perform(get("/api/voice/prompts/SRV_DRIVING_LICENSE?lang=en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceCode").value("SRV_DRIVING_LICENSE"))
                .andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.welcomePrompt", containsString("voice application assistant")))
                .andExpect(jsonPath("$.fields", hasSize(6)))
                .andExpect(jsonPath("$.fields[0].fieldKey").value("fullName"))
                .andExpect(jsonPath("$.fields[0].spokenPrompt", containsString("full legal name")))
                .andExpect(jsonPath("$.fields[0].spokenExample", containsString("Ramesh Kumar")))
                .andExpect(jsonPath("$.fields[0].readbackTemplate", containsString("You said {value}")))
                .andExpect(jsonPath("$.fields[2].fieldKey").value("bloodGroup"))
                .andExpect(jsonPath("$.fields[2].options", hasItem("O+")))
                .andExpect(jsonPath("$.fields[4].fieldKey").value("aadhaarNumber"))
                .andExpect(jsonPath("$.fields[4].spokenPrompt", containsString("12-digit Aadhaar")));
    }

    @Test
    @DisplayName("Verify Telugu voice prompts and field guidance for Driving License")
    void testGetVoicePromptsForDrivingLicenseTelugu() throws Exception {
        mockMvc.perform(get("/api/voice/prompts/SRV_DRIVING_LICENSE?lang=te"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceCode").value("SRV_DRIVING_LICENSE"))
                .andExpect(jsonPath("$.language").value("te"))
                .andExpect(jsonPath("$.welcomePrompt", containsString("స్వాగతం")))
                .andExpect(jsonPath("$.completionPrompt", containsString("అన్ని వివరాలు నమోదు చేయబడ్డాయి")))
                .andExpect(jsonPath("$.fields", hasSize(6)))
                .andExpect(jsonPath("$.fields[0].fieldKey").value("fullName"))
                .andExpect(jsonPath("$.fields[0].label", containsString("పూర్తి పేరు")))
                .andExpect(jsonPath("$.fields[0].spokenPrompt", containsString("పూర్తి పేరు స్పష్టంగా చెప్పండి")))
                .andExpect(jsonPath("$.fields[0].readbackTemplate", containsString("మీరు {value} అన్నారు")));
    }

    @Test
    @DisplayName("Verify non-existent service returns 404 Not Found")
    void testGetVoicePromptsForNonExistentServiceReturns404() throws Exception {
        mockMvc.perform(get("/api/voice/prompts/SRV_DOES_NOT_EXIST"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Verify confirmation intent normalization (English and Telugu)")
    void testNormalizeSpokenConfirmationIntents() throws Exception {
        // English Yes
        VoiceNormalizationRequest reqYesEn = new VoiceNormalizationRequest(null, "yes, that is correct", "en", "TEXT");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqYesEn)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detectedIntent").value("CONFIRM_YES"))
                .andExpect(jsonPath("$.readbackText").value("Confirmed"));

        // Telugu Yes
        VoiceNormalizationRequest reqYesTe = new VoiceNormalizationRequest(null, "అవును", "te", "TEXT");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqYesTe)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detectedIntent").value("CONFIRM_YES"))
                .andExpect(jsonPath("$.readbackText").value("ధృవీకరించబడింది"));

        // English No
        VoiceNormalizationRequest reqNoEn = new VoiceNormalizationRequest(null, "no change it", "en", "TEXT");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqNoEn)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detectedIntent").value("CONFIRM_NO"));

        // Telugu No
        VoiceNormalizationRequest reqNoTe = new VoiceNormalizationRequest(null, "కాదు", "te", "TEXT");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqNoTe)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detectedIntent").value("CONFIRM_NO"));
    }

    @Test
    @DisplayName("Verify numeric speech normalization across English words and Telugu numerals")
    void testNormalizeNumericSpeech() throws Exception {
        // English spoken words to digits
        VoiceNormalizationRequest reqWords = new VoiceNormalizationRequest("aadhaarNumber", "nine eight seven six five four three two one zero one two", "en", "NUMBER");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqWords)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("987654321012"));

        // Telugu numerals Unicode (౧౨౩౪)
        VoiceNormalizationRequest reqTeluguDigits = new VoiceNormalizationRequest("annualTurnover", "౫౦౦౦౦", "te", "NUMBER");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqTeluguDigits)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("50000"));

        // Telugu spoken words (ఒకటి రెండు మూడు నాలుగు)
        VoiceNormalizationRequest reqTeluguWords = new VoiceNormalizationRequest("aadhaarNumber", "ఒకటి రెండు మూడు నాలుగు ఐదు ఆరు ఏడు ఎనిమిది తొమ్మిది సున్నా ఒకటి రెండు", "te", "NUMBER");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqTeluguWords)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("123456789012"));
    }

    @Test
    @DisplayName("Verify date speech normalization to standard ISO YYYY-MM-DD")
    void testNormalizeDateSpeech() throws Exception {
        // English spoken date: "15th August 1995"
        VoiceNormalizationRequest reqDateEn = new VoiceNormalizationRequest("dateOfBirth", "15th August 1995", "en", "DATE");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDateEn)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("1995-08-15"));

        // Telugu spoken date: "15 ఆగస్టు 1995"
        VoiceNormalizationRequest reqDateTe = new VoiceNormalizationRequest("dateOfBirth", "15 ఆగస్టు 1995", "te", "DATE");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDateTe)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("1995-08-15"));

        // Already formatted: "1998-11-20"
        VoiceNormalizationRequest reqFormatted = new VoiceNormalizationRequest("dateOfBirth", "1998-11-20", "en", "DATE");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqFormatted)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("1998-11-20"));
    }

    @Test
    @DisplayName("Verify SELECT field speech normalization (blood group and vehicle class)")
    void testNormalizeSelectSpeech() throws Exception {
        // Spoken "o positive"
        VoiceNormalizationRequest reqBg = new VoiceNormalizationRequest("bloodGroup", "o positive", "en", "SELECT");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqBg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("O+"));

        // Telugu "ఓ పాజిటివ్"
        VoiceNormalizationRequest reqBgTe = new VoiceNormalizationRequest("bloodGroup", "ఓ పాజిటివ్", "te", "SELECT");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqBgTe)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("O+"));

        // Spoken "motorcycle with gear"
        VoiceNormalizationRequest reqVc = new VoiceNormalizationRequest("vehicleClass", "motorcycle with gear", "en", "SELECT");
        mockMvc.perform(post("/api/voice/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqVc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normalizedValue").value("Motorcycle with Gear (MCWG)"));
    }

    @Test
    @DisplayName("Verify telemetry recording and statistical aggregation for research evaluation")
    void testRecordVoiceTelemetryAndQueryStats() throws Exception {
        // Record 1: Voice input in English
        VoiceTelemetryRequest telem1 = new VoiceTelemetryRequest(
                null, "SRV_DRIVING_LICENSE", "fullName", "en-IN",
                "Ramesh Kumar", "Ramesh Kumar", 0.96, 2500, 0, true, "VOICE"
        );
        mockMvc.perform(post("/api/voice/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(telem1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.serviceCode").value("SRV_DRIVING_LICENSE"))
                .andExpect(jsonPath("$.fieldKey").value("fullName"))
                .andExpect(jsonPath("$.confirmedByUser").value(true));

        // Record 2: Voice input in Telugu
        VoiceTelemetryRequest telem2 = new VoiceTelemetryRequest(
                null, "SRV_DRIVING_LICENSE", "aadhaarNumber", "te-IN",
                "ఒకటి రెండు మూడు నాలుగు ఐదు ఆరు ఏడు ఎనిమిది తొమ్మిది సున్నా ఒకటి రెండు", "123456789012", 0.92, 4000, 1, true, "VOICE"
        );
        mockMvc.perform(post("/api/voice/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(telem2)))
                .andExpect(status().isOk());

        // Record 3: Keyboard Fallback
        VoiceTelemetryRequest telem3 = new VoiceTelemetryRequest(
                null, "SRV_DRIVING_LICENSE", "residentialAddress", "en",
                null, "Plot 42, Jubilee Hills, Hyderabad", null, 8000, 0, true, "KEYBOARD_FALLBACK"
        );
        mockMvc.perform(post("/api/voice/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(telem3)))
                .andExpect(status().isOk());

        // Query Stats
        mockMvc.perform(get("/api/voice/telemetry/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInteractions", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.confirmedInteractions", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.confirmationRate", greaterThanOrEqualTo(90.0)))
                .andExpect(jsonPath("$.averageConfidence", greaterThanOrEqualTo(0.90)))
                .andExpect(jsonPath("$.languageBreakdown['te-IN']", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.languageBreakdown['en-IN']", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.inputModeBreakdown['VOICE']", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.inputModeBreakdown['KEYBOARD_FALLBACK']", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("Verify invalid telemetry payload returns 400 Bad Request")
    void testInvalidTelemetryPayloadReturns400() throws Exception {
        VoiceTelemetryRequest invalid = new VoiceTelemetryRequest();
        // Missing required serviceCode, fieldKey, language
        mockMvc.perform(post("/api/voice/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }
}
