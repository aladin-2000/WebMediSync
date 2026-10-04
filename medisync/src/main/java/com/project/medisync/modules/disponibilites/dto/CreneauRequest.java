package com.project.medisync.modules.disponibilites.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreneauRequest(

        @NotNull(message = "La date est obligatoire.")
        LocalDate date,

        @NotNull(message = "L'heure de début est obligatoire.")
        LocalTime heureDebut
) {}
