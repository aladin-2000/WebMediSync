package com.project.medisync.modules.auth.service;

import com.project.medisync.modules.auth.entity.User;

/**
 * Interface publique du module Auth pour la vérification d'adresse email
 * après inscription (auto-signup médecin/délégué).
 */
public interface EmailVerificationService {

    /** Génère un nouveau jeton de vérification pour l'utilisateur et lui envoie l'email. */
    void genererEtEnvoyer(User user);

    /** Valide le jeton et marque l'utilisateur comme email vérifié. */
    void verifier(String token);

    /** Regénère un jeton et renvoie l'email de vérification, si le compte n'est pas déjà vérifié. */
    void renvoyer(String email);
}
