package com.project.medisync.modules.auth.dto;

import com.project.medisync.modules.auth.entity.RoleEnum;
import com.project.medisync.modules.auth.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private String          id;
    private String        email;
    private RoleEnum      role;
    private Boolean       isActive;
    private Boolean       mustChangePassword;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .mustChangePassword(user.getMustChangePassword())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
