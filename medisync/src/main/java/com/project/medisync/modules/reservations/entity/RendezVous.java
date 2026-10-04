package com.project.medisync.modules.reservations.entity;

import com.project.medisync.modules.disponibilites.entity.Creneau;
import com.project.medisync.modules.profils.entity.Delegue;
import com.project.medisync.modules.profils.entity.Laboratoire;
import com.project.medisync.modules.profils.entity.Medecin;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Rendez-vous entre un délégué médical et un médecin sur un créneau donné.
 *
 * <p><b>Règles métier :</b>
 * <ul>
 *   <li>Un délégué ne peut pas avoir deux rendez-vous au même moment.</li>
 *   <li>Un créneau ne peut être réservé qu'une seule fois.</li>
 *   <li>Si le médecin annule, {@code motifAnnulation} est obligatoire.</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "rendez_vous")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creneau_id", nullable = false)
    private Creneau creneau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegue_id", nullable = false)
    private Delegue delegue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    /**
     * Snapshot immutable du laboratoire du délégué au moment de la réservation.
     * Sert de base à la facturation par laboratoire ; ne doit jamais être modifié
     * après création, même si le délégué change ensuite de laboratoire.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratoire_id", updatable = false)
    private Laboratoire laboratoire;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutRendezVousEnum statut = StatutRendezVousEnum.RESERVE;

    /** Renseigné uniquement si le rendez-vous a été annulé. */
    @Enumerated(EnumType.STRING)
    @Column(name = "annule_par", length = 10)
    private AnnuleParEnum annulePar;

    /** Obligatoire si {@code annulePar == MEDECIN}. */
    @Column(name = "motif_annulation", columnDefinition = "TEXT")
    private String motifAnnulation;

    /**
     * Le statut ne passe à REALISE que lorsque les deux confirmations sont à true
     * (évite qu'une seule partie déclare le RDV réalisé sans l'accord de l'autre).
     */
    @Column(name = "realise_par_delegue", nullable = false)
    @Builder.Default
    private Boolean realiseParDelegue = false;

    @Column(name = "realise_par_medecin", nullable = false)
    @Builder.Default
    private Boolean realiseParMedecin = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
