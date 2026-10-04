package com.project.medisync.modules.disponibilites.controller;

import com.project.medisync.modules.disponibilites.dto.CreneauGenerationRequest;
import com.project.medisync.modules.disponibilites.dto.CreneauRequest;
import com.project.medisync.modules.disponibilites.dto.CreneauResponse;
import com.project.medisync.modules.disponibilites.service.CreneauService;
import com.project.medisync.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/medecins/creneaux")
@RequiredArgsConstructor
public class CreneauController {

    private final CreneauService creneauService;

    /** POST /api/medecins/creneaux — Création manuelle d'un créneau ponctuel */
    @PostMapping("Ajouter-un-créneau")
    public ResponseEntity<ApiResponse<CreneauResponse>> create(
            @RequestParam String medecinId,
            @Valid @RequestBody CreneauRequest request) {

        var creneau = creneauService.createCreneau(
                medecinId,
                request.date(),
                request.heureDebut());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Créneau créé avec succès.",
                        CreneauResponse.from(creneau)));
    }

    /** POST /api/medecins/creneaux/ajouter-une-plage-de-creneaux — Génération en masse de créneaux sur une plage de dates/heures */
    @PostMapping("/ajouter-une-plage-de-creneaux")
    public ResponseEntity<ApiResponse<List<CreneauResponse>>> ajouterUnePlageDeCreneaux(
            @RequestParam String medecinId,
            @Valid @RequestBody CreneauGenerationRequest request) {

        List<CreneauResponse> list = creneauService.ajouterUnePlageDeCreneaux(
                        medecinId,
                        request.dateDebut(),
                        request.dateFin(),
                        request.heureDebut(),
                        request.heureFin())
                .stream().map(CreneauResponse::from).toList();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        list.size() + " créneau(x) créé(s) avec succès.",
                        list));
    }

    /** DELETE /api/medecins/creneaux/supprimer-une-plage-de-creneaux — Suppression en masse des créneaux DISPONIBLES sur une plage de dates/heures */
    @DeleteMapping("/supprimer-une-plage-de-creneaux")
    public ResponseEntity<ApiResponse<Void>> supprimerUnePlageDeCreneaux(
            @RequestParam String medecinId,
            @Valid @RequestBody CreneauGenerationRequest request) {

        int nbSupprimes = creneauService.supprimerUnePlageDeCreneaux(
                medecinId,
                request.dateDebut(),
                request.dateFin(),
                request.heureDebut(),
                request.heureFin());

        return ResponseEntity.ok(ApiResponse.ok(
                nbSupprimes + " créneau(x) supprimé(s) avec succès.", null));
    }
    @DeleteMapping("/supprimer-un-creneau")
    public ResponseEntity<ApiResponse<Void>> deleteByIdAndMedecinId(
            @RequestParam String creneauId,
            @RequestParam String medecinId){
        creneauService.deleteByIdAndMedecinId(creneauId,medecinId);
        return ResponseEntity.ok(ApiResponse.ok(
                " créneau supprimé avec succès.", null));
    }

    /** GET /medecins/creneaux/periode?medecinId=...&dateDebut=...&dateFin=... — Créneaux d'un médecin sur une période donnée */
    @GetMapping("/periode")
    public ResponseEntity<ApiResponse<List<CreneauResponse>>> getByPeriode(
            @RequestParam String medecinId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        List<CreneauResponse> list = creneauService.getByPeriode(medecinId, dateDebut, dateFin)
                .stream().map(CreneauResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok(
                "Créneaux du " + dateDebut + " au " + dateFin + " récupérés.", list));
    }

    @GetMapping("/all-creneaux")
    public ResponseEntity<ApiResponse<List<CreneauResponse>>> getAllCreneaux(){
        List<CreneauResponse> list = creneauService.getAllCreneaux().stream().map(CreneauResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * GET /api/medecins/{medecinId}/creneaux?semaine=2025-06-30
     * Retourne tous les créneaux d'un médecin pour la semaine
     * contenant la date fournie (lundi → dimanche).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CreneauResponse>>> getBySemaine(
            @RequestParam String medecinId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate semaine) {

        // Si pas de date fournie → semaine en cours
        LocalDate lundi = (semaine != null ? semaine : LocalDate.now())
                .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));

        List<CreneauResponse> list = creneauService.getBySemaine(medecinId, lundi)
                .stream().map(CreneauResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok(
                "Créneaux de la semaine du " + lundi + " récupérés.", list));
    }

    /** GET /api/medecins/{medecinId}/creneaux/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CreneauResponse>> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Créneau récupéré.",
                CreneauResponse.from(creneauService.getById(id))));
    }

    /**
     * GET /api/medecins/{medecinId}/creneaux/disponibles-remplacement
     * Retourne les créneaux disponibles du médecin (semaine en cours + suivante).
     * Utilisé quand un médecin annule un RDV et doit proposer des alternatives.
     */
    @GetMapping("/disponibles-remplacement")
    public ResponseEntity<ApiResponse<List<CreneauResponse>>> getDisponiblesPourRemplacement(
            @RequestParam String medecinId) {

        List<CreneauResponse> list = creneauService.getDisponiblesPourRemplacement(medecinId)
                .stream().map(CreneauResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok(
                "Créneaux disponibles pour remplacement récupérés.", list));
    }

    /** DELETE /api/medecins/{medecinId}/creneaux/{id} */
    /*@DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String medecinId,
            @PathVariable String id) {

        creneauService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Créneau supprimé.", null));
    }*/
}
