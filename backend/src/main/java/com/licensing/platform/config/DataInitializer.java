package com.licensing.platform.config;

import com.licensing.platform.model.User;
import com.licensing.platform.model.enums.Role;
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
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
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
    }
}
