package com.project.medisync.modules.disponibilites.repository;

import com.project.medisync.modules.disponibilites.entity.Creneau;
import com.project.medisync.modules.disponibilites.entity.StatutCreneauEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CreneauRepository extends JpaRepository<Creneau, String> {

    Optional<Creneau> findById(String id);

    /** Créneaux d'un médecin sur une période donnée. */
    List<Creneau> findByMedecinIdAndDateBetween(
            String medecinId, LocalDate dateDebut, LocalDate dateFin);

    /** Créneaux disponibles d'un médecin sur une période — utilisé pour les propositions de remplacement. */
    List<Creneau> findByMedecinIdAndStatutAndDateBetween(
            String medecinId, StatutCreneauEnum statut, LocalDate dateDebut, LocalDate dateFin);

    /** Vérifie si un créneau existe déjà pour éviter les doublons lors de la génération automatique. */
    boolean existsByMedecinIdAndDateAndHeureDebut(
            String medecinId, LocalDate date, java.time.LocalTime heureDebut);

    List<Creneau> findAll();

    /** Ids distincts des médecins ayant au moins un créneau DISPONIBLE sur la plage horaire donnée, à une date donnée. */
    @Query("""
            SELECT DISTINCT c.medecinId FROM Creneau c
            WHERE c.date BETWEEN :searchDateDebut AND :searchDatefin
              AND c.statut      = com.project.medisync.modules.disponibilites.entity.StatutCreneauEnum.DISPONIBLE
              AND c.heureDebut >= :heureDebut
              AND c.heureDebut <  :heureFin
            """)
    List<String> findDistinctMedecinIdsDisponibles(
            @Param("searchDateDebut")       LocalDate searchDateDebut,
            @Param("searchDatefin")       LocalDate searchDatefin,
            @Param("heureDebut") java.time.LocalTime heureDebut,
            @Param("heureFin")   java.time.LocalTime heureFin
    );

    /**
     * Suppression en masse (une seule requête SQL) des créneaux DISPONIBLES
     * d'un médecin sur une plage de dates/heures. Les créneaux RESERVE ou ANNULE
     * ne sont jamais supprimés.
     */
    @Modifying
    @Query("""
            DELETE FROM Creneau c
            WHERE c.medecinId  = :medecinId
              AND c.date       BETWEEN :dateDebut AND :dateFin
              AND c.heureDebut >= :heureDebut
              AND c.heureDebut <  :heureFin
              AND c.statut     = com.project.medisync.modules.disponibilites.entity.StatutCreneauEnum.DISPONIBLE
            """)
    int deleteDisponiblesByMedecinIdAndPlage(
            @Param("medecinId")  String medecinId,
            @Param("dateDebut")  LocalDate dateDebut,
            @Param("dateFin")    LocalDate dateFin,
            @Param("heureDebut") java.time.LocalTime heureDebut,
            @Param("heureFin")   java.time.LocalTime heureFin
    );

    void deleteByIdAndMedecinId(String id, String medecinId);

    @Modifying
    @Query("""
            DELETE FROM Creneau c
            WHERE c.medecinId = :medecinId
              AND c.statut = com.project.medisync.modules.disponibilites.entity.StatutCreneauEnum.DISPONIBLE
            """)
    int deleteDisponiblesByMedecinId(@Param("medecinId") String medecinId);
}
