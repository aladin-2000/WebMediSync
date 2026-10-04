package com.project.medisync.modules.notifications.service.impl;

import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.modules.notifications.entity.Notification;
import com.project.medisync.modules.notifications.entity.TypeNotificationEnum;
import com.project.medisync.modules.notifications.repository.NotificationRepository;
import com.project.medisync.modules.notifications.service.NotificationService;
import com.project.medisync.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService            userService;

    @Override
    @Transactional
    public Notification envoyer(String userId, TypeNotificationEnum type, String contenu) {
        Notification notification = Notification.builder()
                .user(userService.getById(userId))
                .type(type)
                .contenu(contenu)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNonLuesByUser(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countNonLues(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void marquerLue(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void marquerToutesLues(String userId) {
        notificationRepository.findByUserIdAndIsReadFalse(userId).forEach(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }
}
