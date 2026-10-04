package com.project.medisync.modules.reservations.service;

import com.project.medisync.modules.reservations.entity.RendezVous;

import java.time.LocalDate;
import java.util.List;

/**
 * Interface publique du module Réservations.
 *
 * <p><b>Règles métier :</b>
 * <ul>
 *   <li>Un créneau ne peut être réservé qu'une seule fois.</li>
 *   <li>Un délégué ne peut pas avoir deux rendez-vous au même moment.</li>
 *   <li>Si le médecin annule, {@code motifAnnulation} est obligatoire.</li>
 * </ul>
 * </p>
 */
public interface RendezVousService {

    RendezVous reserver(String creneauId, String delegueId, String medecinId);

    RendezVous getById(String id);

    List<RendezVous> getByDelegue(String delegueId);

    /** RDV d'un délégué pour un jour donné. */
    List<RendezVous> getByDelegueEtJour(String delegueId, LocalDate date);

    /** RDV d'un délégué pour la semaine (lundi → dimanche) contenant lundiDeLaSemaine. */
    List<RendezVous> getByDelegueEtSemaine(String delegueId, LocalDate lundiDeLaSemaine);

    List<RendezVous> getByMedecin(String medecinId);

    /** RDV d'un médecin pour un jour donné. */
    List<RendezVous> getByMedecinEtJour(String medecinId, LocalDate date);

    /** RDV d'un médecin pour la semaine (lundi → dimanche) contenant lundiDeLaSemaine. */
    List<RendezVous> getByMedecinEtSemaine(String medecinId, LocalDate lundiDeLaSemaine);

    /** Annulation par le délégué. */
    RendezVous annulerParDelegue(String rendezVousId);

    /** Annulation par le médecin — motif obligatoire. */
    RendezVous annulerParMedecin(String rendezVousId, String motifAnnulation);

    /**
     * Confirmation du délégué que le RDV a été réalisé.
     * Le statut ne passe à REALISE (et une Visite n'est créée) que si le médecin a aussi confirmé.
     */
    RendezVous realiserParDelegue(String rendezVousId);

    /**
     * Confirmation du médecin que le RDV a été réalisé.
     * Le statut ne passe à REALISE (et une Visite n'est créée) que si le délégué a aussi confirmé.
     */
    RendezVous realiserParMedecin(String rendezVousId);

    /** Constaté par le délégué : le médecin ne s'est pas présenté. */
    RendezVous marquerAbsentMedecin(String rendezVousId);

    /** Constaté par le médecin : le délégué ne s'est pas présenté. */
    RendezVous marquerAbsentDelegue(String rendezVousId);

    /**
     * Liste les rendez-vous en statut CONFLIT (une partie a confirmé réalisé pendant que
     * l'autre marquait absent/annulait), pour investigation manuelle.
     */
    List<RendezVous> getConflits();

    /**
     * Auto-valide en REALISE les RDV avec une seule confirmation, 24h après l'heure du RDV
     * (silence de l'autre partie = présomption que la visite a bien eu lieu). Appelé par le job planifié.
     */
    void resoudreConfirmationsPartiellesExpirees();
}
