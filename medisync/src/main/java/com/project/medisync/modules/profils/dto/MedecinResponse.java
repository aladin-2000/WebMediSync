package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.Medecin;
import com.project.medisync.modules.profils.entity.SpecialiteEnum;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MedecinResponse {

    private String          id;
    private String        userId;
    private String        nom;
    private String        prenom;
    private SpecialiteEnum specialite;
    private String        adresseCabinet;
    private String        telephone;
    private Double        latitude;
    private Double        longitude;
    private String        photoUrl;
    private Float         scoreFiabiliteMin;
    private Boolean       valide;
    private String        regionId;
    private String        regionNom;
    private LocalDateTime createdAt;

    public static MedecinResponse from(Medecin medecin) {
        return MedecinResponse.builder()
                .id(medecin.getId())
                .userId(medecin.getUser().getId())
                .nom(medecin.getNom())
                .prenom(medecin.getPrenom())
                .specialite(medecin.getSpecialite())
                .adresseCabinet(medecin.getAdresseCabinet())
                .telephone(medecin.getTelephone())
                .latitude(medecin.getLatitude())
                .longitude(medecin.getLongitude())
                .photoUrl(medecin.getPhotoUrl())
                .scoreFiabiliteMin(medecin.getScoreFiabiliteMin())
                .valide(medecin.getValide())
                .regionId(medecin.getRegion() != null ? medecin.getRegion().getId() : null)
                .regionNom(medecin.getRegion() != null ? medecin.getRegion().getNom() : null)
                .createdAt(medecin.getCreatedAt())
                .build();
    }
}
