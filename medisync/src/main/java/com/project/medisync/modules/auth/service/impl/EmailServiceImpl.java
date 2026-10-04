package com.project.medisync.modules.auth.service.impl;

import com.project.medisync.modules.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void envoyerEmailVerification(String destinataire, String token) {
        String lien = frontendUrl + "/verifier-email?token=" + token;

        if (!mailEnabled) {
            log.info("[Auth] app.mail.enabled=false — email de vérification non envoyé. "
                    + "Lien de vérification pour {} : {}", destinataire, lien);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(destinataire);
        message.setSubject("MediSync — Vérifiez votre adresse email");
        message.setText(
                "Bonjour,\n\n"
                + "Merci de vous être inscrit(e) sur MediSync. Cliquez sur le lien ci-dessous pour vérifier "
                + "votre adresse email et activer votre compte :\n\n"
                + lien + "\n\n"
                + "Ce lien expire dans 24 heures.\n\n"
                + "Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.\n\n"
                + "L'équipe MediSync"
        );

        try {
            mailSender.send(message);
            log.info("[Auth] Email de vérification envoyé à {}.", destinataire);
        } catch (Exception e) {
            log.error("[Auth] Échec de l'envoi de l'email de vérification à {} : {}", destinataire, e.getMessage());
        }
    }
}
