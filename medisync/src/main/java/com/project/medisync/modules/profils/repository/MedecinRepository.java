package com.project.medisync.modules.profils.repository;

import com.project.medisync.modules.profils.entity.Medecin;
import com.project.medisync.modules.profils.entity.SpecialiteEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, String> {

    Optional<Medecin> findById(String id);

    Optional<Medecin> findByUserId(String userId);

    List<Medecin> findBySupprimeFalse();

    /** Médecins visibles du délégué (valide=true, non supprimés) ayant la spécialité donnée. */
    List<Medecin> findBySpecialiteAndValideTrueAndSupprimeFalse(SpecialiteEnum specialite);

    /** Médecins auto-inscrits en attente de validation par un admin (non supprimés). */
    List<Medecin> findByValideFalseAndSupprimeFalse();

    /**
     * Recherche par nom OU prénom (partielle, insensible à la casse), spécialités (parmi une
     * liste, optionnelle) et région (optionnelle) au sein d'une liste d'ids donnée. Si
     * specialites/regionId est null (ou specialites vide), ne filtre pas sur ce critère. Ne
     * retourne que les médecins validés (valide=true) — un médecin auto-inscrit en attente de
     * validation admin n'apparaît pas dans les recherches du délégué.
     */
    @Query("""
            SELECT m FROM Medecin m
            WHERE m.id IN :ids
              AND m.valide = true
              AND m.supprime = false
              AND (LOWER(m.nom) LIKE LOWER(CONCAT('%', :nom, '%'))
                   OR LOWER(m.prenom) LIKE LOWER(CONCAT('%', :nom, '%')))
              AND (:specialites IS NULL OR m.specialite IN :specialites)
              AND (:regionId IS NULL OR m.region.id = :regionId)
            ORDER BY m.nom ASC, m.prenom ASC
            """)
    List<Medecin> searchByIdsNomSpecialitesRegion(
            @Param("ids") List<String> ids,
            @Param("nom") String nom,
            @Param("specialites") List<SpecialiteEnum> specialites,
            @Param("regionId") String regionId);

    boolean existsByUserId(String userId);
}
