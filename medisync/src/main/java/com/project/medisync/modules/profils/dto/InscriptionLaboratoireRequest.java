package com.project.medisync.modules.profils.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO d'auto-inscription d'un laboratoire (web uniquement). Crée le compte (non vérifié)
 * et le profil, avec un abonnement d'essai par défaut. Devient actif dès que l'email
 * est vérifié.
 */
@Getter
@Setter
@NoArgsConstructor
public class InscriptionLaboratoireRequest {

    @NotBlank(message = "L'email est obligatoire.")
    @Email(message = "L'email doit être valide.")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères.")
    private String password;

    @NotBlank(message = "Le nom du laboratoire est obligatoire.")
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire.")
    private String adresse;

    private String telephone;
}
