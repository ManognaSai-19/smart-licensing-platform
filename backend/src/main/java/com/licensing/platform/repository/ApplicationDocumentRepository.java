package com.licensing.platform.repository;

import com.licensing.platform.model.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, Long> {
    List<ApplicationDocument> findByApplicationId(Long applicationId);
    Optional<ApplicationDocument> findByStorageKey(String storageKey);
    Optional<ApplicationDocument> findByApplicationIdAndDocumentTypeId(Long applicationId, Long documentTypeId);
}
