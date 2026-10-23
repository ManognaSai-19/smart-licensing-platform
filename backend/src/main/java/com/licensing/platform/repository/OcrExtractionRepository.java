package com.licensing.platform.repository;

import com.licensing.platform.model.OcrExtraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OcrExtractionRepository extends JpaRepository<OcrExtraction, Long> {
    Optional<OcrExtraction> findByDocumentId(Long documentId);
    java.util.List<OcrExtraction> findByDocumentApplicationId(Long applicationId);
    void deleteByDocumentId(Long documentId);
}
