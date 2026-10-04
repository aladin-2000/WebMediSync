package com.project.medisync.modules.notifications.controller;

import com.project.medisync.modules.notifications.dto.NotificationResponse;
import com.project.medisync.modules.notifications.service.NotificationService;
import com.project.medisync.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST gérant les notifications de l'utilisateur connecté.
 * Chaque route résout l'utilisateur depuis le JWT — on ne peut consulter/marquer
 * que ses propres notifications.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Liste les notifications de l'utilisateur connecté, les plus récentes en premier.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMesNotifications(Authentication auth) {
        List<NotificationResponse> list = notificationService.getByUser(auth.getName())
                .stream().map(NotificationResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Nombre de notifications non lues de l'utilisateur connecté (pour le badge de la cloche).
     */
    @GetMapping("/non-lues/nombre")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getNombreNonLues(Authentication auth) {
        long count = notificationService.countNonLues(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("nombre", count)));
    }

    /**
     * Marque une notification comme lue.
     */
    @PatchMapping("/{id}/lue")
    public ResponseEntity<ApiResponse<Void>> marquerLue(@PathVariable String id) {
        notificationService.marquerLue(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marquée comme lue.", null));
    }

    /**
     * Marque toutes les notifications de l'utilisateur connecté comme lues.
     */
    @PatchMapping("/lues")
    public ResponseEntity<ApiResponse<Void>> marquerToutesLues(Authentication auth) {
        notificationService.marquerToutesLues(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Toutes les notifications ont été marquées comme lues.", null));
    }
}
