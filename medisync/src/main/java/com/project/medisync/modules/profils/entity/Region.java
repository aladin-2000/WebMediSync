package com.project.medisync.modules.profils.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Région (gouvernorat) de Tunisie — table de référence utilisée pour rattacher un
 * médecin à une région et permettre au délégué de filtrer sa recherche par région.
 * Alimentée au démarrage par {@code RegionBootstrap}, jamais créée via l'UI.
 */
@Entity
@Table(name = "region", uniqueConstraints = @UniqueConstraint(name = "uk_region_nom", columnNames = "nom"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @Column(name = "nom", nullable = false, unique = true, length = 100)
    private String nom;
}
