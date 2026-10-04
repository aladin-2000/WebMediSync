package com.project.medisync.modules.profils.bootstrap;

import com.project.medisync.modules.auth.entity.RoleEnum;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.modules.profils.entity.StatutAbonnementEnum;
import com.project.medisync.modules.profils.repository.LaboratoireRepository;
import com.project.medisync.modules.profils.service.LaboratoireService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Insère au démarrage une liste de référence de laboratoires pharmaceutiques opérant
 * en Tunisie (fabricants locaux + filiales de multinationales), utilisée notamment
 * pour le sélecteur de laboratoire à l'auto-inscription d'un délégué.
 *
 * <p><b>Important</b> : cette liste est établie à partir de connaissances générales et
 * n'a pas été vérifiée auprès d'un registre officiel — à corriger/compléter via
 * l'administration si nécessaire.</p>
 *
 * Ne fait rien si LABORATOIRE_BOOTSTRAP_PASSWORD n'est pas défini.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LaboratoireBootstrap implements ApplicationRunner {

    private final UserService           userService;
    private final LaboratoireService    laboratoireService;
    private final LaboratoireRepository laboratoireRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${laboratoire.bootstrap.password:}")
    private String bootstrapPassword;

    private record LaboSeed(String slug, String nom, String adresse) {}

    private static final List<LaboSeed> LABORATOIRES = List.of(
            new LaboSeed("adwya", "Adwya", "Zone Industrielle, Ben Arous"),
            new LaboSeed("saiph", "SAIPH", "Route de Tunis, Nouvelle Medina, Ben Arous"),
            new LaboSeed("unimed", "UNIMED", "Zone Industrielle Sidi Salem, Sousse"),
            new LaboSeed("opalia", "Opalia Pharma", "Zone Industrielle El Agba, Tunis"),
            new LaboSeed("siphat", "SIPHAT", "Route de Tunis Km 18, Ben Arous"),
            new LaboSeed("teriak", "Teriak", "Zone Industrielle El Fejja, Mornaguia"),
            new LaboSeed("unipharm", "UNIPHARM", "Zone Industrielle, Ben Arous"),
            new LaboSeed("medis", "Groupe Medis", "Zone Industrielle El Fejja, Mornaguia"),
            new LaboSeed("sanofi", "Sanofi Tunisie", "Les Berges du Lac, Tunis"),
            new LaboSeed("novartis", "Novartis Tunisie", "Les Berges du Lac, Tunis"),
            new LaboSeed("pfizer", "Pfizer Tunisie", "Centre Urbain Nord, Tunis"),
            new LaboSeed("gsk", "GSK Tunisie", "Les Berges du Lac, Tunis"),
            new LaboSeed("roche", "Roche Tunisie", "Les Berges du Lac, Tunis"),
            new LaboSeed("servier", "Servier Tunisie", "Les Berges du Lac, Tunis"),
            new LaboSeed("msd", "MSD Tunisie", "Les Berges du Lac, Tunis"),
            new LaboSeed("bayer", "Bayer Tunisie", "Centre Urbain Nord, Tunis"),
            new LaboSeed("sandoz", "Sandoz Tunisie", "Les Berges du Lac, Tunis")
    );

    @Override
    public void run(ApplicationArguments args) {
        if (bootstrapPassword == null || bootstrapPassword.isBlank()) {
            return;
        }

        LocalDate debut = LocalDate.now();
        LocalDate fin = debut.plusYears(1);

        for (LaboSeed seed : LABORATOIRES) {
            if (laboratoireRepository.existsByNom(seed.nom())) {
                continue;
            }

            String email = "labo-" + seed.slug() + "@medisync.tn";
            User user;
            if (userService.existsByEmail(email)) {
                user = userService.getByEmail(email);
            } else {
                user = userService.save(User.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode(bootstrapPassword))
                        .role(RoleEnum.LABO)
                        .mustChangePassword(false)
                        .emailVerified(true)
                        .build());
            }

            laboratoireService.create(user.getId(), seed.nom(), seed.adresse(), null,
                    StatutAbonnementEnum.ACTIF, debut, fin);
            log.info("[Profils] Laboratoire de référence créé : {}", seed.nom());
        }
    }
}
