package com.licensing.platform.repository;

import com.licensing.platform.model.VoiceInteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoiceInteractionLogRepository extends JpaRepository<VoiceInteractionLog, Long> {

    List<VoiceInteractionLog> findByServiceCodeOrderByCreatedAtDesc(String serviceCode);

    List<VoiceInteractionLog> findByApplicationId(Long applicationId);

    long countByServiceCode(String serviceCode);

    long countByConfirmedByUserTrue();

    @Query("SELECT AVG(v.confidenceScore) FROM VoiceInteractionLog v WHERE v.confidenceScore IS NOT NULL")
    Double getAverageConfidenceScore();

    @Query("SELECT AVG(CAST(v.correctionCount AS double)) FROM VoiceInteractionLog v")
    Double getAverageCorrectionCount();

    @Query("SELECT v.language, COUNT(v) FROM VoiceInteractionLog v GROUP BY v.language")
    List<Object[]> countByLanguageGroup();

    @Query("SELECT v.inputMode, COUNT(v) FROM VoiceInteractionLog v GROUP BY v.inputMode")
    List<Object[]> countByInputModeGroup();
}
