package com.project.medisync.modules.profils.service;

import com.project.medisync.modules.profils.entity.Laboratoire;
import com.project.medisync.modules.profils.entity.StatutAbonnementEnum;

import java.time.LocalDate;
import java.util.List;

/**
 * Interface publique du service Laboratoire (module Profils).
 */
public interface LaboratoireService {

    Laboratoire create(String userId, String nom, String adresse, String telephone,
                       StatutAbonnementEnum statut, LocalDate dateDebut, LocalDate dateFin);

    /** Admin : crée en un seul appel le compte (email + mot de passe) et le profil laboratoire. */
    Laboratoire creerLaboratoireComplet(String email, String password, String nom, String adresse, String telephone,
                                        StatutAbonnementEnum statut, LocalDate dateDebut, LocalDate dateFin);

    /**
     * Auto-inscription publique d'un laboratoire (web uniquement) : crée le compte (email non
     * vérifié) et le profil avec un abonnement d'essai de 30 jours, puis envoie un email de
     * vérification. Devient actif dès que l'email est vérifié.
     */
    Laboratoire inscrire(String email, String password, String nom, String adresse, String telephone);

    /** Admin : réactive un laboratoire (ne réactive pas automatiquement ses délégués). */
    Laboratoire activer(String id);

    /**
     * Admin : désactive un laboratoire — il ne peut plus se connecter, et tous ses délégués
     * sont désactivés avec lui (ils ne peuvent plus se connecter non plus).
     */
    Laboratoire desactiver(String id);

    Laboratoire getById(String id);

    /** Récupère le laboratoire associé à un compte utilisateur (rôle LABO). */
    Laboratoire getByUserId(String userId);

    List<Laboratoire> getAll();

    Laboratoire update(String id, String nom, String adresse, String telephone,
                       StatutAbonnementEnum statut, LocalDate dateDebut, LocalDate dateFin);

    void updateDernierPaiement(String laboratoireId, String paiementId);

    void delete(String id);
}
