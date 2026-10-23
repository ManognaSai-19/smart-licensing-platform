package com.licensing.platform.service;

import com.licensing.platform.dto.AuthResponse;
import com.licensing.platform.dto.LoginRequest;
import com.licensing.platform.dto.RegisterRequest;
import com.licensing.platform.dto.UserProfileResponse;
import com.licensing.platform.exception.DuplicateResourceException;
import com.licensing.platform.exception.ResourceNotFoundException;
import com.licensing.platform.model.AuditLog;
import com.licensing.platform.model.User;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.AuditLogRepository;
import com.licensing.platform.repository.UserRepository;
import com.licensing.platform.security.JwtTokenProvider;
import com.licensing.platform.security.UserPrincipal;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogRepository auditLogRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email already exists: " + normalizedEmail);
        }

        // Strict role safety: Citizen self-registration CANNOT self-escalate to OFFICER or ADMIN.
        // Role is strictly assigned as CITIZEN.
        Role assignedRole = Role.CITIZEN;

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                assignedRole,
                request.phoneNumber() != null ? request.phoneNumber().trim() : null
        );

        User savedUser = userRepository.save(user);

        // Record registration event in audit log
        AuditLog audit = new AuditLog(
                savedUser,
                "REGISTER",
                "USER",
                savedUser.getId().toString(),
                null,
                "{\"role\":\"" + assignedRole.name() + "\"}"
        );
        auditLogRepository.save(audit);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new DisabledException("Account has been deactivated");
        }

        AuditLog audit = new AuditLog(
                user,
                "LOGIN",
                "SESSION",
                user.getId().toString(),
                null,
                "{\"loginStatus\":\"SUCCESS\"}"
        );
        auditLogRepository.save(audit);

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void recordLogout(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            AuditLog audit = new AuditLog(
                    user,
                    "LOGOUT",
                    "SESSION",
                    user.getId().toString(),
                    null,
                    "{\"logoutStatus\":\"SUCCESS\"}"
            );
            auditLogRepository.save(audit);
        });
    }
}
