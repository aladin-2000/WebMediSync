package com.project.medisync.modules.auth.service;

/**
 * Interface publique du module Auth pour l'envoi d'emails transactionnels.
 */
public interface EmailService {

    /**
     * Envoie l'email de vérification d'adresse contenant le lien avec le token.
     */
    void envoyerEmailVerification(String destinataire, String token);
}
