package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.SpecialiteEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO d'auto-inscription d'un médecin. Crée le compte (non vérifié) et le profil
 * (non validé) — le médecin doit ensuite vérifier son email, puis attendre la
 * validation d'un administrateur avant d'apparaître dans les recherches.
 */
@Getter
@Setter
@NoArgsConstructor
public class InscriptionMedecinRequest {

    @NotBlank(message = "L'email est obligatoire.")
    @Email(message = "L'email doit être valide.")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères.")
    private String password;

    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire.")
    private String prenom;

    @NotNull(message = "La spécialité est obligatoire.")
    private SpecialiteEnum specialite;

    @NotBlank(message = "L'adresse du cabinet est obligatoire.")
    private String adresseCabinet;

    @NotBlank(message = "La région est obligatoire.")
    private String regionId;

    private String telephone;
    private Double latitude;
    private Double longitude;
}
