package com.licensing.platform.dto;

import com.licensing.platform.model.User;
import com.licensing.platform.model.enums.Role;
import java.time.Instant;

public record UserProfileResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        String phoneNumber,
        boolean active,
        Instant createdAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getPhoneNumber(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
