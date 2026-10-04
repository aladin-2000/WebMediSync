package com.project.medisync.modules.auth.dto;

import com.project.medisync.modules.auth.entity.RoleEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "L'email est obligatoire.")
    @Email(message = "Format d'email invalide.")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    private String password;

    @NotNull(message = "Le rôle est obligatoire.")
    private RoleEnum role;
}
