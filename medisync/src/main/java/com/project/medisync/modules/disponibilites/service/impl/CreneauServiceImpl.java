package com.project.medisync.modules.disponibilites.service.impl;

import com.project.medisync.modules.disponibilites.entity.Creneau;
import com.project.medisync.modules.disponibilites.entity.StatutCreneauEnum;
import com.project.medisync.modules.disponibilites.repository.CreneauRepository;
import com.project.medisync.modules.disponibilites.service.CreneauService;
import com.project.medisync.shared.exception.BusinessException;
import com.project.medisync.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreneauServiceImpl implements CreneauService {

    private static final int DUREE_CRENEAU_MINUTES = 15;

    private final CreneauRepository
            creneauRepo;

    /** Clé de dédoublonnage en mémoire (date + heure) pour éviter un exists() par créneau généré. */
    private record CreneauKey(LocalDate date, LocalTime heureDebut) {}

    private static boolean isSunday(LocalDate date) {
        DayOfWeek jour = date.getDayOfWeek();
        return  jour == DayOfWeek.SUNDAY;
    }
    @Override
    public List<Creneau> getAllCreneaux(){
        return creneauRepo.findAll();
    }

    @Override
    @Transactional
    public Creneau createCreneau(String medecinId, LocalDate date, LocalTime heureDebut) {

        if (isSunday(date)) {
            throw new BusinessException("Impossible de publier un créneau le dimanche.");
        }

        // Pas de doublon
        if (creneauRepo.existsByMedecinIdAndDateAndHeureDebut(medecinId, date, heureDebut)) {
            throw new BusinessException(
                    "Un créneau existe déjà le " + date + " à " + heureDebut + ".");
        }

        Creneau creneau = Creneau.builder()
                .medecinId(medecinId)
                .date(date)
                .heureDebut(heureDebut)
                .build();

        Creneau saved = creneauRepo.save(creneau);
        log.info("[Disponibilites] Créneau manuel créé — médecin {} le {} à {}", medecinId, date, heureDebut);
        return saved;
    }

    @Override
    @Transactional
    public List<Creneau> ajouterUnePlageDeCreneaux(String medecinId, LocalDate dateDebut, LocalDate dateFin,
                                                     LocalTime heureDebut, LocalTime heureFin) {

        if (dateFin.isBefore(dateDebut)) {
            throw new BusinessException("La date de fin doit être postérieure ou égale à la date de début.");
        }
        if (!heureFin.isAfter(heureDebut)) {
            throw new BusinessException("L'heure de fin doit être postérieure à l'heure de début.");
        }

        // Un seul SELECT pour récupérer les créneaux déjà existants sur la période,
        // au lieu d'un exists() par créneau généré.
        Set<CreneauKey> existants = creneauRepo.findByMedecinIdAndDateBetween(medecinId, dateDebut, dateFin)
                .stream()
                .map(c -> new CreneauKey(c.getDate(), c.getHeureDebut()))
                .collect(java.util.stream.Collectors.toSet());

        List<Creneau> creneaux = new ArrayList<>();

        for (LocalDate date = dateDebut; !date.isAfter(dateFin); date = date.plusDays(1)) {
            if (isSunday(date)) {
                continue;
            }
            for (LocalTime heure = heureDebut; heure.isBefore(heureFin); heure = heure.plusMinutes(DUREE_CRENEAU_MINUTES)) {

                if (!existants.add(new CreneauKey(date, heure))) {
                    continue;
                }

                creneaux.add(Creneau.builder()
                        .medecinId(medecinId)
                        .date(date)
                        .heureDebut(heure)
                        .build());
            }
        }

        List<Creneau> saved = creneauRepo.saveAll(creneaux);
        log.info("[Disponibilites] {} créneaux générés pour le médecin {} du {} au {}.",
                saved.size(), medecinId, dateDebut, dateFin);
        return saved;
    }

    @Override
    @Transactional
    public int supprimerUnePlageDeCreneaux(String medecinId, LocalDate dateDebut, LocalDate dateFin,
                                            LocalTime heureDebut, LocalTime heureFin) {

        if (dateFin.isBefore(dateDebut)) {
            throw new BusinessException("La date de fin doit être postérieure ou égale à la date de début.");
        }
        if (!heureFin.isAfter(heureDebut)) {
            throw new BusinessException("L'heure de fin doit être postérieure à l'heure de début.");
        }

        int nbSupprimes = creneauRepo.deleteDisponiblesByMedecinIdAndPlage(
                medecinId, dateDebut, dateFin, heureDebut, heureFin);
        log.info("[Disponibilites] {} créneaux supprimés pour le médecin {} du {} au {}.",
                nbSupprimes, medecinId, dateDebut, dateFin);
        return nbSupprimes;
    }

    @Override
    @Transactional
    public void deleteByIdAndMedecinId(String id, String medecinId){
        creneauRepo.deleteByIdAndMedecinId(id, medecinId);
    }

    @Override
    @Transactional(readOnly = true)
    public Creneau getById(String id) {
        return creneauRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Créneau", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Creneau> getBySemaine(String medecinId, LocalDate lundiDeLaSemaine) {
        LocalDate dimanche = lundiDeLaSemaine.plusDays(6);
        return creneauRepo.findByMedecinIdAndDateBetween(
                medecinId, lundiDeLaSemaine, dimanche);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Creneau> getByPeriode(String medecinId, LocalDate dateDebut, LocalDate dateFin) {
        if (dateFin.isBefore(dateDebut)) {
            throw new BusinessException("La date de fin doit être postérieure ou égale à la date de début.");
        }
        return creneauRepo.findByMedecinIdAndDateBetween(medecinId, dateDebut, dateFin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getMedecinIdsAvecCreneauxLibres(LocalDate searchDateDebut, LocalDate searchDatefin ,LocalTime heureDebut, LocalTime heureFin) {
        if (!heureFin.isAfter(heureDebut)) {
            throw new BusinessException("L'heure de fin doit être postérieure à l'heure de début.");
        }
        return creneauRepo.findDistinctMedecinIdsDisponibles(searchDateDebut,searchDatefin , heureDebut, heureFin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Creneau> getDisponiblesPourRemplacement(String medecinId) {
        LocalDate debut = LocalDate.now();
        LocalDate fin   = LocalDate.now().plusWeeks(1);
        return creneauRepo.findByMedecinIdAndStatutAndDateBetween(
                medecinId, StatutCreneauEnum.DISPONIBLE, debut, fin);
    }

    @Override
    @Transactional
    public void marquerReserve(String id) {
        Creneau creneau = getById(id);
        creneau.setStatut(StatutCreneauEnum.RESERVE);
        creneauRepo.save(creneau);
        log.info("[Disponibilites] Créneau {} marqué comme RÉSERVÉ.", id);
    }

    @Override
    @Transactional
    public void marquerDisponible(String id) {
        Creneau creneau = getById(id);
        creneau.setStatut(StatutCreneauEnum.DISPONIBLE);
        creneauRepo.save(creneau);
        log.info("[Disponibilites] Créneau {} marqué comme DISPONIBLE.", id);
    }


}
