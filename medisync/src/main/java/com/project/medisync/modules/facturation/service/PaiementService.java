package com.project.medisync.modules.facturation.service;

import com.project.medisync.modules.facturation.entity.MethodePaiementEnum;
import com.project.medisync.modules.facturation.entity.Paiement;
import com.project.medisync.modules.facturation.entity.StatutPaiementEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Interface publique du module Facturation.
 * Utilisée notamment par le module Profils pour lier un paiement à un laboratoire.
 */
public interface PaiementService {

    Paiement create(String laboratoireId, BigDecimal montant, String devise,
                    StatutPaiementEnum statut, MethodePaiementEnum methode,
                    String referenceExterne, LocalDate periodeDebut, LocalDate periodeFin);

    Paiement getById(String id);

    List<Paiement> getByLaboratoire(String laboratoireId);

    Paiement updateStatut(String id, StatutPaiementEnum nouveauStatut);

    void delete(String id);
}
