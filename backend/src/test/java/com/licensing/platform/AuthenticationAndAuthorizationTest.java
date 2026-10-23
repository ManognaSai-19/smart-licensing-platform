package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.LoginRequest;
import com.licensing.platform.dto.RegisterRequest;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.*;
import com.licensing.platform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthenticationAndAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ServiceDefinitionRepository serviceRepository;

    @Autowired
    private OfficerDepartmentAssignmentRepository assignmentRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private Department transportDept;
    private Department municipalDept;
    private ServiceDefinition dlService;

    @BeforeEach
    void setUp() {
        transportDept = departmentRepository.findByCode("DEPT_TRANSPORT").orElseThrow();
        municipalDept = departmentRepository.findByCode("DEPT_MUNICIPAL").orElseThrow();
        dlService = serviceRepository.findByCode("SRV_DRIVING_LICENSE").orElseThrow();
    }

    // =========================================================================
    // 1. REGISTRATION TESTS (POSITIVE & NEGATIVE)
    // =========================================================================

    @Test
    @DisplayName("Positive: Citizen successfully registers and receives valid JWT token")
    void testRegisterCitizenSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "anita.sharma@example.com",
                "SecurePassword123!",
                "Anita Sharma",
                "+919876543210",
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("anita.sharma@example.com")))
                .andExpect(jsonPath("$.fullName", is("Anita Sharma")))
                .andExpect(jsonPath("$.role", is("CITIZEN")))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.token").isString());

        User savedUser = userRepository.findByEmail("anita.sharma@example.com").orElseThrow();
        assertThat(passwordEncoder.matches("SecurePassword123!", savedUser.getPasswordHash())).isTrue();
        assertThat(savedUser.getRole()).isEqualTo(Role.CITIZEN);
        assertThat(auditLogRepository.findByActorIdOrderByCreatedAtDesc(savedUser.getId())).isNotEmpty();
    }

    @Test
    @DisplayName("Negative: Duplicate registration attempt fails with HTTP 409 Conflict")
    void testRegisterDuplicateEmailFails() throws Exception {
        User existing = new User("duplicate.test@example.com", passwordEncoder.encode("SecretPass1"), "Original User", Role.CITIZEN, null);
        userRepository.saveAndFlush(existing);

        RegisterRequest duplicate = new RegisterRequest(
                "duplicate.test@example.com",
                "NewSecretPass2",
                "Impostor User",
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("Conflict")))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already exists")));
    }

    @Test
    @DisplayName("Negative: Role escalation during registration is strictly thwarted; role forced to CITIZEN")
    void testRoleEscalationPrevention() throws Exception {
        RegisterRequest hackerAttempt = new RegisterRequest(
                "attacker@example.com",
                "HackerPassword99!",
                "Malicious User",
                null,
                "ADMIN" // Attempt to self-grant ADMIN
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hackerAttempt)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role", is("CITIZEN"))); // Role must remain CITIZEN

        User created = userRepository.findByEmail("attacker@example.com").orElseThrow();
        assertThat(created.getRole()).isEqualTo(Role.CITIZEN);
    }

    @Test
    @DisplayName("Negative: Registration with invalid email and short password fails with HTTP 400 Bad Request")
    void testRegisterValidationFailures() throws Exception {
        RegisterRequest badRequest = new RegisterRequest(
                "not-an-email",
                "short", // Less than 8 characters
                "", // Blank name
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Error")))
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").exists())
                .andExpect(jsonPath("$.validationErrors.fullName").exists());
    }

    // =========================================================================
    // 2. LOGIN TESTS (POSITIVE & NEGATIVE)
    // =========================================================================

    @Test
    @DisplayName("Positive: Login with valid credentials returns HTTP 200 and valid JWT")
    void testLoginSuccess() throws Exception {
        User citizen = new User("valid.citizen@example.com", passwordEncoder.encode("ValidPassword123!"), "Valid Citizen", Role.CITIZEN, null);
        userRepository.saveAndFlush(citizen);

        LoginRequest login = new LoginRequest("valid.citizen@example.com", "ValidPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.email", is("valid.citizen@example.com")))
                .andExpect(jsonPath("$.role", is("CITIZEN")));
    }

    @Test
    @DisplayName("Negative: Login with incorrect password returns HTTP 401 with safe generic message")
    void testLoginInvalidPasswordFails() throws Exception {
        User citizen = new User("user.auth@example.com", passwordEncoder.encode("RealPassword123"), "User Auth", Role.CITIZEN, null);
        userRepository.saveAndFlush(citizen);

        LoginRequest wrongPass = new LoginRequest("user.auth@example.com", "WrongPassword999");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPass)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("Negative: Login with non-existent email returns identical HTTP 401 safe message")
    void testLoginNonExistentEmailFails() throws Exception {
        LoginRequest unknown = new LoginRequest("nobody.exists@example.com", "SomePassword123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unknown)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    // =========================================================================
    // 3. JWT VALIDATION, CURRENT USER & LOGOUT TESTS
    // =========================================================================

    @Test
    @DisplayName("Positive: GET /api/auth/me returns authenticated citizen profile")
    void testGetCurrentUserProfile() throws Exception {
        User citizen = new User("profile.check@example.com", passwordEncoder.encode("Pass12345!"), "Profile Checker", Role.CITIZEN, "+919988776655");
        User saved = userRepository.saveAndFlush(citizen);

        String token = tokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole(), 3600000);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().intValue())))
                .andExpect(jsonPath("$.email", is("profile.check@example.com")))
                .andExpect(jsonPath("$.fullName", is("Profile Checker")))
                .andExpect(jsonPath("$.role", is("CITIZEN")))
                .andExpect(jsonPath("$.phoneNumber", is("+919988776655")));
    }

    @Test
    @DisplayName("Negative: Requesting protected endpoint without Bearer token returns HTTP 401")
    void testAccessProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @DisplayName("Negative: Expired JWT token is rejected with HTTP 401")
    void testExpiredJwtTokenRejected() throws Exception {
        User citizen = new User("expired.token@example.com", passwordEncoder.encode("Pass12345!"), "Expired User", Role.CITIZEN, null);
        User saved = userRepository.saveAndFlush(citizen);

        // Generate token expired 10 minutes ago
        String expiredToken = tokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole(), -600000);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("Negative: Tampered JWT token signature is rejected with HTTP 401")
    void testTamperedJwtTokenRejected() throws Exception {
        User citizen = new User("tamper.test@example.com", passwordEncoder.encode("Pass12345!"), "Tamper User", Role.CITIZEN, null);
        User saved = userRepository.saveAndFlush(citizen);

        String validToken = tokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole(), 3600000);
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "abcde";

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Positive: Logout records audit trail successfully")
    void testLogoutRecordsAudit() throws Exception {
        User citizen = new User("logout.user@example.com", passwordEncoder.encode("Pass12345!"), "Logout User", Role.CITIZEN, null);
        User saved = userRepository.saveAndFlush(citizen);

        String token = tokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole(), 3600000);

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Logged out successfully")));

        assertThat(auditLogRepository.findByActorIdOrderByCreatedAtDesc(saved.getId()))
                .anyMatch(log -> log.getAction().equals("LOGOUT"));
    }

    // =========================================================================
    // 4. RESOURCE-LEVEL AUTHORIZATION TESTS (CITIZEN OWNERSHIP & OFFICER DEPARTMENT SCOPE)
    // =========================================================================

    @Test
    @DisplayName("Resource Authorization: Citizen can access own application, but IDOR attempt on another citizen's application returns HTTP 403")
    void testCitizenOwnershipEnforcement() throws Exception {
        // Create Citizen A
        User citizenA = userRepository.saveAndFlush(new User("citizen.a@example.com", "hash", "Citizen A", Role.CITIZEN, null));
        String tokenA = tokenProvider.generateToken(citizenA.getId(), citizenA.getEmail(), citizenA.getRole(), 3600000);

        // Create Citizen B
        User citizenB = userRepository.saveAndFlush(new User("citizen.b@example.com", "hash", "Citizen B", Role.CITIZEN, null));
        String tokenB = tokenProvider.generateToken(citizenB.getId(), citizenB.getEmail(), citizenB.getRole(), 3600000);

        // Citizen A's application
        Application appA = applicationRepository.saveAndFlush(
                new Application("APP-A-101", citizenA, dlService, "{}", "en")
        );

        // 1. Citizen A accessing own application -> 200 OK
        mockMvc.perform(get("/api/auth/test/application/" + appA.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")))
                .andExpect(jsonPath("$.accessedByUserId", is(citizenA.getId().intValue())));

        // 2. Citizen B attempting IDOR access to Citizen A's application -> 403 FORBIDDEN
        mockMvc.perform(get("/api/auth/test/application/" + appA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }

    @Test
    @DisplayName("Resource Authorization: Officer can only access applications within assigned department")
    void testOfficerDepartmentRestriction() throws Exception {
        // Create Transport Officer (assigned to Transport Dept)
        User transportOfficer = userRepository.saveAndFlush(new User("officer.transport@example.com", "hash", "Transport Officer", Role.OFFICER, null));
        assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(transportOfficer, transportDept));
        String transportOfficerToken = tokenProvider.generateToken(transportOfficer.getId(), transportOfficer.getEmail(), transportOfficer.getRole(), 3600000);

        // Create Municipal Officer (assigned ONLY to Municipal Dept)
        User municipalOfficer = userRepository.saveAndFlush(new User("officer.municipal@example.com", "hash", "Municipal Officer", Role.OFFICER, null));
        assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(municipalOfficer, municipalDept));
        String municipalOfficerToken = tokenProvider.generateToken(municipalOfficer.getId(), municipalOfficer.getEmail(), municipalOfficer.getRole(), 3600000);

        // Application belongs to Transport Department (dlService)
        User citizen = userRepository.saveAndFlush(new User("citizen.app@example.com", "hash", "Citizen App", Role.CITIZEN, null));
        Application transportApp = applicationRepository.saveAndFlush(
                new Application("APP-TRANS-202", citizen, dlService, "{}", "en")
        );

        // 1. Transport Officer accesses Transport application -> 200 OK
        mockMvc.perform(get("/api/auth/test/application/" + transportApp.getId())
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")))
                .andExpect(jsonPath("$.role", is("OFFICER")));

        // 2. Municipal Officer attempts to access Transport application -> 403 FORBIDDEN
        mockMvc.perform(get("/api/auth/test/application/" + transportApp.getId())
                        .header("Authorization", "Bearer " + municipalOfficerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }

    @Test
    @DisplayName("Resource Authorization: ADMIN role has cross-department oversight access")
    void testAdminCrossDepartmentAccess() throws Exception {
        User admin = userRepository.saveAndFlush(new User("admin.system@example.com", "hash", "System Admin", Role.ADMIN, null));
        String adminToken = tokenProvider.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), 3600000);

        User citizen = userRepository.saveAndFlush(new User("citizen.admincheck@example.com", "hash", "Citizen Check", Role.CITIZEN, null));
        Application app = applicationRepository.saveAndFlush(
                new Application("APP-ADMIN-303", citizen, dlService, "{}", "en")
        );

        mockMvc.perform(get("/api/auth/test/application/" + app.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")))
                .andExpect(jsonPath("$.role", is("ADMIN")));
    }
}
