package com.licensing.platform.controller;

import com.licensing.platform.dto.AuthResponse;
import com.licensing.platform.dto.LoginRequest;
import com.licensing.platform.dto.RegisterRequest;
import com.licensing.platform.dto.UserProfileResponse;
import com.licensing.platform.security.UserPrincipal;
import com.licensing.platform.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse response = authService.getCurrentUserProfile(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@AuthenticationPrincipal UserPrincipal principal) {
        authService.recordLogout(principal.getId());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * Endpoint to verify resource-level authorization (citizen ownership & officer department boundaries).
     */
    @GetMapping("/test/application/{applicationId}")
    @PreAuthorize("@securityService.canAccessApplication(principal, #applicationId)")
    public ResponseEntity<Map<String, Object>> testApplicationAccess(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of(
                "status", "AUTHORIZED",
                "applicationId", applicationId,
                "accessedByUserId", principal.getId(),
                "role", principal.getRole().name()
        ));
    }
}
