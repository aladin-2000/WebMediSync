package com.project.medisync.modules.profils.dto;

/**
 * Option de région exposée au frontend : l'id de la région (à renvoyer dans les
 * requêtes, ex. filtre de recherche ou rattachement d'un médecin) et son libellé
 * affichable. Même forme que {@link SpecialiteOption} pour rester cohérent côté front.
 */
public record RegionOption(String valeur, String libelle) {}
