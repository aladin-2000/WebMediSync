package com.project.medisync.modules.facturation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


/**
 * Paiement d'abonnement effectué par un laboratoire.
 *
 * <p>Note : {@code laboratoireId} est stocké comme UUID simple (pas de @ManyToOne)
 * pour éviter la dépendance cyclique entre les modules Facturation et Profils.</p>
 */
@Entity
@Table(name = "paiement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;

    /**
     * Référence vers Laboratoire (module Profils).
     * Intentionnellement sans @ManyToOne pour respecter l'isolation modulaire.
     */
    @Column(name = "laboratoire_id", nullable = false, columnDefinition = "VARCHAR(36)")
    private String laboratoireId;

    @Column(name = "montant", nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    /** Exemples : TND, EUR, USD. */
    @Column(name = "devise", nullable = false, length = 10)
    private String devise;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutPaiementEnum statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "methode", nullable = false, length = 20)
    private MethodePaiementEnum methode;

    /** Référence externe (numéro de transaction bancaire, etc.). */
    @Column(name = "reference_externe", length = 100)
    private String referenceExterne;

    @Column(name = "periode_debut", nullable = false)
    private LocalDate periodeDebut;

    @Column(name = "periode_fin", nullable = false)
    private LocalDate periodeFin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
