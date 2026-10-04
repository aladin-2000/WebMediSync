package com.project.medisync.modules.notifications.dto;

import com.project.medisync.modules.notifications.entity.Notification;
import com.project.medisync.modules.notifications.entity.TypeNotificationEnum;

import java.time.LocalDateTime;

/**
 * Représente la réponse API contenant les détails d'une notification.
 */
public record NotificationResponse(
        String id,
        TypeNotificationEnum type,
        String contenu,
        Boolean isRead,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType(),
                n.getContenu(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}
