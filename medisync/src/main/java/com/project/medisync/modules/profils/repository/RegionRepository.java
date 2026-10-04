package com.project.medisync.modules.profils.repository;

import com.project.medisync.modules.profils.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionRepository extends JpaRepository<Region, String> {

    boolean existsByNom(String nom);

    List<Region> findAllByOrderByNomAsc();
}
