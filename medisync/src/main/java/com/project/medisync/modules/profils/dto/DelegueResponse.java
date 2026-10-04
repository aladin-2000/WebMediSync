package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.Delegue;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DelegueResponse {

    private String          id;
    private String          userId;
    private String          laboratoireId;
    private String          laboName;
    private String        nom;
    private String        prenom;
    private String        telephone;
    private String        photoUrl;
    private Float         scoreFiabilite;
    private Boolean       isActive;
    private LocalDateTime createdAt;

    public static DelegueResponse from(Delegue delegue) {
        return DelegueResponse.builder()
                .id(delegue.getId())
                .userId(delegue.getUser().getId())
                .laboratoireId(delegue.getLaboratoire() != null ? delegue.getLaboratoire().getId() : null)
                .laboName(delegue.getLaboName())
                .nom(delegue.getNom())
                .prenom(delegue.getPrenom())
                .telephone(delegue.getTelephone())
                .photoUrl(delegue.getPhotoUrl())
                .scoreFiabilite(delegue.getScoreFiabilite())
                .isActive(delegue.getUser().getIsActive())
                .createdAt(delegue.getCreatedAt())
                .build();
    }
}
