package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.SpecialiteEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateMedecinRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire.")
    private String prenom;

    @NotNull(message = "La spécialité est obligatoire.")
    private SpecialiteEnum specialite;

    private String adresseCabinet;
    private String telephone;
    private Double latitude;
    private Double longitude;
    private Float  scoreFiabiliteMin;
    private String regionId;
}
