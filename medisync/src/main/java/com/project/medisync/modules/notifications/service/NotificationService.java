package com.project.medisync.modules.notifications.service;

import com.project.medisync.modules.notifications.entity.Notification;
import com.project.medisync.modules.notifications.entity.TypeNotificationEnum;

import java.util.List;

/**
 * Interface publique du module Notifications.
 * Peut être appelée par n'importe quel autre module pour envoyer une notification.
 */
public interface NotificationService {

    Notification envoyer(String userId, TypeNotificationEnum type, String contenu);

    List<Notification> getByUser(String userId);

    List<Notification> getNonLuesByUser(String userId);

    long countNonLues(String userId);

    void marquerLue(String notificationId);

    void marquerToutesLues(String userId);
}
