package com.project.medisync.modules.profils.repository;

import com.project.medisync.modules.profils.entity.Delegue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DelegueRepository extends JpaRepository<Delegue, String> {

    List<Delegue> findByLaboratoireId(String laboratoireId);

    Optional<Delegue> findByUserId(String userId);

    boolean existsByUserId(String userId);
}
