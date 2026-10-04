package com.project.medisync.modules.profils.controller;

import com.project.medisync.modules.disponibilites.service.CreneauService;
import com.project.medisync.modules.profils.dto.CreateMedecinCompletRequest;
import com.project.medisync.modules.profils.dto.CreateMedecinRequest;
import com.project.medisync.modules.profils.dto.InscriptionMedecinRequest;
import com.project.medisync.modules.profils.dto.MedecinResponse;
import com.project.medisync.modules.profils.dto.UpdateMedecinRequest;
import com.project.medisync.modules.profils.dto.RegionOption;
import com.project.medisync.modules.profils.dto.SpecialiteOption;
import com.project.medisync.modules.profils.entity.Region;
import com.project.medisync.modules.profils.entity.SpecialiteEnum;
import com.project.medisync.modules.profils.service.MedecinService;
import com.project.medisync.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Contrôleur REST gérant les opérations CRUD sur les profils des Médecins
 * dans le cadre du module Profils.
 */
@RestController
@RequestMapping("/medecins")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinService medecinService;
    private final CreneauService creneauService;

    /**
     * Crée un nouveau profil Médecin associé à un compte utilisateur existant.
     *
     * @param req DTO contenant les informations du médecin à créer
     * @return Les détails du profil médecin créé encapsulés dans un ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MedecinResponse>> create(@Valid @RequestBody CreateMedecinRequest req) {
        var medecin = medecinService.create(
                req.getUserId(), req.getNom(), req.getPrenom(), req.getSpecialite(),
                req.getAdresseCabinet(), req.getTelephone(), req.getLatitude(), req.getLongitude(),
                req.getScoreFiabiliteMin(), req.getRegionId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Profil médecin créé avec succès.", MedecinResponse.from(medecin)));
    }

    /**
     * Auto-inscription publique d'un médecin : crée le compte (email non vérifié) et le
     * profil (non validé), puis envoie un email de vérification. Le médecin devra ensuite
     * être validé par un admin avant d'apparaître dans les recherches du délégué.
     */
    @PostMapping("/inscription")
    public ResponseEntity<ApiResponse<MedecinResponse>> inscrire(@Valid @RequestBody InscriptionMedecinRequest req) {
        var medecin = medecinService.inscrire(
                req.getEmail(), req.getPassword(), req.getNom(), req.getPrenom(), req.getSpecialite(),
                req.getAdresseCabinet(), req.getTelephone(), req.getLatitude(), req.getLongitude(), req.getRegionId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Compte créé. Vérifiez votre boîte email pour activer votre compte, "
                                + "puis attendez la validation de votre profil par un administrateur.",
                        MedecinResponse.from(medecin)));
    }

    /**
     * Admin : liste les médecins auto-inscrits en attente de validation.
     */
    @GetMapping("/en-attente")
    public ResponseEntity<ApiResponse<List<MedecinResponse>>> getEnAttente() {
        List<MedecinResponse> list = medecinService.getEnAttente()
                .stream().map(MedecinResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Admin : valide le profil d'un médecin auto-inscrit, le rendant visible dans les recherches.
     */
    @PatchMapping("/{id}/valider")
    public ResponseEntity<ApiResponse<MedecinResponse>> valider(@PathVariable String id) {
        var medecin = medecinService.valider(id);
        return ResponseEntity.ok(ApiResponse.ok("Médecin validé avec succès.", MedecinResponse.from(medecin)));
    }

    /**
     * Admin : crée en un seul appel le compte (email + mot de passe) et le profil médecin.
     * Permet de créer rapidement des médecins de test depuis une page d'administration.
     *
     * @param req DTO contenant email, mot de passe et informations du médecin
     * @return Les détails du profil médecin créé encapsulés dans un ApiResponse
     */
    @PostMapping("/creer-medecin-complet")
    public ResponseEntity<ApiResponse<MedecinResponse>> creerMedecinComplet(
            @Valid @RequestBody CreateMedecinCompletRequest req) {
        var medecin = medecinService.creerMedecinComplet(
                req.getEmail(), req.getPassword(), req.getNom(), req.getPrenom(), req.getSpecialite(),
                req.getAdresseCabinet(), req.getTelephone(), req.getLatitude(), req.getLongitude(),
                req.getScoreFiabiliteMin(), req.getRegionId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Compte et profil médecin créés avec succès.", MedecinResponse.from(medecin)));
    }

    /**
     * Récupère la liste de tous les médecins actifs (non soft-deleted) de la plateforme.
     *
     * @return La liste de tous les médecins sous forme de DTO
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MedecinResponse>>> getAll() {
        List<MedecinResponse> list = medecinService.getAll()
                .stream().map(MedecinResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Récupère un profil Médecin spécifique par son identifiant unique String.
     *
     * @param id L'identifiant unique String du médecin à récupérer
     * @return Les détails du profil médecin trouvé
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedecinResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(MedecinResponse.from(medecinService.getById(id))));
    }

    /**
     * Récupère le profil médecin (et donc son medecinId) à partir du userId du compte connecté.
     */
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<MedecinResponse>> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.ok(MedecinResponse.from(medecinService.getByUserId(userId))));
    }

    /**
     * Retourne les médecins ayant au moins un créneau DISPONIBLE à la date et
     * dans la plage horaire données.
     */
    @GetMapping("/disponibles")
    public ResponseEntity<ApiResponse<List<MedecinResponse>>> getMedecinsAvecCreneauxLibres(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureFin) {

        LocalTime debut = heureDebut != null ? heureDebut : LocalTime.of(0, 0);
        LocalTime fin   = heureFin   != null ? heureFin   : LocalTime.of(23, 0);

        List<String> medecinIds = creneauService.getMedecinIdsAvecCreneauxLibres(date,date, debut, fin);
        List<MedecinResponse> list = medecinService.getByIds(medecinIds)
                .stream().map(MedecinResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Recherche des médecins par nom et/ou spécialités (une ou plusieurs), parmi ceux ayant
     * au moins un créneau DISPONIBLE à la date et dans la plage horaire données.
     */
    @GetMapping("/recherche")
    public ResponseEntity<ApiResponse<List<MedecinResponse>>> rechercherMedecinsDisponibles(
            @RequestParam(required = false, defaultValue = "") String nom,
            @RequestParam(required = false) List<SpecialiteEnum> specialites,
            @RequestParam(required = false) String regionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate searchDateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate searchDateFin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureFin) {
        LocalTime debut = heureDebut != null ? heureDebut : LocalTime.MIN;
        LocalTime fin   = heureFin   != null ? heureFin   : LocalTime.MAX;

        List<String> medecinIds = creneauService.getMedecinIdsAvecCreneauxLibres(searchDateDebut,searchDateFin ,  debut, fin);
        List<MedecinResponse> list = medecinService.searchByIdsNomSpecialitesRegion(medecinIds, nom, specialites, regionId)
                .stream().map(MedecinResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Récupère la liste des médecins exerçant une spécialité médicale donnée.
     *
     * @param specialite La spécialité médicale recherchée
     * @return La liste des médecins correspondants
     */
    @GetMapping("/specialite/{specialite}")
    public ResponseEntity<ApiResponse<List<MedecinResponse>>> getBySpecialite(@PathVariable SpecialiteEnum specialite) {
        List<MedecinResponse> list = medecinService.getBySpecialite(specialite)
                .stream().map(MedecinResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Liste toutes les spécialités médicales disponibles (valeur enum + libellé affichable),
     * utilisée par le frontend pour construire un sélecteur (ex: liste à cocher côté délégué).
     */
    @GetMapping("/specialites")
    public ResponseEntity<ApiResponse<List<SpecialiteOption>>> getSpecialites() {
        List<SpecialiteOption> list = java.util.Arrays.stream(SpecialiteEnum.values())
                .map(s -> new SpecialiteOption(s.name(), s.getLibelle()))
                .sorted(java.util.Comparator.comparing(SpecialiteOption::libelle, String.CASE_INSENSITIVE_ORDER))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Liste toutes les régions de référence (id + nom), utilisée par le frontend pour
     * construire un sélecteur (rattachement d'un médecin, filtre de recherche du délégué).
     */
    @GetMapping("/regions")
    public ResponseEntity<ApiResponse<List<RegionOption>>> getRegions() {
        List<RegionOption> list = medecinService.getRegions()
                .stream().map(r -> new RegionOption(r.getId(), r.getNom())).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Met à jour les informations du profil d'un médecin existant.
     *
     * @param id L'identifiant unique String du médecin à modifier
     * @param req DTO contenant les nouvelles valeurs pour les informations du médecin
     * @return Les détails du profil médecin mis à jour
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedecinResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateMedecinRequest req) {
        var medecin = medecinService.update(
                id, req.getNom(), req.getPrenom(), req.getSpecialite(),
                req.getAdresseCabinet(), req.getTelephone(), req.getLatitude(), req.getLongitude(),
                req.getScoreFiabiliteMin(), req.getRegionId());
        return ResponseEntity.ok(ApiResponse.ok("Profil médecin mis à jour.", MedecinResponse.from(medecin)));
    }

    /**
     * Permet au médecin connecté de mettre à jour son propre profil
     * (nom, prénom, spécialité, coordonnées, téléphone, score minimum accepté).
     * Ne touche jamais à l'email/mot de passe — ça reste sur /auth/changer-mot-de-passe.
     *
     * @param auth Authentification du médecin connecté (résout son userId depuis le JWT)
     * @param req  DTO contenant les nouvelles valeurs pour son profil
     * @return Les détails du profil médecin mis à jour
     */
    @PutMapping("/mon-profil")
    public ResponseEntity<ApiResponse<MedecinResponse>> updateMonProfil(
            Authentication auth,
            @Valid @RequestBody UpdateMedecinRequest req) {
        var medecinActuel = medecinService.getByUserId(auth.getName());
        var medecin = medecinService.update(
                medecinActuel.getId(), req.getNom(), req.getPrenom(), req.getSpecialite(),
                req.getAdresseCabinet(), req.getTelephone(), req.getLatitude(), req.getLongitude(),
                req.getScoreFiabiliteMin(), req.getRegionId());
        return ResponseEntity.ok(ApiResponse.ok("Profil mis à jour.", MedecinResponse.from(medecin)));
    }

    /**
     * Supprime de façon logique (soft delete) un médecin de la plateforme.
     *
     * @param id L'identifiant unique String du médecin à soft-delete
     * @return Un message indiquant le succès de la suppression logique
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        medecinService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Profil médecin supprimé.", null));
    }
}
