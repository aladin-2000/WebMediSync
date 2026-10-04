package com.project.medisync.modules.reservations.service.impl;

import com.project.medisync.modules.disponibilites.entity.Creneau;
import com.project.medisync.modules.disponibilites.service.CreneauService;
import com.project.medisync.modules.notifications.entity.TypeNotificationEnum;
import com.project.medisync.modules.notifications.service.NotificationService;
import com.project.medisync.modules.profils.service.DelegueService;
import com.project.medisync.modules.profils.service.MedecinService;
import com.project.medisync.modules.reservations.entity.*;
import com.project.medisync.modules.reservations.repository.RendezVousRepository;
import com.project.medisync.modules.reservations.repository.VisiteRepository;
import com.project.medisync.modules.reservations.service.RendezVousService;
import com.project.medisync.shared.exception.BusinessException;
import com.project.medisync.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.String;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RendezVousServiceImpl implements RendezVousService {

    private static final long DELAI_AUTO_VALIDATION_HEURES = 24;

    private final RendezVousRepository             rendezVousRepository;
    private final VisiteRepository                 visiteRepository;
    private final CreneauService                   creneauService;
    private final DelegueService                   delegueService;
    private final MedecinService                   medecinService;
    private final NotificationService              notificationService;

    @Override
    @Transactional
    public RendezVous reserver(String creneauId, String delegueId, String medecinId) {
        // 1. Créneau déjà réservé ?
        if (rendezVousRepository.existsByCreneauIdAndStatutNot(creneauId, StatutRendezVousEnum.ANNULE)) {
            throw new BusinessException("Ce créneau est déjà réservé.");
        }
        // 2. Délégué déjà occupé à cette heure ?
        if (rendezVousRepository.existsByDelegueConflict(delegueId, creneauId)) {
            throw new BusinessException("Vous avez déjà un rendez-vous à ce même créneau horaire.");
        }
        // 3. Délégué a-t-il déjà un RDV le même jour avec ce médecin ?
        if (rendezVousRepository.existsByDelegueEtMedecinMemeJour(delegueId, medecinId, creneauId)) {
            throw new BusinessException("Vous avez déjà un rendez-vous avec ce médecin aujourd'hui. Un seul rendez-vous par jour et par médecin est autorisé.");
        }

        var delegue = delegueService.getById(delegueId);

        RendezVous rdv = RendezVous.builder()
                .creneau(creneauService.getById(creneauId))
                .delegue(delegue)
                .medecin(medecinService.getById(medecinId))
                .laboratoire(delegue.getLaboratoire())
                .statut(StatutRendezVousEnum.RESERVE)
                .build();

        creneauService.marquerReserve(creneauId);
        return rendezVousRepository.save(rdv);
    }

    @Override
    @Transactional(readOnly = true)
    public RendezVous getById(String id) {
        return rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RendezVous> getByDelegue(String delegueId) {
        return rendezVousRepository.findByDelegueId(delegueId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RendezVous> getByDelegueEtJour(String delegueId, LocalDate date) {
        return rendezVousRepository.findByDelegueIdAndCreneau_Date(delegueId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RendezVous> getByDelegueEtSemaine(String delegueId, LocalDate lundiDeLaSemaine) {
        LocalDate dimanche = lundiDeLaSemaine.plusDays(6);
        return rendezVousRepository.findByDelegueIdAndCreneau_DateBetween(
                delegueId, lundiDeLaSemaine, dimanche);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RendezVous> getByMedecin(String medecinId) {
        return rendezVousRepository.findByMedecinId(medecinId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RendezVous> getByMedecinEtJour(String medecinId, LocalDate date) {
        return rendezVousRepository.findByMedecinIdAndCreneau_Date(medecinId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RendezVous> getByMedecinEtSemaine(String medecinId, LocalDate lundiDeLaSemaine) {
        LocalDate dimanche = lundiDeLaSemaine.plusDays(6);
        return rendezVousRepository.findByMedecinIdAndCreneau_DateBetween(
                medecinId, lundiDeLaSemaine, dimanche);
    }

    @Override
    @Transactional
    public RendezVous annulerParDelegue(String rendezVousId) {
        RendezVous rdv = getById(rendezVousId);
        verifierEncoreModifiable(rdv);
        verifierPasEncoreCommence(rdv);
        rdv.setAnnulePar(AnnuleParEnum.DELEGUE);

        if (Boolean.TRUE.equals(rdv.getRealiseParMedecin())) {
            RendezVous enConflit = passerEnConflit(rdv,
                    "le médecin avait confirmé réalisé, le délégué annule");
            notifierMedecin(enConflit, TypeNotificationEnum.CONFLIT,
                    "Conflit détecté : vous aviez confirmé le rendez-vous du " + creneauLabel(enConflit)
                            + " avec " + nomDelegue(enConflit) + " comme réalisé, mais le délégué l'a annulé. "
                            + "Ce rendez-vous est en attente d'investigation.");
            return enConflit;
        }

        rdv.setStatut(StatutRendezVousEnum.ANNULE);
        creneauService.marquerDisponible(rdv.getCreneau().getId());
        RendezVous annule = rendezVousRepository.save(rdv);
        notifierMedecin(annule, TypeNotificationEnum.ANNULATION,
                "Le délégué " + nomDelegue(annule) + " a annulé le rendez-vous du " + creneauLabel(annule) + ".");
        return annule;
    }

    @Override
    @Transactional
    public RendezVous annulerParMedecin(String rendezVousId, String motifAnnulation) {
        if (motifAnnulation == null || motifAnnulation.isBlank()) {
            throw new BusinessException("Le motif d'annulation est obligatoire lorsque c'est le médecin qui annule.");
        }
        RendezVous rdv = getById(rendezVousId);
        verifierEncoreModifiable(rdv);
        rdv.setAnnulePar(AnnuleParEnum.MEDECIN);
        rdv.setMotifAnnulation(motifAnnulation);

        if (Boolean.TRUE.equals(rdv.getRealiseParDelegue())) {
            RendezVous enConflit = passerEnConflit(rdv,
                    "le délégué avait confirmé réalisé, le médecin annule");
            notifierDelegue(enConflit, TypeNotificationEnum.CONFLIT,
                    "Conflit détecté : vous aviez confirmé le rendez-vous du " + creneauLabel(enConflit)
                            + " avec " + nomMedecin(enConflit) + " comme réalisé, mais le médecin l'a annulé. "
                            + "Ce rendez-vous est en attente d'investigation.");
            return enConflit;
        }

        rdv.setStatut(StatutRendezVousEnum.ANNULE);
        creneauService.marquerDisponible(rdv.getCreneau().getId());
        rendezVousRepository.save(rdv);

        notifierDelegue(rdv, TypeNotificationEnum.ANNULATION,
                "Le médecin " + nomMedecin(rdv) + " a annulé le rendez-vous du " + creneauLabel(rdv)
                        + " (motif : " + motifAnnulation + ").");

        return rdv;
    }

    @Override
    @Transactional
    public RendezVous realiserParDelegue(String rendezVousId) {
        RendezVous rdv = getById(rendezVousId);
        verifierEncoreModifiable(rdv);
        rdv.setRealiseParDelegue(true);
        RendezVous resultat = confirmerSiLesDeuxPartiesOntValide(rdv);
        notifierMedecin(resultat, TypeNotificationEnum.REALISATION,
                "Le délégué " + nomDelegue(resultat) + " a marqué le rendez-vous du " + creneauLabel(resultat)
                        + " comme réalisé.");
        return resultat;
    }

    @Override
    @Transactional
    public RendezVous realiserParMedecin(String rendezVousId) {
        RendezVous rdv = getById(rendezVousId);
        verifierEncoreModifiable(rdv);
        rdv.setRealiseParMedecin(true);
        RendezVous resultat = confirmerSiLesDeuxPartiesOntValide(rdv);
        notifierDelegue(resultat, TypeNotificationEnum.REALISATION,
                "Le médecin " + nomMedecin(resultat) + " a marqué le rendez-vous du " + creneauLabel(resultat)
                        + " comme réalisé.");
        return resultat;
    }

    /** Si les deux parties ont confirmé, passe le RDV à REALISE et crée la Visite (preuve de facturation). */
    private RendezVous confirmerSiLesDeuxPartiesOntValide(RendezVous rdv) {
        if (rdv.getRealiseParDelegue() && rdv.getRealiseParMedecin()) {
            return marquerRealiseEtCreerVisite(rdv, "réalisé (double confirmation)");
        }
        return rendezVousRepository.save(rdv);
    }

    private RendezVous marquerRealiseEtCreerVisite(RendezVous rdv, String raisonLog) {
        rdv.setStatut(StatutRendezVousEnum.REALISE);
        rendezVousRepository.save(rdv);

        Visite visite = Visite.builder().rendezVous(rdv).build();
        visiteRepository.save(visite);
        log.info("[Réservations] RDV {} {} — Visite créée.", rdv.getId(), raisonLog);
        return rdv;
    }

    @Override
    @Transactional
    public void resoudreConfirmationsPartiellesExpirees() {
        List<RendezVous> enAttente = rendezVousRepository.findByStatut(StatutRendezVousEnum.RESERVE);
        LocalDateTime maintenant = LocalDateTime.now();

        for (RendezVous rdv : enAttente) {
            LocalDateTime debutRdv = LocalDateTime.of(rdv.getCreneau().getDate(), rdv.getCreneau().getHeureDebut());
            if (maintenant.isAfter(debutRdv.plusHours(DELAI_AUTO_VALIDATION_HEURES))) {
                rdv.setRealiseParDelegue(true);
                rdv.setRealiseParMedecin(true);
                marquerRealiseEtCreerVisite(rdv, "auto-validé après " + DELAI_AUTO_VALIDATION_HEURES + "h sans intervention de l'un ou des deux parties (delegué et medecin )");
            }
        }
    }

    @Override
    @Transactional
    public RendezVous marquerAbsentMedecin(String rendezVousId) {
        // Constaté par le délégué : le médecin ne s'est pas présenté.
        RendezVous rdv = getById(rendezVousId);
        verifierEncoreModifiable(rdv);

        if (Boolean.TRUE.equals(rdv.getRealiseParMedecin())) {
            RendezVous enConflit = passerEnConflit(rdv,
                    "le médecin avait confirmé réalisé, le délégué le marque absent");
            notifierMedecin(enConflit, TypeNotificationEnum.CONFLIT,
                    "Conflit détecté : vous aviez confirmé le rendez-vous du " + creneauLabel(enConflit)
                            + " avec " + nomDelegue(enConflit) + " comme réalisé, mais le délégué vous a marqué absent. "
                            + "Ce rendez-vous est en attente d'investigation.");
            return enConflit;
        }

        rdv.setStatut(StatutRendezVousEnum.ABSENT_MEDECIN);
        creneauService.marquerDisponible(rdv.getCreneau().getId());
        RendezVous resultat = rendezVousRepository.save(rdv);
        notifierMedecin(resultat, TypeNotificationEnum.ABSENCE,
                "Le délégué " + nomDelegue(resultat) + " vous a marqué absent pour le rendez-vous du "
                        + creneauLabel(resultat) + ".");
        return resultat;
    }

    @Override
    @Transactional
    public RendezVous marquerAbsentDelegue(String rendezVousId) {
        // Constaté par le médecin : le délégué ne s'est pas présenté.
        RendezVous rdv = getById(rendezVousId);
        verifierEncoreModifiable(rdv);

        if (Boolean.TRUE.equals(rdv.getRealiseParDelegue())) {
            RendezVous enConflit = passerEnConflit(rdv,
                    "le délégué avait confirmé réalisé, le médecin le marque absent");
            notifierDelegue(enConflit, TypeNotificationEnum.CONFLIT,
                    "Conflit détecté : vous aviez confirmé le rendez-vous du " + creneauLabel(enConflit)
                            + " avec " + nomMedecin(enConflit) + " comme réalisé, mais le médecin vous a marqué absent. "
                            + "Ce rendez-vous est en attente d'investigation.");
            return enConflit;
        }

        rdv.setStatut(StatutRendezVousEnum.ABSENT_DELEGUE);
        creneauService.marquerDisponible(rdv.getCreneau().getId());
        RendezVous resultat = rendezVousRepository.save(rdv);
        notifierDelegue(resultat, TypeNotificationEnum.ABSENCE,
                "Le médecin " + nomMedecin(resultat) + " vous a marqué absent pour le rendez-vous du "
                        + creneauLabel(resultat) + ".");
        return resultat;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RendezVous> getConflits() {
        return rendezVousRepository.findByStatut(StatutRendezVousEnum.CONFLIT);
    }

    /**
     * Bascule le RDV en CONFLIT : une partie avait confirmé "réalisé" pendant que l'autre
     * marque absent/annule. Le créneau n'est PAS libéré tant que le conflit n'est pas résolu
     * manuellement (cf. GET /api/rendezvous/conflits).
     */
    private RendezVous passerEnConflit(RendezVous rdv, String raison) {
        rdv.setStatut(StatutRendezVousEnum.CONFLIT);
        log.warn("[Réservations] CONFLIT sur le RDV {} : {}.", rdv.getId(), raison);
        return rendezVousRepository.save(rdv);
    }

    /**
     * Une fois le RDV REALISE, ANNULE, ABSENT_MEDECIN, ABSENT_DELEGUE ou CONFLIT, plus aucune
     * action ne doit pouvoir le faire changer d'état (protège la Visite/facturation d'une
     * modification a posteriori, et fige les conflits pour l'investigation).
     */
    private void verifierEncoreModifiable(RendezVous rdv) {
        if (rdv.getStatut() != StatutRendezVousEnum.RESERVE) {
            throw new BusinessException(
                    "Ce rendez-vous ne peut plus être modifié (statut actuel : " + rdv.getStatut() + ").");
        }
    }

    /** Le délégué ne peut annuler que tant que l'heure de début du rendez-vous n'est pas passée. */
    private void verifierPasEncoreCommence(RendezVous rdv) {
        LocalDateTime debutRdv = LocalDateTime.of(rdv.getCreneau().getDate(), rdv.getCreneau().getHeureDebut());
        if (LocalDateTime.now().isAfter(debutRdv)) {
            throw new BusinessException("Impossible d'annuler : l'heure du rendez-vous est déjà passée.");
        }
    }

    private void notifierMedecin(RendezVous rdv, TypeNotificationEnum type, String contenu) {
        notificationService.envoyer(rdv.getMedecin().getUser().getId(), type, contenu);
    }

    private void notifierDelegue(RendezVous rdv, TypeNotificationEnum type, String contenu) {
        notificationService.envoyer(rdv.getDelegue().getUser().getId(), type, contenu);
    }

    private String nomMedecin(RendezVous rdv) {
        return "Dr " + rdv.getMedecin().getPrenom() + " " + rdv.getMedecin().getNom();
    }

    private String nomDelegue(RendezVous rdv) {
        return rdv.getDelegue().getPrenom() + " " + rdv.getDelegue().getNom();
    }

    private String creneauLabel(RendezVous rdv) {
        Creneau creneau = rdv.getCreneau();
        return DateTimeFormatter.ofPattern("dd/MM/yyyy").format(creneau.getDate())
                + " à " + DateTimeFormatter.ofPattern("HH:mm").format(creneau.getHeureDebut());
    }
}
