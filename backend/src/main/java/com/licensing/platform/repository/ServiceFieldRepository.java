package com.licensing.platform.repository;

import com.licensing.platform.model.ServiceField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceFieldRepository extends JpaRepository<ServiceField, Long> {
    List<ServiceField> findByServiceIdOrderByDisplayOrderAsc(Long serviceId);
    Optional<ServiceField> findByServiceIdAndFieldKey(Long serviceId, String fieldKey);
}
