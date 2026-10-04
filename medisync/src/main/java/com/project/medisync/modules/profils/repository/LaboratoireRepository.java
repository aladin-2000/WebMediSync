package com.project.medisync.modules.profils.repository;

import com.project.medisync.modules.profils.entity.Laboratoire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LaboratoireRepository extends JpaRepository<Laboratoire, String> {

    Optional<Laboratoire> findByUserId(String userId);

    boolean existsByUserId(String userId);

    boolean existsByNom(String nom);
}
