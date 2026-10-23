package com.licensing.platform.repository;

import com.licensing.platform.model.RequiredDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequiredDocumentTypeRepository extends JpaRepository<RequiredDocumentType, Long> {

    List<RequiredDocumentType> findByServiceId(Long serviceId);

    Optional<RequiredDocumentType> findByServiceIdAndDocumentCode(Long serviceId, String documentCode);

    boolean existsByServiceIdAndDocumentCode(Long serviceId, String documentCode);

    Optional<RequiredDocumentType> findByIdAndServiceId(Long id, Long serviceId);
}
