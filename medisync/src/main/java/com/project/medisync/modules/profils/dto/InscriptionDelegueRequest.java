package com.project.medisync.modules.profils.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO d'auto-inscription d'un délégué médical. Crée le compte (non vérifié) et le
 * profil. Rattaché soit à un laboratoire déjà inscrit sur MediSync ({@code laboratoireId}),
 * soit — provisoirement pour le MVP — au nom de laboratoire saisi librement
 * ({@code laboName}) quand celui-ci n'a pas encore de compte. Devient actif dès que
 * l'email est vérifié.
 */
@Getter
@Setter
@NoArgsConstructor
public class InscriptionDelegueRequest {

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

    /** Renseigné si le laboratoire est déjà inscrit sur MediSync. */
    private String laboratoireId;

    /** Renseigné si le laboratoire n'est pas encore inscrit — voir {@link #laboratoireId}. */
    private String laboName;

    private String telephone;
}
