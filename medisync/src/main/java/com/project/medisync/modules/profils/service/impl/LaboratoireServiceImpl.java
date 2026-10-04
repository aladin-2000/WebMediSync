package com.project.medisync.modules.profils.service.impl;

import com.project.medisync.modules.auth.entity.RoleEnum;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.service.EmailVerificationService;
import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.modules.profils.entity.Delegue;
import com.project.medisync.modules.profils.entity.Laboratoire;
import com.project.medisync.modules.profils.entity.StatutAbonnementEnum;
import com.project.medisync.modules.profils.repository.DelegueRepository;
import com.project.medisync.modules.profils.repository.LaboratoireRepository;
import com.project.medisync.modules.profils.service.LaboratoireService;
import com.project.medisync.shared.exception.BusinessException;
import com.project.medisync.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LaboratoireServiceImpl implements LaboratoireService {

    private final LaboratoireRepository laboratoireRepository;
    private final DelegueRepository     delegueRepository;
    private final UserService           userService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public Laboratoire create(String userId, String nom, String adresse, String telephone,
                              StatutAbonnementEnum statut, LocalDate dateDebut, LocalDate dateFin) {

        if (!userService.existsById(userId)) {
            throw new ResourceNotFoundException("Utilisateur", userId);
        }
        if (laboratoireRepository.existsByUserId(userId)) {
            throw new BusinessException("Un laboratoire est déjà associé à cet utilisateur.");
        }
        if (dateFin.isBefore(dateDebut)) {
            throw new BusinessException("La date de fin d'abonnement doit être postérieure à la date de début.");
        }

        Laboratoire labo = Laboratoire.builder()
                .user(userService.getById(userId))
                .nom(nom)
                .adresse(adresse)
                .telephone(telephone)
                .statutAbonnement(statut)
                .dateDebutAbonnement(dateDebut)
                .dateFinAbonnement(dateFin)
                .build();

        return laboratoireRepository.save(labo);
    }

    @Override
    @Transactional
    public Laboratoire creerLaboratoireComplet(String email, String password, String nom, String adresse, String telephone,
                                               StatutAbonnementEnum statut, LocalDate dateDebut, LocalDate dateFin) {
        if (userService.existsByEmail(email)) {
            throw new BusinessException("Un compte existe déjà avec l'adresse email : " + email);
        }
        if (dateFin.isBefore(dateDebut)) {
            throw new BusinessException("La date de fin d'abonnement doit être postérieure à la date de début.");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(RoleEnum.LABO)
                .emailVerified(true)
                .build();
        User savedUser = userService.save(user);

        Laboratoire labo = Laboratoire.builder()
                .user(savedUser)
                .nom(nom)
                .adresse(adresse)
                .telephone(telephone)
                .statutAbonnement(statut)
                .dateDebutAbonnement(dateDebut)
                .dateFinAbonnement(dateFin)
                .build();

        Laboratoire saved = laboratoireRepository.save(labo);
        log.info("[Profils] Laboratoire {} créé par un admin.", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Laboratoire inscrire(String email, String password, String nom, String adresse, String telephone) {
        if (userService.existsByEmail(email)) {
            throw new BusinessException("Un compte existe déjà avec l'adresse email : " + email);
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(RoleEnum.LABO)
                .mustChangePassword(false)
                .emailVerified(false)
                .build();
        User savedUser = userService.save(user);

        LocalDate aujourdHui = LocalDate.now();
        Laboratoire labo = Laboratoire.builder()
                .user(savedUser)
                .nom(nom)
                .adresse(adresse)
                .telephone(telephone)
                .statutAbonnement(StatutAbonnementEnum.ESSAI)
                .dateDebutAbonnement(aujourdHui)
                .dateFinAbonnement(aujourdHui.plusDays(30))
                .build();

        Laboratoire saved = laboratoireRepository.save(labo);
        emailVerificationService.genererEtEnvoyer(savedUser);
        log.info("[Profils] Auto-inscription laboratoire {} — en attente de vérification email.", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Laboratoire activer(String id) {
        Laboratoire labo = getById(id);
        User user = labo.getUser();
        user.setIsActive(true);
        userService.save(user);
        log.info("[Profils] Laboratoire {} réactivé.", id);
        return labo;
    }

    @Override
    @Transactional
    public Laboratoire desactiver(String id) {
        Laboratoire labo = getById(id);
        User user = labo.getUser();
        user.setIsActive(false);
        userService.save(user);

        List<Delegue> delegues = delegueRepository.findByLaboratoireId(id);
        for (Delegue delegue : delegues) {
            User delegueUser = delegue.getUser();
            if (Boolean.TRUE.equals(delegueUser.getIsActive())) {
                delegueUser.setIsActive(false);
                userService.save(delegueUser);
            }
        }
        log.info("[Profils] Laboratoire {} désactivé, ainsi que ses {} délégué(s).", id, delegues.size());
        return labo;
    }

    @Override
    @Transactional(readOnly = true)
    public Laboratoire getById(String id) {
        return laboratoireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratoire", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Laboratoire getByUserId(String userId) {
        return laboratoireRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratoire pour l'utilisateur", userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Laboratoire> getAll() {
        return laboratoireRepository.findAll();
    }

    @Override
    @Transactional
    public Laboratoire update(String id, String nom, String adresse, String telephone,
                              StatutAbonnementEnum statut, LocalDate dateDebut, LocalDate dateFin) {

        Laboratoire labo = getById(id);
        if (nom      != null) labo.setNom(nom);
        if (adresse  != null) labo.setAdresse(adresse);
        if (telephone != null) labo.setTelephone(telephone);
        if (statut   != null) labo.setStatutAbonnement(statut);
        if (dateDebut != null) labo.setDateDebutAbonnement(dateDebut);
        if (dateFin   != null) {
            if (dateFin.isBefore(labo.getDateDebutAbonnement())) {
                throw new BusinessException("La date de fin doit être postérieure à la date de début.");
            }
            labo.setDateFinAbonnement(dateFin);
        }
        return laboratoireRepository.save(labo);
    }

    @Override
    @Transactional
    public void updateDernierPaiement(String laboratoireId, String paiementId) {
        Laboratoire labo = getById(laboratoireId);
        labo.setDernierPaiementId(paiementId);
        laboratoireRepository.save(labo);
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (!laboratoireRepository.existsById(id)) {
            throw new ResourceNotFoundException("Laboratoire", id);
        }
        laboratoireRepository.deleteById(id);
        log.info("[Profils] Laboratoire {} supprimé.", id);
    }
}
