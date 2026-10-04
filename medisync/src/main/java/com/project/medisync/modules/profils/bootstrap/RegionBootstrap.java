package com.project.medisync.modules.profils.bootstrap;

import com.project.medisync.modules.profils.entity.Region;
import com.project.medisync.modules.profils.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Insère au démarrage les 24 régions (gouvernorats) de Tunisie, utilisées pour
 * rattacher un médecin à une région et permettre au délégué de filtrer sa
 * recherche par région. Contrairement aux autres bootstraps de ce module, ne crée
 * aucun compte utilisateur — c'est de la pure donnée de référence, donc pas de mot
 * de passe requis pour l'activer, et elle tourne à chaque démarrage (idempotent).
 *
 * <p>{@code @Order(1)} : doit s'exécuter avant {@code TestMedecinBootstrap}, qui
 * rattache les médecins de test à une région.</p>
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class RegionBootstrap implements ApplicationRunner {

    private final RegionRepository regionRepository;

    private static final List<String> REGIONS = List.of(
            "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
            "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
            "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
            "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
    );

    @Override
    public void run(ApplicationArguments args) {
        for (String nom : REGIONS) {
            if (regionRepository.existsByNom(nom)) {
                continue;
            }
            regionRepository.save(Region.builder().nom(nom).build());
            log.info("[Profils] Région de référence créée : {}", nom);
        }
    }
}
