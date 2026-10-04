package com.project.medisync.modules.profils.service.impl;

import com.project.medisync.modules.auth.entity.RoleEnum;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.service.EmailVerificationService;
import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.modules.profils.entity.Medecin;
import com.project.medisync.modules.profils.entity.Region;
import com.project.medisync.modules.profils.entity.SpecialiteEnum;
import com.project.medisync.modules.disponibilites.repository.CreneauRepository;
import com.project.medisync.modules.profils.repository.MedecinRepository;
import com.project.medisync.modules.profils.repository.RegionRepository;
import com.project.medisync.modules.profils.service.MedecinService;
import com.project.medisync.modules.reservations.entity.AnnuleParEnum;
import com.project.medisync.modules.reservations.entity.RendezVous;
import com.project.medisync.modules.reservations.entity.StatutRendezVousEnum;
import com.project.medisync.modules.reservations.repository.RendezVousRepository;
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
public class MedecinServiceImpl implements MedecinService {

    private final MedecinRepository medecinRepository;
    private final RegionRepository   regionRepository;
    private final UserService        userService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final RendezVousRepository rendezVousRepository;
    private final CreneauRepository creneauRepository;

    /** Résout un id de région optionnel en entité — null si non fourni. */
    private Region resoudreRegion(String regionId) {
        if (regionId == null || regionId.isBlank()) {
            return null;
        }
        return regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Région", regionId));
    }

    @Override
    @Transactional
    public Medecin create(String userId, String nom, String prenom, SpecialiteEnum specialite,
                          String adresseCabinet, String telephone, Double latitude, Double longitude,
                          Float scoreFiabiliteMin, String regionId) {

        if (!userService.existsById(userId)) {
            throw new ResourceNotFoundException("Utilisateur", userId);
        }
        if (medecinRepository.existsByUserId(userId)) {
            throw new BusinessException("Un profil médecin existe déjà pour cet utilisateur.");
        }

        Medecin medecin = Medecin.builder()
                .user(userService.getById(userId))
                .nom(nom)
                .prenom(prenom)
                .specialite(specialite)
                .adresseCabinet(adresseCabinet)
                .telephone(telephone)
                .latitude(latitude)
                .longitude(longitude)
                .scoreFiabiliteMin(scoreFiabiliteMin != null ? scoreFiabiliteMin : 0f)
                .region(resoudreRegion(regionId))
                .build();

        return medecinRepository.save(medecin);
    }

