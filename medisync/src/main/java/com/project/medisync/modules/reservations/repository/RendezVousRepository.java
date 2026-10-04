package com.project.medisync.modules.reservations.repository;

import com.project.medisync.modules.reservations.entity.RendezVous;
import com.project.medisync.modules.reservations.entity.StatutRendezVousEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, String> {

    List<RendezVous> findByDelegueId(String delegueId);

    /** RDV d'un délégué pour un jour donné (via la date du créneau lié). */
    List<RendezVous> findByDelegueIdAndCreneau_Date(String delegueId, java.time.LocalDate date);

    /** RDV d'un délégué sur une période donnée (via la date du créneau lié). */
    List<RendezVous> findByDelegueIdAndCreneau_DateBetween(
            String delegueId, java.time.LocalDate dateDebut, java.time.LocalDate dateFin);

    List<RendezVous> findByMedecinId(String medecinId);

    /** RDV d'un médecin pour un jour donné (via la date du créneau lié). */
    List<RendezVous> findByMedecinIdAndCreneau_Date(String medecinId, java.time.LocalDate date);

    /** RDV d'un médecin sur une période donnée (via la date du créneau lié). */
    List<RendezVous> findByMedecinIdAndCreneau_DateBetween(
            String medecinId, java.time.LocalDate dateDebut, java.time.LocalDate dateFin);

    /** Vérifie qu'un créneau n'est pas déjà réservé. */
    boolean existsByCreneauIdAndStatutNot(String creneauId, StatutRendezVousEnum statut);

    /**
     * Vérifie le chevauchement horaire pour un délégué :
     * un délégué ne peut pas avoir deux RDV au même moment.
     */
    @Query("""
            SELECT COUNT(r) > 0 FROM RendezVous r
            WHERE r.delegue.id = :delegueId
              AND r.creneau.date = (SELECT c.date FROM Creneau c WHERE c.id = :creneauId)
              AND r.creneau.heureDebut = (SELECT c.heureDebut FROM Creneau c WHERE c.id = :creneauId)
              AND r.statut <> 'ANNULE'
            """)
    boolean existsByDelegueConflict(@Param("delegueId") String delegueId,
                                    @Param("creneauId") String creneauId);

    /**
     * Vérifie qu'un délégué n'a pas déjà un RDV actif avec ce médecin le même jour :
     * un délégué ne peut réserver qu'une seule visite par jour chez un même médecin.
     */
    @Query("""
            SELECT COUNT(r) > 0 FROM RendezVous r
            WHERE r.delegue.id = :delegueId
              AND r.medecin.id = :medecinId
              AND r.creneau.date = (SELECT c.date FROM Creneau c WHERE c.id = :creneauId)
              AND r.statut <> 'ANNULE'
            """)
    boolean existsByDelegueEtMedecinMemeJour(@Param("delegueId") String delegueId,
                                             @Param("medecinId") String medecinId,
                                             @Param("creneauId") String creneauId);

    /**
     * RDV toujours RESERVE, que ce soit sans aucune confirmation (les deux ont oublié)
     * ou avec une seule confirmation faite. Utilisé par le job qui auto-valide après 24h.
     */
    List<RendezVous> findByStatut(StatutRendezVousEnum statut);

    @Query("""
            SELECT r.laboratoire.id, r.laboratoire.nom, COUNT(r)
            FROM RendezVous r
            WHERE r.statut = 'REALISE'
              AND (:dateDebut IS NULL OR r.creneau.date >= :dateDebut)
              AND (:dateFin IS NULL OR r.creneau.date <= :dateFin)
            GROUP BY r.laboratoire.id, r.laboratoire.nom
            ORDER BY COUNT(r) DESC
            """)
    List<Object[]> countVisitesParLaboratoire(@Param("dateDebut") java.time.LocalDate dateDebut,
                                              @Param("dateFin") java.time.LocalDate dateFin);

    @Query("""
            SELECT r.delegue.id, r.delegue.nom, r.delegue.prenom,
                   r.delegue.laboratoire.id, r.delegue.laboratoire.nom, COUNT(r)
            FROM RendezVous r
            WHERE r.statut = 'REALISE'
              AND (:dateDebut IS NULL OR r.creneau.date >= :dateDebut)
              AND (:dateFin IS NULL OR r.creneau.date <= :dateFin)
            GROUP BY r.delegue.id, r.delegue.nom, r.delegue.prenom,
                     r.delegue.laboratoire.id, r.delegue.laboratoire.nom
            ORDER BY COUNT(r) DESC
            """)
    List<Object[]> countVisitesParDelegue(@Param("dateDebut") java.time.LocalDate dateDebut,
                                          @Param("dateFin") java.time.LocalDate dateFin);

    @Query("""
            SELECT r.delegue.id, r.delegue.nom, r.delegue.prenom, COUNT(r)
            FROM RendezVous r
            WHERE r.statut = 'REALISE'
              AND r.laboratoire.id = :laboratoireId
              AND (:dateDebut IS NULL OR r.creneau.date >= :dateDebut)
              AND (:dateFin IS NULL OR r.creneau.date <= :dateFin)
            GROUP BY r.delegue.id, r.delegue.nom, r.delegue.prenom
            ORDER BY COUNT(r) DESC
            """)
    List<Object[]> countVisitesParDelegueForLaboratoire(@Param("laboratoireId") String laboratoireId,
                                                        @Param("dateDebut") java.time.LocalDate dateDebut,
                                                        @Param("dateFin") java.time.LocalDate dateFin);
}
