package com.project.medisync.modules.reservations.entity;

/**
 * Statut d'un rendez-vous entre un délégué médical et un médecin.
 */
public enum StatutRendezVousEnum {
    RESERVE,
    ANNULE,
    REALISE,
    ABSENT_MEDECIN,
    ABSENT_DELEGUE,
    /**
     * Une partie a confirme que le rendez-vous a ete realise (realiseParMedecin ou
     * realiseParDelegue = true) pendant que l'autre le marque absent ou l'annule.
     * Etat terminal nécessitant une investigation manuelle (cf. GET /api/rendezvous/conflits).
     */
    CONFLIT
}
