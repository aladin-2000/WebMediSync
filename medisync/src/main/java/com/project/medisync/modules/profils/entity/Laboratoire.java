package com.project.medisync.modules.profils.entity;

import com.project.medisync.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
/**
 * Laboratoire pharmaceutique souscrivant à la plateforme MediSync.
 *
 * <p>{@code dernierPaiementId} est stocké comme UUID simple (sans @ManyToOne vers Paiement)
 * pour respecter l'isolation modulaire : le module Profils ne doit pas dépendre
 * du module Facturation au niveau JPA.</p>
 */
@Entity
@Table(name = "laboratoire")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Laboratoire {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    // EAGER : LaboratoireResponse expose isActive (labo.getUser().getIsActive()), lu hors
    // transaction dans les controllers — un fetch LAZY y déclenche une LazyInitializationException.
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "nom", nullable = false, length = 200)
    private String nom;

    @Column(name = "adresse", nullable = false, length = 500)
    private String adresse;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_abonnement", nullable = false, length = 20)
    private StatutAbonnementEnum statutAbonnement;

    @Column(name = "date_debut_abonnement", nullable = false)
    private LocalDate dateDebutAbonnement;

    @Column(name = "date_fin_abonnement", nullable = false)
    private LocalDate dateFinAbonnement;

    /**
     * Référence vers le dernier paiement validé (module Facturation).
     * UUID uniquement — pas de @ManyToOne pour préserver l'isolation modulaire.
     */
    @Column(name = "dernier_paiement_id", columnDefinition = "VARCHAR(36)")
    private String dernierPaiementId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
