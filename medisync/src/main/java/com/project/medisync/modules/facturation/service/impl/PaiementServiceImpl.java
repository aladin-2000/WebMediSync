package com.project.medisync.modules.facturation.service.impl;

import com.project.medisync.modules.facturation.entity.MethodePaiementEnum;
import com.project.medisync.modules.facturation.entity.Paiement;
import com.project.medisync.modules.facturation.entity.StatutPaiementEnum;
import com.project.medisync.modules.facturation.repository.PaiementRepository;
import com.project.medisync.modules.facturation.service.PaiementService;
import com.project.medisync.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {

    private final PaiementRepository paiementRepository;

    @Override
    @Transactional
    public Paiement create(String laboratoireId, BigDecimal montant, String devise,
                           StatutPaiementEnum statut, MethodePaiementEnum methode,
                           String referenceExterne, LocalDate periodeDebut, LocalDate periodeFin) {
        Paiement paiement = Paiement.builder()
                .laboratoireId(laboratoireId)
                .montant(montant)
                .devise(devise)
                .statut(statut)
                .methode(methode)
                .referenceExterne(referenceExterne)
                .periodeDebut(periodeDebut)
                .periodeFin(periodeFin)
                .build();
        return paiementRepository.save(paiement);
    }

    @Override
    @Transactional(readOnly = true)
    public Paiement getById(String id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Paiement> getByLaboratoire(String laboratoireId) {
        return paiementRepository.findByLaboratoireId(laboratoireId);
    }

    @Override
    @Transactional
    public Paiement updateStatut(String id, StatutPaiementEnum nouveauStatut) {
        Paiement paiement = getById(id);
        paiement.setStatut(nouveauStatut);
        return paiementRepository.save(paiement);
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (!paiementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Paiement", id);
        }
        paiementRepository.deleteById(id);
    }
}