    @Override
    @Transactional
    public Medecin creerMedecinComplet(String email, String password, String nom, String prenom, SpecialiteEnum specialite,
                                        String adresseCabinet, String telephone, Double latitude, Double longitude,
                                        Float scoreFiabiliteMin, String regionId) {

        if (userService.existsByEmail(email)) {
            throw new BusinessException("Un compte existe déjà avec l'adresse email : " + email);
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(RoleEnum.MEDECIN)
                .emailVerified(true)
                .build();
        User savedUser = userService.save(user);

        Medecin medecin = Medecin.builder()
                .user(savedUser)
                .nom(nom)
                .prenom(prenom)
                .specialite(specialite)
                .adresseCabinet(adresseCabinet)
                .telephone(telephone)
                .latitude(latitude)
                .longitude(longitude)
                .scoreFiabiliteMin(scoreFiabiliteMin != null ? scoreFiabiliteMin : 0f)
                .region(resoudreRegion(regionId))
                .build();

        Medecin saved = medecinRepository.save(medecin);
        log.info("[Profils] Médecin complet créé — compte {} + profil {}.", savedUser.getId(), saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Medecin inscrire(String email, String password, String nom, String prenom, SpecialiteEnum specialite,
                             String adresseCabinet, String telephone, Double latitude, Double longitude, String regionId) {

        if (userService.existsByEmail(email)) {
            throw new BusinessException("Un compte existe déjà avec l'adresse email : " + email);
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(RoleEnum.MEDECIN)
                .mustChangePassword(false)
                .emailVerified(false)
                .build();
        User savedUser = userService.save(user);

        Medecin medecin = Medecin.builder()
                .user(savedUser)
                .nom(nom)
                .prenom(prenom)
                .specialite(specialite)
                .adresseCabinet(adresseCabinet)
                .telephone(telephone)
                .latitude(latitude)
                .longitude(longitude)
                .region(resoudreRegion(regionId))
                .valide(false)
                .build();

        Medecin saved = medecinRepository.save(medecin);
        emailVerificationService.genererEtEnvoyer(savedUser);
        log.info("[Profils] Auto-inscription médecin {} — en attente de vérification email + validation admin.", saved.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Region> getRegions() {
        return regionRepository.findAllByOrderByNomAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Medecin> getEnAttente() {
        return medecinRepository.findByValideFalseAndSupprimeFalse();
    }

    @Override
    @Transactional
    public Medecin valider(String id) {
        Medecin medecin = getById(id);
        medecin.setValide(true);
        Medecin saved = medecinRepository.save(medecin);
        log.info("[Profils] Médecin {} validé par un admin.", id);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Medecin getById(String id) {
        return medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Medecin getByUserId(String userId) {
        return medecinRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin pour l'utilisateur", userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Medecin> getAll() {
        return medecinRepository.findBySupprimeFalse();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Medecin> getByIds(List<String> ids) {
        return medecinRepository.findAllById(ids);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Medecin> searchByIdsNomSpecialitesRegion(List<String> ids, String nom, List<SpecialiteEnum> specialites, String regionId) {
        if (ids.isEmpty()) {
            return List.of();
        }
        List<SpecialiteEnum> filtre = (specialites == null || specialites.isEmpty()) ? null : specialites;
        String regionFiltre = (regionId == null || regionId.isBlank()) ? null : regionId;
        return medecinRepository.searchByIdsNomSpecialitesRegion(ids, nom, filtre, regionFiltre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Medecin> getBySpecialite(SpecialiteEnum specialite) {
        return medecinRepository.findBySpecialiteAndValideTrueAndSupprimeFalse(specialite);
    }

    @Override
    @Transactional
    public Medecin update(String id, String nom, String prenom, SpecialiteEnum specialite,
                          String adresseCabinet, String telephone, Double latitude, Double longitude,
                          Float scoreFiabiliteMin, String regionId) {

        Medecin medecin = getById(id);
        if (nom            != null) medecin.setNom(nom);
        if (prenom         != null) medecin.setPrenom(prenom);
        if (specialite     != null) medecin.setSpecialite(specialite);
        if (adresseCabinet != null) medecin.setAdresseCabinet(adresseCabinet);
        if (telephone      != null) medecin.setTelephone(telephone);
        if (latitude       != null) medecin.setLatitude(latitude);
        if (longitude      != null) medecin.setLongitude(longitude);
        if (scoreFiabiliteMin != null) medecin.setScoreFiabiliteMin(scoreFiabiliteMin);
        if (regionId       != null) medecin.setRegion(resoudreRegion(regionId));
        return medecinRepository.save(medecin);
    }

    @Override
    @Transactional
    public void delete(String id) {
        Medecin medecin = getById(id);

        List<RendezVous> rdvFuturs = rendezVousRepository.findByMedecinId(id).stream()
                .filter(r -> !r.getCreneau().getDate().isBefore(LocalDate.now()))
                .filter(r -> r.getStatut() == StatutRendezVousEnum.RESERVE)
                .toList();
        for (RendezVous rdv : rdvFuturs) {
            rdv.setStatut(StatutRendezVousEnum.ANNULE);
            rdv.setAnnulePar(AnnuleParEnum.MEDECIN);
            rdv.setMotifAnnulation("Médecin supprimé par l'administrateur.");
        }
        rendezVousRepository.saveAll(rdvFuturs);

        creneauRepository.deleteDisponiblesByMedecinId(id);

        medecin.setSupprime(true);
        medecinRepository.save(medecin);
        log.info("[Profils] Médecin {} soft-deleted, {} RDV futurs annulés.", id, rdvFuturs.size());
    }
}
