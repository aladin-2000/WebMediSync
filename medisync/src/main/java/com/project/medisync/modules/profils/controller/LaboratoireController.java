package com.project.medisync.modules.profils.controller;

import com.project.medisync.modules.profils.dto.CreateLaboratoireCompletRequest;
import com.project.medisync.modules.profils.dto.CreateLaboratoireRequest;
import com.project.medisync.modules.profils.dto.InscriptionLaboratoireRequest;
import com.project.medisync.modules.profils.dto.LaboratoireResponse;
import com.project.medisync.modules.profils.service.LaboratoireService;
import com.project.medisync.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST gérant les opérations CRUD sur les profils des Laboratoires
 * dans le cadre du module Profils.
 */
@RestController
@RequestMapping("/api/laboratoires")
@RequiredArgsConstructor
public class LaboratoireController {

    private final LaboratoireService laboratoireService;

    /**
     * Crée un nouveau profil de Laboratoire associé à un compte utilisateur existant.
     *
     * @param req DTO contenant les informations du laboratoire à créer
     * @return Les détails du laboratoire créé encapsulés dans un ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LaboratoireResponse>> create(@Valid @RequestBody CreateLaboratoireRequest req) {
        var labo = laboratoireService.create(
                req.getUserId(), req.getNom(), req.getAdresse(), req.getTelephone(),
                req.getStatutAbonnement(), req.getDateDebutAbonnement(), req.getDateFinAbonnement());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Laboratoire créé avec succès.", LaboratoireResponse.from(labo)));
    }

    /**
     * Auto-inscription publique d'un laboratoire (web uniquement) : crée le compte (email non
     * vérifié) et le profil avec un abonnement d'essai, puis envoie un email de vérification.
     */
    @PostMapping("/inscription")
    public ResponseEntity<ApiResponse<LaboratoireResponse>> inscrire(@Valid @RequestBody InscriptionLaboratoireRequest req) {
        var labo = laboratoireService.inscrire(req.getEmail(), req.getPassword(), req.getNom(), req.getAdresse(), req.getTelephone());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Compte créé. Vérifiez votre boîte email pour activer votre compte.",
                        LaboratoireResponse.from(labo)));
    }

    /**
     * Admin : crée en un seul appel le compte (email + mot de passe) et le profil laboratoire.
     */
    @PostMapping("/creer-labo-complet")
    public ResponseEntity<ApiResponse<LaboratoireResponse>> creerLaboratoireComplet(
            @Valid @RequestBody CreateLaboratoireCompletRequest req) {
        var labo = laboratoireService.creerLaboratoireComplet(
                req.getEmail(), req.getPassword(), req.getNom(), req.getAdresse(), req.getTelephone(),
                req.getStatutAbonnement(), req.getDateDebutAbonnement(), req.getDateFinAbonnement());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Compte et profil laboratoire créés avec succès.", LaboratoireResponse.from(labo)));
    }

    /**
     * Admin : réactive un laboratoire.
     */
    @PatchMapping("/{id}/activer")
    public ResponseEntity<ApiResponse<LaboratoireResponse>> activer(@PathVariable String id) {
        var labo = laboratoireService.activer(id);
        return ResponseEntity.ok(ApiResponse.ok("Laboratoire réactivé.", LaboratoireResponse.from(labo)));
    }

    /**
     * Admin : désactive un laboratoire — il ne peut plus se connecter, et tous ses délégués
     * sont désactivés avec lui.
     */
    @PatchMapping("/{id}/desactiver")
    public ResponseEntity<ApiResponse<LaboratoireResponse>> desactiver(@PathVariable String id) {
        var labo = laboratoireService.desactiver(id);
        return ResponseEntity.ok(ApiResponse.ok("Laboratoire désactivé, ainsi que ses délégués.", LaboratoireResponse.from(labo)));
    }

    /**
     * Récupère la liste de tous les laboratoires actifs (non soft-deleted) de la plateforme.
     *
     * @return La liste de tous les laboratoires sous forme de DTO
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LaboratoireResponse>>> getAll() {
        List<LaboratoireResponse> list = laboratoireService.getAll()
                .stream().map(LaboratoireResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Récupère un profil de Laboratoire spécifique par son identifiant unique String.
     *
     * @param id L'identifiant unique String du laboratoire à récupérer
     * @return Les détails du laboratoire trouvé
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LaboratoireResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(LaboratoireResponse.from(laboratoireService.getById(id))));
    }

    /**
     * Récupère le profil laboratoire (et donc son laboratoireId) à partir du userId du compte connecté.
     */
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<LaboratoireResponse>> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.ok(LaboratoireResponse.from(laboratoireService.getByUserId(userId))));
    }

    /**
     * Met à jour les informations d'un profil de Laboratoire existant.
     *
     * @param id L'identifiant unique String du laboratoire à modifier
     * @param req DTO contenant les nouvelles valeurs pour les informations du laboratoire
     * @return Les détails du laboratoire mis à jour
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LaboratoireResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody CreateLaboratoireRequest req) {
        var labo = laboratoireService.update(
                id, req.getNom(), req.getAdresse(), req.getTelephone(),
                req.getStatutAbonnement(), req.getDateDebutAbonnement(), req.getDateFinAbonnement());
        return ResponseEntity.ok(ApiResponse.ok("Laboratoire mis à jour.", LaboratoireResponse.from(labo)));
    }

    /**
     * Supprime de façon logique (soft delete) un laboratoire de la plateforme.
     *
     * @param id L'identifiant unique String du laboratoire à soft-delete
     * @return Un message indiquant le succès de la suppression logique
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        laboratoireService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Laboratoire supprimé.", null));
    }
}
