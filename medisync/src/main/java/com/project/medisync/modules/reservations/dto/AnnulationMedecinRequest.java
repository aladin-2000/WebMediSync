package com.project.medisync.modules.reservations.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Représente la requête d'annulation d'un rendez-vous par un médecin, contenant le motif obligatoire.
 */
public record AnnulationMedecinRequest(
        /** Motif justifiant l'annulation par le médecin. */
        @NotBlank(message = "Le motif d'annulation est obligatoire.")
        String motifAnnulation
) {}
