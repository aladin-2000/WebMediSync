package com.project.medisync.modules.profils.dto;

/**
 * Option de spécialité exposée au frontend : la valeur enum (à renvoyer dans les requêtes)
 * et son libellé affichable.
 */
public record SpecialiteOption(String valeur, String libelle) {}
