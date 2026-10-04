package com.project.medisync.modules.profils.bootstrap;

import com.project.medisync.modules.auth.entity.RoleEnum;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.modules.profils.service.DelegueService;
import com.project.medisync.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Crée 5 comptes Délégué de test au démarrage de l'application, s'ils n'existent pas encore.
 * Permet de tester l'app immédiatement sans passer par les 2 appels API (création du user + du profil délégué).
 *
 * Ne fait rien si TEST_DELEGUE_PASSWORD n'est pas défini (comportement par défaut,
 * sûr en production tant qu'on ne configure pas explicitement cette variable).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TestDelegueBootstrap implements ApplicationRunner {

    private final UserService    userService;
    private final DelegueService delegueService;
    private final PasswordEncoder passwordEncoder;

    @Value("${test.delegue.password:}")
    private String deleguePassword;

    private record DelegueSeed(String email, String nom, String prenom, String telephone) {}

    private static final List<DelegueSeed> DELEGUES = List.of(
            new DelegueSeed("mehdi.larbi@medisync.tn", "Larbi", "Mehdi", "+216 22 300 201"),
            new DelegueSeed("sarra.jendoubi@medisync.tn", "Jendoubi", "Sarra", "+216 22 300 202"),
            new DelegueSeed("wassim.khemiri@medisync.tn", "Khemiri", "Wassim", "+216 22 300 203"),
            new DelegueSeed("nour.ayari@medisync.tn", "Ayari", "Nour", "+216 22 300 204"),
            new DelegueSeed("rania.fekih@medisync.tn", "Fekih", "Rania", "+216 22 300 205")
    );

    @Override
    public void run(ApplicationArguments args) {
        if (deleguePassword == null || deleguePassword.isBlank()) {
            return;
        }

        for (DelegueSeed seed : DELEGUES) {
            User user;
            if (userService.existsByEmail(seed.email())) {
                user = userService.getByEmail(seed.email());
            } else {
                user = userService.save(User.builder()
                        .email(seed.email())
                        .passwordHash(passwordEncoder.encode(deleguePassword))
                        .role(RoleEnum.DELEGUE)
                        .mustChangePassword(false)
                        .emailVerified(true)
                        .build());
                log.info("[Profils] Utilisateur délégué de test créé : {}", seed.email());
            }

            try {
                delegueService.getByUserId(user.getId());
            } catch (ResourceNotFoundException e) {
                delegueService.create(user.getId(), null, seed.nom(), seed.prenom(), seed.telephone());
                log.info("[Profils] Profil délégué de test créé pour {}", seed.email());
            }
        }
    }
}
