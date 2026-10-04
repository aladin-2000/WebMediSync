package com.project.medisync.modules.reservations.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Représente la requête de réservation d'un créneau par un délégué médical avec un médecin.
 */
public record ReservationRequest(
        /** Identifiant unique du créneau à réserver. */
        @NotNull(message = "L'identifiant du créneau est obligatoire.")
        String creneauId,

        /** Identifiant unique du délégué effectuant la réservation. */
        @NotNull(message = "L'identifiant du délégué est obligatoire.")
        String delegueId,

        /** Identifiant unique du médecin concerné par la réservation. */
        @NotNull(message = "L'identifiant du médecin est obligatoire.")
        String medecinId
) {}
