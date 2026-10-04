package com.project.medisync.modules.disponibilites.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreneauGenerationRequest(

        @NotNull(message = "La date de début est obligatoire.")
        LocalDate dateDebut,

        @NotNull(message = "La date de fin est obligatoire.")
        LocalDate dateFin,

        @NotNull(message = "L'heure de début est obligatoire.")
        LocalTime heureDebut,

        @NotNull(message = "L'heure de fin est obligatoire.")
        LocalTime heureFin
) {}
