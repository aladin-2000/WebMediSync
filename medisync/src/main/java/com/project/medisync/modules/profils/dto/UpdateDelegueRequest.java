package com.project.medisync.modules.profils.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Requête de mise à jour du profil d'un délégué par lui-même (pas de userId/laboratoireId :
 * un délégué ne peut pas se réattribuer un autre laboratoire via cette route).
 */
@Getter
@Setter
@NoArgsConstructor
public class UpdateDelegueRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire.")
    private String prenom;

    private String telephone;
}
