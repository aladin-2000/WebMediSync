package com.project.medisync.modules.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Configuration centrale de la sécurité : définit quelles routes sont publiques,
 * lesquelles nécessitent d'être connecté, et lesquelles nécessitent un rôle précis.
 */
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Pré-vol CORS du navigateur — toujours autorisé
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Authentification — public
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/verifier-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/renvoyer-verification").permitAll()

                        // Auto-inscription médecin/délégué/laboratoire — public
                        .requestMatchers(HttpMethod.POST, "/medecins/inscription").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/delegues/inscription").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/laboratoires/inscription").permitAll()

                        // Liste des laboratoires — public (sélection du labo à l'inscription du délégué)
                        .requestMatchers(HttpMethod.GET, "/api/laboratoires").permitAll()

                        // Gestion des laboratoires — réservée aux admins (avant les regles LABO plus larges ci-dessous)
                        .requestMatchers(HttpMethod.POST, "/api/laboratoires/creer-labo-complet").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/laboratoires/*/activer").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/laboratoires/*/desactiver").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/laboratoires").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/laboratoires/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/laboratoires/**").hasRole("ADMIN")

                        // Admin : médecins auto-inscrits en attente de validation — avant le GET /medecins/** public ci-dessous
                        .requestMatchers(HttpMethod.GET, "/medecins/en-attente").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/medecins/*/valider").hasRole("ADMIN")

                        // Consultation des médecins et créneaux — public (recherche de médecin sans compte)
                        .requestMatchers(HttpMethod.GET, "/medecins/**").permitAll()

                        // Profil du medecin/delegue connecte lui-meme — avant les regles ADMIN plus larges ci-dessous
                        .requestMatchers(HttpMethod.PUT, "/medecins/mon-profil").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.PUT, "/api/delegues/mon-profil").hasRole("DELEGUE")

                        // Gestion des créneaux — admin ou le médecin lui-même — avant les regles ADMIN plus larges ci-dessous
                        .requestMatchers(HttpMethod.POST, "/medecins/creneaux/**").hasAnyRole("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.DELETE, "/medecins/creneaux/**").hasAnyRole("ADMIN", "MEDECIN")

                        // Admin : statistiques de la plateforme
                        .requestMatchers("/api/admin/stats/**").hasRole("ADMIN")

                        // Gestion des médecins et des comptes — réservé aux admins
                        .requestMatchers(HttpMethod.POST, "/medecins/creer-medecin-complet").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/medecins").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/medecins/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/medecins/**").hasRole("ADMIN")
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        // Espace laboratoire : gestion de ses propres délégués
                        .requestMatchers(HttpMethod.POST, "/api/delegues/creer-delegue-complet").hasRole("LABO")
                        .requestMatchers(HttpMethod.PATCH, "/api/delegues/*/desactiver").hasRole("LABO")
                        .requestMatchers(HttpMethod.PATCH, "/api/delegues/*/activer").hasRole("LABO")

                        // Rendez-vous — réservé au délégué, sauf consultation côté médecin/laboratoire et confirmation/annulation côté médecin
                        .requestMatchers(HttpMethod.GET, "/api/rendezvous/conflits").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/rendezvous/*/annuler-medecin").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/rendezvous/*/realise-medecin").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/rendezvous/*/realise-delegue").hasRole("DELEGUE")
                        .requestMatchers(HttpMethod.PATCH, "/api/rendezvous/*/absent-delegue").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/rendezvous/*/absent-medecin").hasRole("DELEGUE")
                        .requestMatchers(HttpMethod.GET, "/api/rendezvous/medecin/**").hasAnyRole("DELEGUE", "MEDECIN")
                        .requestMatchers(HttpMethod.GET, "/api/rendezvous/delegue/**").hasAnyRole("DELEGUE", "LABO")
                        .requestMatchers("/api/rendezvous/**").hasRole("DELEGUE")

                        // Tout le reste : il faut juste être connecté
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
