package com.project.medisync.modules.auth.controller;

import com.project.medisync.modules.auth.dto.AuthResponse;
import com.project.medisync.modules.auth.dto.ChangePasswordRequest;
import com.project.medisync.modules.auth.dto.LoginRequest;
import com.project.medisync.modules.auth.dto.RenvoyerVerificationRequest;
import com.project.medisync.modules.auth.dto.UserResponse;
import com.project.medisync.modules.auth.entity.User;
import com.project.medisync.modules.auth.security.JwtUtil;
import com.project.medisync.modules.auth.service.EmailVerificationService;
import com.project.medisync.modules.auth.service.UserService;
import com.project.medisync.shared.dto.ApiResponse;
import com.project.medisync.shared.exception.BusinessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Authentification par JWT : le login renvoie un token, à renvoyer ensuite
 * dans le header "Authorization: Bearer <token>" sur les requêtes protégées.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    /**
     * Vérifie l'email et le mot de passe, renvoie un token JWT + les infos de l'utilisateur.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {

        if (!userService.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email ou mot de passe incorrect.");
        }

        User user = userService.getByEmail(req.getEmail());

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("Email ou mot de passe incorrect.");
        }
        if (!user.getIsActive()) {
            throw new BusinessException("Ce compte est désactivé.");
        }
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BusinessException("Veuillez vérifier votre adresse email avant de vous connecter (consultez votre boîte de réception).");
        }

        String token = jwtUtil.genererToken(user.getId(), user.getRole().name());
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .user(UserResponse.from(user))
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Connexion réussie.", response));
    }

    /**
     * Valide le jeton reçu par email et marque le compte comme email vérifié.
     */
    @GetMapping("/verifier-email")
    public ResponseEntity<ApiResponse<Void>> verifierEmail(@RequestParam String token) {
        emailVerificationService.verifier(token);
        return ResponseEntity.ok(ApiResponse.ok("Email vérifié avec succès. Vous pouvez maintenant vous connecter.", null));
    }

    /**
     * Renvoie l'email de vérification (nouveau jeton) si le compte n'est pas déjà vérifié.
     */
    @PostMapping("/renvoyer-verification")
    public ResponseEntity<ApiResponse<Void>> renvoyerVerification(@Valid @RequestBody RenvoyerVerificationRequest req) {
        emailVerificationService.renvoyer(req.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Email de vérification renvoyé.", null));
    }

    /**
     * Revalide le token et renvoie les infos de l'utilisateur connecté.
     * Utilisé par le front au démarrage de l'app pour vérifier si le token est toujours valide.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        String userId = authentication.getName();
        User user = userService.getById(userId);
        return ResponseEntity.ok(ApiResponse.ok(UserResponse.from(user)));
    }

    /**
     * Change le mot de passe de l'utilisateur connecté.
     * À appeler obligatoirement après le premier login (tant que mustChangePassword=true).
     */
    @PutMapping("/changer-mot-de-passe")
    public ResponseEntity<ApiResponse<Void>> changerMotDePasse(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest req) {

        User user = userService.getById(authentication.getName());

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Mot de passe actuel incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setMustChangePassword(false);
        userService.save(user);

        return ResponseEntity.ok(ApiResponse.ok("Mot de passe changé avec succès.", null));
    }
}
