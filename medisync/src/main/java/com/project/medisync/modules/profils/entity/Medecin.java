package com.project.medisync.modules.profils.entity;

import com.project.medisync.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Médecin référencé sur la plateforme MediSync.
 * Il publie ses disponibilités hebdomadaires et reçoit les visites de délégués médicaux.
 */
@Entity
@Table(name = "medecin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(name = "specialite", nullable = false, length = 50)
    private SpecialiteEnum specialite;

    @Column(name = "adresse_cabinet", nullable = false ,length = 500)
    private String adresseCabinet;

    // EAGER : MedecinResponse expose regionNom (medecin.getRegion().getNom()), lu hors
    // transaction dans les controllers — un fetch LAZY y déclenche une LazyInitializationException.
    // Optionnel : les médecins existants avant l'ajout de ce champ n'en ont pas encore.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "region_id")
    private Region region;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    /** URL Cloudinary — null si aucune photo n'a été uploadée. */
    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    /**
     * Score de fiabilité minimum requis pour qu'un délégué puisse réserver.
     * Compris entre 0 et 100.
     */
    @Column(name = "score_fiabilite_min")
    @Builder.Default
    private Float scoreFiabiliteMin = 0f;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Faux uniquement pour un médecin auto-inscrit en attente de validation par un admin.
     * Les médecins créés par un admin (creerMedecinComplet) sont valides par défaut.
     * Un médecin non valide n'apparaît pas dans les résultats de recherche du délégué.
     */
    @Column(name = "valide", nullable = false)
    @Builder.Default
    private Boolean valide = true;

    @Column(name = "supprime", nullable = false)
    @Builder.Default
    private Boolean supprime = false;

}
