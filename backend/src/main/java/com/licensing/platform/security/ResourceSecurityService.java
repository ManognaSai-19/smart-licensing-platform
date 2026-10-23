package com.licensing.platform.security;

import com.licensing.platform.model.Application;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.ApplicationRepository;
import com.licensing.platform.repository.OfficerDepartmentAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("securityService")
public class ResourceSecurityService {

    private final ApplicationRepository applicationRepository;
    private final OfficerDepartmentAssignmentRepository assignmentRepository;

    public ResourceSecurityService(ApplicationRepository applicationRepository,
                                   OfficerDepartmentAssignmentRepository assignmentRepository) {
        this.applicationRepository = applicationRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public boolean canAccessApplication(Object principalObj, Long applicationId) {
        if (!(principalObj instanceof UserPrincipal principal)) {
            return false;
        }

        if (principal.getRole() == Role.ADMIN) {
            return true;
        }

        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) {
            return false;
        }

        // 1. Citizen may ONLY access their own application
        if (principal.getRole() == Role.CITIZEN) {
            return application.getCitizen().getId().equals(principal.getId());
        }

        // 2. Officer may ONLY access applications within their assigned department
        if (principal.getRole() == Role.OFFICER) {
            Long appDepartmentId = application.getService().getDepartment().getId();
            return assignmentRepository.existsByUserIdAndDepartmentId(principal.getId(), appDepartmentId);
        }

        return false;
    }
}
