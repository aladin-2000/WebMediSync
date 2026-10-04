package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.SpecialiteEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO utilisé par l'admin pour créer en un seul appel
 * le compte (email + mot de passe) ET le profil médecin associé.
 */
@Getter
@Setter
@NoArgsConstructor
public class CreateMedecinCompletRequest {

    @NotBlank(message = "L'email est obligatoire.")
    @Email(message = "L'email doit être valide.")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    private String password;

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
