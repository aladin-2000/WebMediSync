package com.project.medisync.modules.auth.security;

import com.project.medisync.modules.auth.entity.RoleEnum;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crée le tout premier compte ADMIN au démarrage de l'application, s'il n'existe pas encore.
 * Évite d'avoir à exposer un endpoint public pour créer le premier admin.
 *
 * Ne fait rien si ADMIN_BOOTSTRAP_PASSWORD n'est pas défini (comportement par défaut,
 * sûr en production tant qu'on ne configure pas explicitement cette variable).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap.email:admin@medisync.tn}")
    private String adminEmail;

    @Value("${admin.bootstrap.password:}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            return;
        }
        if (userService.existsByEmail(adminEmail)) {
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(RoleEnum.ADMIN)
                .emailVerified(true)
                .build();
        userService.save(admin);
        log.info("[Auth] Admin de démarrage créé : {}", adminEmail);
    }
}
