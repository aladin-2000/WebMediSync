package com.project.medisync.modules.profils.dto;

import com.project.medisync.modules.profils.entity.StatutAbonnementEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CreateLaboratoireRequest {

    @NotNull(message = "L'identifiant utilisateur est obligatoire.")
    private String userId;

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
