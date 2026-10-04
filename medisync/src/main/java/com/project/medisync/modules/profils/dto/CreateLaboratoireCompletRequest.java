package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.StatutAbonnementEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * DTO utilisé par un admin pour créer en un seul appel le compte (email + mot de passe)
 * et le profil laboratoire.
 */
@Getter
@Setter
@NoArgsConstructor
public class CreateLaboratoireCompletRequest {

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

    @NotNull(message = "Le statut d'abonnement est obligatoire.")
    private StatutAbonnementEnum statutAbonnement;

    @NotNull(message = "La date de début d'abonnement est obligatoire.")
    private LocalDate dateDebutAbonnement;

    @NotNull(message = "La date de fin d'abonnement est obligatoire.")
    private LocalDate dateFinAbonnement;
}
