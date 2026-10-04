package com.project.medisync.modules.reservations.repository;

import com.project.medisync.modules.reservations.entity.Visite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisiteRepository extends JpaRepository<Visite, String> {
}
