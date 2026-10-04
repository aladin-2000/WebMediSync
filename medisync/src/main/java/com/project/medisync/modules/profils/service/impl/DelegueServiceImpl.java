package com.project.medisync.modules.profils.service.impl;

import com.project.medisync.modules.auth.entity.RoleEnum;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.service.EmailVerificationService;
import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.modules.profils.entity.Delegue;
import com.project.medisync.modules.profils.repository.DelegueRepository;
import com.project.medisync.modules.profils.service.DelegueService;
import com.project.medisync.modules.profils.service.LaboratoireService;
import com.project.medisync.shared.exception.BusinessException;
import com.project.medisync.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DelegueServiceImpl implements DelegueService {

    private final DelegueRepository  delegueRepository;
    private final UserService        userService;
    private final LaboratoireService laboratoireService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public Delegue create(String userId, String laboratoireId, String nom, String prenom, String telephone) {

        if (!userService.existsById(userId)) {
            throw new ResourceNotFoundException("Utilisateur", userId);
        }
        if (delegueRepository.existsByUserId(userId)) {
            throw new BusinessException("Un profil délégué existe déjà pour cet utilisateur.");
        }

        Delegue delegue = Delegue.builder()
                .user(userService.getById(userId))
                .laboratoire(laboratoireId != null ? laboratoireService.getById(laboratoireId) : null)
                .nom(nom)
                .prenom(prenom)
                .telephone(telephone)
                .build();

        return delegueRepository.save(delegue);
    }

    @Override
    @Transactional
    public Delegue inscrire(String email, String password, String nom, String prenom, String telephone,
                             String laboratoireId, String laboName) {
        if (userService.existsByEmail(email)) {
            throw new BusinessException("Un compte existe déjà avec l'adresse email : " + email);
        }
        if ((laboratoireId == null || laboratoireId.isBlank()) && (laboName == null || laboName.isBlank())) {
            throw new BusinessException("Veuillez choisir votre laboratoire ou en saisir le nom.");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(RoleEnum.DELEGUE)
                .mustChangePassword(false)
                .emailVerified(false)
                .build();
        User savedUser = userService.save(user);

        Delegue delegue = Delegue.builder()
                .user(savedUser)
                .laboratoire(laboratoireId != null ? laboratoireService.getById(laboratoireId) : null)
                .laboName(laboratoireId == null ? laboName : null)
                .nom(nom)
                .prenom(prenom)
                .telephone(telephone)
                .build();

        Delegue saved = delegueRepository.save(delegue);
        emailVerificationService.genererEtEnvoyer(savedUser);
        log.info("[Profils] Auto-inscription délégué {} — en attente de vérification email.", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Delegue creerDelegueComplet(String email, String password, String nom, String prenom, String telephone, String laboratoireId) {
        if (userService.existsByEmail(email)) {
            throw new BusinessException("Un compte existe déjà avec l'adresse email : " + email);
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(RoleEnum.DELEGUE)
                .emailVerified(true)
                .build();
        User savedUser = userService.save(user);

        Delegue delegue = Delegue.builder()
                .user(savedUser)
                .laboratoire(laboratoireService.getById(laboratoireId))
                .nom(nom)
                .prenom(prenom)
                .telephone(telephone)
                .build();

        Delegue saved = delegueRepository.save(delegue);
        log.info("[Profils] Délégué {} créé par le laboratoire {}.", saved.getId(), laboratoireId);
        return saved;
    }

    @Override
    @Transactional
    public Delegue desactiver(String id) {
        Delegue delegue = getById(id);
        User user = delegue.getUser();
        user.setIsActive(false);
        userService.save(user);
        log.info("[Profils] Délégué {} désactivé.", id);
        return delegue;
    }

    @Override
    @Transactional
    public Delegue activer(String id) {
        Delegue delegue = getById(id);
        User user = delegue.getUser();
        user.setIsActive(true);
        userService.save(user);
        log.info("[Profils] Délégué {} réactivé.", id);
        return delegue;
    }

    @Override
    @Transactional(readOnly = true)
    public Delegue getById(String id) {
        return delegueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Délégué", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Delegue getByUserId(String userId) {
        return delegueRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Délégué pour l'utilisateur", userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Delegue> getAll() {
        return delegueRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Delegue> getByLaboratoire(String laboratoireId) {
        return delegueRepository.findByLaboratoireId(laboratoireId);
    }

    @Override
    @Transactional
    public Delegue update(String id, String nom, String prenom, String telephone) {
        Delegue delegue = getById(id);
        if (nom       != null) delegue.setNom(nom);
        if (prenom    != null) delegue.setPrenom(prenom);
        if (telephone != null) delegue.setTelephone(telephone);
        return delegueRepository.save(delegue);
    }

    @Override
    @Transactional
    public void updateScoreFiabilite(String id, Float nouveauScore) {
        if (nouveauScore < 0 || nouveauScore > 100) {
            throw new BusinessException("Le score de fiabilité doit être compris entre 0 et 100.");
        }
        Delegue delegue = getById(id);
        delegue.setScoreFiabilite(nouveauScore);
        delegueRepository.save(delegue);
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (!delegueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Délégué", id);
        }
        delegueRepository.deleteById(id);
        log.info("[Profils] Délégué {} supprimé.", id);
    }
}
