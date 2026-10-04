package com.project.medisync.modules.facturation.repository;

import com.project.medisync.modules.facturation.entity.Paiement;
import com.project.medisync.modules.facturation.entity.StatutPaiementEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, String> {

    List<Paiement> findByLaboratoireId(String laboratoireId);

    List<Paiement> findByLaboratoireIdAndStatut(String laboratoireId, StatutPaiementEnum statut);
}
