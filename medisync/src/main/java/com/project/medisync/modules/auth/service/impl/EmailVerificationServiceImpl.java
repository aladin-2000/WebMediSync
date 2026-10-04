package com.project.medisync.modules.auth.service.impl;

import com.project.medisync.modules.auth.entity.EmailVerificationToken;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.repository.EmailVerificationTokenRepository;
import com.project.medisync.modules.auth.service.EmailService;
import com.project.medisync.modules.auth.service.EmailVerificationService;
import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserService  userService;
    private final EmailService emailService;

    @Override
    @Transactional
    public void genererEtEnvoyer(User user) {
        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(EmailVerificationToken.EXPIRATION_HEURES))
                .build();
        tokenRepository.save(evt);

        emailService.envoyerEmailVerification(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void verifier(String token) {
        EmailVerificationToken evt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Lien de vérification invalide ou déjà utilisé."));

        if (evt.estExpire()) {
            tokenRepository.delete(evt);
            throw new BusinessException("Ce lien de vérification a expiré. Merci de demander un nouvel envoi.");
        }

        User user = evt.getUser();
        user.setEmailVerified(true);
        userService.save(user);
        tokenRepository.delete(evt);
        log.info("[Auth] Email vérifié pour l'utilisateur {}.", user.getId());
    }

    @Override
    @Transactional
    public void renvoyer(String email) {
        if (!userService.existsByEmail(email)) {
            throw new BusinessException("Aucun compte associé à cet email.");
        }
        User user = userService.getByEmail(email);
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BusinessException("Cet email est déjà vérifié.");
        }
        genererEtEnvoyer(user);
    }
}
