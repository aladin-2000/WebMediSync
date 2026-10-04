package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.Laboratoire;
import com.project.medisync.modules.profils.entity.StatutAbonnementEnum;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class LaboratoireResponse {

    private String                 id;
    private String               userId;
    private String               nom;
    private String               adresse;
    private String               telephone;
    private StatutAbonnementEnum statutAbonnement;
    private LocalDate            dateDebutAbonnement;
    private LocalDate            dateFinAbonnement;
    private String                 dernierPaiementId;
    private Boolean               isActive;
    private LocalDateTime        createdAt;

    public static LaboratoireResponse from(Laboratoire labo) {
        return LaboratoireResponse.builder()
                .id(labo.getId())
                .userId(labo.getUser().getId())
                .nom(labo.getNom())
                .adresse(labo.getAdresse())
                .telephone(labo.getTelephone())
                .statutAbonnement(labo.getStatutAbonnement())
                .dateDebutAbonnement(labo.getDateDebutAbonnement())
                .dateFinAbonnement(labo.getDateFinAbonnement())
                .dernierPaiementId(labo.getDernierPaiementId())
                .isActive(labo.getUser().getIsActive())
                .createdAt(labo.getCreatedAt())
                .build();
    }
}
