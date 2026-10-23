package com.licensing.platform.dto;

import com.licensing.platform.model.enums.Role;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String email,
        String fullName,
        Role role
) {
    public AuthResponse(String token, Long userId, String email, String fullName, Role role) {
        this(token, "Bearer", userId, email, fullName, role);
    }
}
