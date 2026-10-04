package com.project.medisync.modules.auth.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

/**
 * Génère et lit les tokens JWT.
 * Le token contient : userId (subject) + role (claim), signé, avec une expiration configurable.
 */
@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                    @Value("${jwt.expiration-ms}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.expirationMs = expirationMs;
    }

    /** Génère un token pour un utilisateur donné. */
    public String genererToken(String userId, String role) {
        Date maintenant = new Date();
        Date expiration = new Date(maintenant.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .issuedAt(maintenant)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    /** Extrait le userId (subject) d'un token. Lève une exception si le token est invalide/expiré. */
    public String getUserIdDepuisToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /** Extrait le rôle d'un token. */
    public String getRoleDepuisToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }
}
