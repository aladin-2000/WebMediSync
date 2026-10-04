package com.project.medisync.modules.reservations.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Preuve qu'un rendez-vous a été réalisé — créée uniquement quand le délégué
 * ET le médecin ont tous les deux confirmé. Sert de base à la facturation.
 */
@Entity
@Table(name = "visite")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rendez_vous_id", nullable = false, unique = true)
    private RendezVous rendezVous;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
