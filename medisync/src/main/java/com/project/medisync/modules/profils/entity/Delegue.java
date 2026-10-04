package com.project.medisync.modules.profils.entity;

import com.project.medisync.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Délégué médical rattaché à un laboratoire pharmaceutique.
 * Il consulte les disponibilités des médecins et réserve des créneaux de visite.
 */
@Entity
@Table(name = "delegue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delegue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    // EAGER : DelegueResponse expose isActive (delegue.getUser().getIsActive()), lu hors
    // transaction dans les controllers — un fetch LAZY y déclenche une LazyInitializationException.
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** Optionnel : un délégué peut ne pas être encore rattaché à un laboratoire. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratoire_id", nullable = true)
    private Laboratoire laboratoire;

    /**
     * Nom du laboratoire saisi librement par le délégué à l'inscription, quand celui-ci
     * n'est pas encore inscrit sur MediSync (donc pas de {@link #laboratoire} rattachable).
     * Provisoire pour le MVP — à terme, remplacé par un vrai rattachement une fois le
     * laboratoire inscrit.
     */
    @Column(name = "labo_name", length = 150)
    private String laboName;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "telephone", length = 30)
    private String telephone;

    /** URL Cloudinary — null si aucune photo n'a été uploadée. */
    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    /**
     * Score de fiabilité du délégué, calculé en fonction de ses rendez-vous.
     * Compris entre 0 et 100.
     */
    @Column(name = "score_fiabilite")
    @Builder.Default
    private Float scoreFiabilite = 100f;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
