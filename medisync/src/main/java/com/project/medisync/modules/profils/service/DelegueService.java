package com.project.medisync.modules.profils.service;

import com.project.medisync.modules.profils.entity.Delegue;

import java.util.List;
/**
 * Interface publique du service Délégué (module Profils).
 */
public interface DelegueService {

    Delegue create(String userId, String laboratoireId, String nom, String prenom, String telephone);

    /**
     * Auto-inscription : crée le compte (email non vérifié) et le profil délégué, puis
     * envoie l'email de vérification. Devient actif dès que l'email est vérifié — pas
     * de validation admin nécessaire (contrairement au médecin, non listé publiquement).
     * Rattaché soit à {@code laboratoireId} (laboratoire déjà inscrit), soit à
     * {@code laboName} (nom saisi librement, provisoire MVP) — l'un des deux est requis.
     */
    Delegue inscrire(String email, String password, String nom, String prenom, String telephone,
                      String laboratoireId, String laboName);

    /**
     * Créé par un laboratoire : crée en une fois le compte (email vérifié d'office, pas
     * d'auto-inscription) et le profil délégué, rattaché au laboratoire donné.
     */
    Delegue creerDelegueComplet(String email, String password, String nom, String prenom, String telephone, String laboratoireId);

    /** Désactive le compte du délégué (ex: démission) — il ne peut plus se connecter. */
    Delegue desactiver(String id);

    /** Réactive le compte du délégué. */
    Delegue activer(String id);

    Delegue getById(String id);

    /** Récupère le profil délégué associé à un compte utilisateur. */
    Delegue getByUserId(String userId);

    List<Delegue> getAll();

    List<Delegue> getByLaboratoire(String laboratoireId);

    Delegue update(String id, String nom, String prenom, String telephone);

    void updateScoreFiabilite(String id, Float nouveauScore);

    void delete(String id);
}
