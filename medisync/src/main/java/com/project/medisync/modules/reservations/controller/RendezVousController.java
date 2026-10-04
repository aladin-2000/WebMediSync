package com.project.medisync.modules.reservations.controller;

import com.project.medisync.modules.reservations.dto.AnnulationMedecinRequest;
import com.project.medisync.modules.reservations.dto.ReservationRequest;
import com.project.medisync.modules.reservations.dto.RendezVousResponse;
import com.project.medisync.modules.reservations.entity.StatutRendezVousEnum;
import com.project.medisync.modules.reservations.service.RendezVousService;
import com.project.medisync.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Contrôleur REST gérant les opérations sur les Rendez-vous (réservations, annulations, réalisations).
 */
@RestController
@RequestMapping("/api/rendezvous")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousService rendezVousService;

    /**
     * Réserve un nouveau rendez-vous entre un délégué médical et un médecin sur un créneau donné.
     *
     * @param request Le DTO de requête contenant les identifiants requis (créneau, délégué, médecin).
     * @return Les détails du rendez-vous créé sous forme de RendezVousResponse enveloppé dans un ApiResponse.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RendezVousResponse>> reserver(
            @Valid @RequestBody ReservationRequest request) {
        
        var rdv = rendezVousService.reserver(
                request.creneauId(),
                request.delegueId(),
                request.medecinId()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rendez-vous réservé avec succès.", RendezVousResponse.from(rdv)));
    }

    /**
     * Récupère les informations détaillées d'un rendez-vous par son identifiant unique.
     *
     * @param id L'identifiant unique String du rendez-vous à récupérer.
     * @return Les détails du rendez-vous trouvé.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RendezVousResponse>> getById(
            @PathVariable String id) {
        
        var rdv = rendezVousService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous récupéré avec succès.", RendezVousResponse.from(rdv)));
    }

    /**
     * Récupère la liste de tous les rendez-vous associés à un délégué médical.
     *
     * @param delegueId L'identifiant unique String du délégué médical.
     * @return La liste des rendez-vous correspondants.
     */
    @GetMapping("/delegue/{delegueId}")
    public ResponseEntity<ApiResponse<List<RendezVousResponse>>> getByDelegue(
            @PathVariable String delegueId) {
        
        List<RendezVousResponse> list = rendezVousService.getByDelegue(delegueId)
                .stream()
                .map(RendezVousResponse::from)
                .toList();
        
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous du délégué récupérés.", list));
    }

    /**
     * Récupère les rendez-vous d'un délégué pour un jour donné.
     */
    @GetMapping("/delegue/{delegueId}/jour")
    public ResponseEntity<ApiResponse<List<RendezVousResponse>>> getByDelegueEtJour(
            @PathVariable String delegueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<RendezVousResponse> list = rendezVousService.getByDelegueEtJour(delegueId, date)
                .stream().map(RendezVousResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous du " + date + " récupérés.", list));
    }

    /**
     * Récupère les rendez-vous d'un délégué pour la semaine (lundi → dimanche)
     * contenant la date fournie. Si aucune date n'est fournie, utilise la semaine en cours.
     */
    @GetMapping("/delegue/{delegueId}/semaine")
    public ResponseEntity<ApiResponse<List<RendezVousResponse>>> getByDelegueEtSemaine(
            @PathVariable String delegueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate semaine) {

        LocalDate lundi = (semaine != null ? semaine : LocalDate.now())
                .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));

        List<RendezVousResponse> list = rendezVousService.getByDelegueEtSemaine(delegueId, lundi)
                .stream().map(RendezVousResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous de la semaine du " + lundi + " récupérés.", list));
    }

    /**
     * Récupère la liste de tous les rendez-vous associés à un médecin.
     *
     * @param medecinId L'identifiant unique String du médecin.
     * @return La liste des rendez-vous correspondants.
     */
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<ApiResponse<List<RendezVousResponse>>> getByMedecin(
            @PathVariable String medecinId) {
        
        List<RendezVousResponse> list = rendezVousService.getByMedecin(medecinId)
                .stream()
                .map(RendezVousResponse::from)
                .toList();
        
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous du médecin récupérés.", list));
    }

    /**
     * Récupère les rendez-vous d'un médecin pour un jour donné.
     */
    @GetMapping("/medecin/{medecinId}/jour")
    public ResponseEntity<ApiResponse<List<RendezVousResponse>>> getByMedecinEtJour(
            @PathVariable String medecinId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<RendezVousResponse> list = rendezVousService.getByMedecinEtJour(medecinId, date)
                .stream().map(RendezVousResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous du " + date + " récupérés.", list));
    }

    /**
     * Récupère les rendez-vous d'un médecin pour la semaine (lundi → dimanche)
     * contenant la date fournie. Si aucune date n'est fournie, utilise la semaine en cours.
     */
    @GetMapping("/medecin/{medecinId}/semaine")
    public ResponseEntity<ApiResponse<List<RendezVousResponse>>> getByMedecinEtSemaine(
            @PathVariable String medecinId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate semaine) {

        LocalDate lundi = (semaine != null ? semaine : LocalDate.now())
                .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));

        List<RendezVousResponse> list = rendezVousService.getByMedecinEtSemaine(medecinId, lundi)
                .stream().map(RendezVousResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous de la semaine du " + lundi + " récupérés.", list));
    }

    /**
     * Annule un rendez-vous à l'initiative du délégué médical.
     *
     * @param id L'identifiant unique String du rendez-vous à annuler.
     * @return Les détails du rendez-vous annulé.
     */
    @PatchMapping("/{id}/annuler-delegue")
    public ResponseEntity<ApiResponse<RendezVousResponse>> annulerParDelegue(
            @PathVariable String id) {

        var rdv = rendezVousService.annulerParDelegue(id);
        String message = rdv.getStatut() == StatutRendezVousEnum.CONFLIT
                ? "Conflit détecté : le médecin avait confirmé ce rendez-vous comme réalisé. Il a été mis en attente d'investigation."
                : "Rendez-vous annulé avec succès par le délégué.";
        return ResponseEntity.ok(ApiResponse.ok(message, RendezVousResponse.from(rdv)));
    }

    /**
     * Annule un rendez-vous à l'initiative du médecin, avec justification obligatoire.
     *
     * @param id      L'identifiant unique String du rendez-vous à annuler.
     * @param request Le DTO contenant le motif d'annulation.
     * @return Les détails du rendez-vous annulé.
     */
    @PatchMapping("/{id}/annuler-medecin")
    public ResponseEntity<ApiResponse<RendezVousResponse>> annulerParMedecin(
            @PathVariable String id,
            @Valid @RequestBody AnnulationMedecinRequest request) {

        var rdv = rendezVousService.annulerParMedecin(id, request.motifAnnulation());
        String message = rdv.getStatut() == StatutRendezVousEnum.CONFLIT
                ? "Conflit détecté : le délégué avait confirmé ce rendez-vous comme réalisé. Il a été mis en attente d'investigation."
                : "Rendez-vous annulé avec succès par le médecin.";
        return ResponseEntity.ok(ApiResponse.ok(message, RendezVousResponse.from(rdv)));
    }

    /**
     * Confirmation du délégué que le rendez-vous a été réalisé.
     * Le statut ne passe à REALISE que si le médecin a aussi confirmé.
     *
     * @param id L'identifiant unique String du rendez-vous.
     * @return Les détails du rendez-vous mis à jour.
     */
    @PatchMapping("/{id}/realise-delegue")
    public ResponseEntity<ApiResponse<RendezVousResponse>> realiserParDelegue(
            @PathVariable String id) {

        var rdv = rendezVousService.realiserParDelegue(id);
        String message = rdv.getStatut().name().equals("REALISE")
                ? "Rendez-vous confirmé réalisé par les deux parties."
                : "Confirmation du délégué enregistrée, en attente de la confirmation du médecin.";
        return ResponseEntity.ok(ApiResponse.ok(message, RendezVousResponse.from(rdv)));
    }

    /**
     * Confirmation du médecin que le rendez-vous a été réalisé.
     * Le statut ne passe à REALISE que si le délégué a aussi confirmé.
     *
     * @param id L'identifiant unique String du rendez-vous.
     * @return Les détails du rendez-vous mis à jour.
     */
    @PatchMapping("/{id}/realise-medecin")
    public ResponseEntity<ApiResponse<RendezVousResponse>> realiserParMedecin(
            @PathVariable String id) {

        var rdv = rendezVousService.realiserParMedecin(id);
        String message = rdv.getStatut().name().equals("REALISE")
                ? "Rendez-vous confirmé réalisé par les deux parties."
                : "Confirmation du médecin enregistrée, en attente de la confirmation du délégué.";
        return ResponseEntity.ok(ApiResponse.ok(message, RendezVousResponse.from(rdv)));
    }

    /**
     * Le délégué constate que le médecin ne s'est pas présenté au rendez-vous.
     *
     * @param id L'identifiant unique String du rendez-vous.
     * @return Les détails du rendez-vous mis à jour.
     */
    @PatchMapping("/{id}/absent-medecin")
    public ResponseEntity<ApiResponse<RendezVousResponse>> marquerAbsentMedecin(
            @PathVariable String id) {

        var rdv = rendezVousService.marquerAbsentMedecin(id);
        String message = rdv.getStatut() == StatutRendezVousEnum.CONFLIT
                ? "Conflit détecté : le médecin avait confirmé ce rendez-vous comme réalisé. Il a été mis en attente d'investigation."
                : "Rendez-vous marqué avec absence du médecin.";
        return ResponseEntity.ok(ApiResponse.ok(message, RendezVousResponse.from(rdv)));
    }

    /**
     * Le médecin constate que le délégué ne s'est pas présenté au rendez-vous.
     *
     * @param id L'identifiant unique String du rendez-vous.
     * @return Les détails du rendez-vous mis à jour.
     */
    @PatchMapping("/{id}/absent-delegue")
    public ResponseEntity<ApiResponse<RendezVousResponse>> marquerAbsentDelegue(
            @PathVariable String id) {

        var rdv = rendezVousService.marquerAbsentDelegue(id);
        String message = rdv.getStatut() == StatutRendezVousEnum.CONFLIT
                ? "Conflit détecté : le délégué avait confirmé ce rendez-vous comme réalisé. Il a été mis en attente d'investigation."
                : "Rendez-vous marqué avec absence du délégué.";
        return ResponseEntity.ok(ApiResponse.ok(message, RendezVousResponse.from(rdv)));
    }

    /**
     * Liste les rendez-vous en statut CONFLIT (une partie a confirmé réalisé pendant que
     * l'autre marquait absent ou annulait), pour investigation manuelle. Réservé aux admins.
     */
    @GetMapping("/conflits")
    public ResponseEntity<ApiResponse<List<RendezVousResponse>>> getConflits() {
        List<RendezVousResponse> list = rendezVousService.getConflits()
                .stream().map(RendezVousResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous en conflit récupérés.", list));
    }
}
