package com.licensing.platform.config;

import com.licensing.platform.model.Department;
import com.licensing.platform.model.OfficerDepartmentAssignment;
import com.licensing.platform.model.User;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.DepartmentRepository;
import com.licensing.platform.repository.OfficerDepartmentAssignmentRepository;
import com.licensing.platform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final OfficerDepartmentAssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           OfficerDepartmentAssignmentRepository assignmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Admin
        if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = new User(
                    "admin@licensing.gov.in",
                    passwordEncoder.encode("Admin@123"),
                    "System Administrator",
                    Role.ADMIN,
                    "9999999999"
            );
            userRepository.save(admin);
            log.info("Initialized default administrator account: admin@licensing.gov.in");
        }

        // 2. Transport Officer
        if (userRepository.findByEmail("officer.transport@licensing.gov.in").isEmpty()) {
            User transportOfficer = new User(
                    "officer.transport@licensing.gov.in",
                    passwordEncoder.encode("Officer@123"),
                    "Transport Adjudication Officer",
                    Role.OFFICER,
                    "9876543211"
            );
            userRepository.save(transportOfficer);

            departmentRepository.findByCode("DEPT_TRANSPORT").ifPresent(dept -> {
                assignmentRepository.save(new OfficerDepartmentAssignment(transportOfficer, dept));
            });
            log.info("Initialized default Transport Officer account: officer.transport@licensing.gov.in");
        }

        // 3. Municipal Officer
        if (userRepository.findByEmail("officer.municipal@licensing.gov.in").isEmpty()) {
            User municipalOfficer = new User(
                    "officer.municipal@licensing.gov.in",
                    passwordEncoder.encode("Officer@123"),
                    "Municipal Licensing Officer",
                    Role.OFFICER,
                    "9876543212"
            );
            userRepository.save(municipalOfficer);

            departmentRepository.findByCode("DEPT_MUNICIPAL").ifPresent(dept -> {
                assignmentRepository.save(new OfficerDepartmentAssignment(municipalOfficer, dept));
            });
            log.info("Initialized default Municipal Officer account: officer.municipal@licensing.gov.in");
        }

        // 4. Citizen
        if (userRepository.findByEmail("citizen.tester@licensing.gov.in").isEmpty()) {
            User citizen = new User(
                    "citizen.tester@licensing.gov.in",
                    passwordEncoder.encode("Citizen@123"),
                    "Ramesh Kumar (Citizen)",
                    Role.CITIZEN,
                    "9876543210"
            );
            userRepository.save(citizen);
            log.info("Initialized default Citizen account: citizen.tester@licensing.gov.in");
        }
    }
}
