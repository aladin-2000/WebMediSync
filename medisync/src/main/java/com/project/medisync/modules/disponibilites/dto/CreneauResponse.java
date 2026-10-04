package com.project.medisync.modules.disponibilites.dto;

import com.project.medisync.modules.disponibilites.entity.Creneau;
import com.project.medisync.modules.disponibilites.entity.StatutCreneauEnum;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreneauResponse(
        String              id,
        String              medecinId,
        LocalDate         date,
        LocalTime         heureDebut,
        LocalTime         heureFin,      // heureDebut + 15 min — calculé à la volée
        StatutCreneauEnum statut
) {
    public static CreneauResponse from(Creneau c) {
        return new CreneauResponse(
                c.getId(),
                c.getMedecinId(),
                c.getDate(),
                c.getHeureDebut(),
                c.getHeureDebut().plusMinutes(15),
                c.getStatut()
        );
    }
}
