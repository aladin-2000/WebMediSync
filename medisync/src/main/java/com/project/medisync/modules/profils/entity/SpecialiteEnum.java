package com.project.medisync.modules.profils.entity;

/**
 * Spécialités médicales disponibles pour un profil Médecin.
 * Liste fixe (plutôt qu'une table) : les spécialités médicales sont un
 * référentiel stable qui ne nécessite pas de gestion dynamique par un admin.
 */
public enum SpecialiteEnum {
    MEDECINE_GENERALE("Médecine générale"),
    CARDIOLOGIE("Cardiologie"),
    DERMATOLOGIE("Dermatologie"),
    PEDIATRIE("Pédiatrie"),
    GYNECOLOGIE("Gynécologie"),
    NEUROLOGIE("Neurologie"),
    PSYCHIATRIE("Psychiatrie"),
    OPHTALMOLOGIE("Ophtalmologie"),
    ORL("ORL"),
    ORTHOPEDIE("Orthopédie"),
    RADIOLOGIE("Radiologie"),
    GASTRO_ENTEROLOGIE("Gastro-entérologie"),
    ENDOCRINOLOGIE("Endocrinologie"),
    UROLOGIE("Urologie"),
    RHUMATOLOGIE("Rhumatologie"),
    PNEUMOLOGIE("Pneumologie"),
    NEPHROLOGIE("Néphrologie"),
    ONCOLOGIE("Oncologie"),
    HEMATOLOGIE("Hématologie"),
    ANESTHESIE_REANIMATION("Anesthésie-réanimation"),
    CHIRURGIE_GENERALE("Chirurgie générale"),
    CHIRURGIE_ORTHOPEDIQUE("Chirurgie orthopédique"),
    CHIRURGIE_PLASTIQUE("Chirurgie plastique"),
    DENTAIRE("Dentaire / Stomatologie"),
    MEDECINE_INTERNE("Médecine interne"),
    ALLERGOLOGIE("Allergologie"),
    INFECTIOLOGIE("Infectiologie"),
    GERIATRIE("Gériatrie"),
    MEDECINE_DU_TRAVAIL("Médecine du travail"),
    MEDECINE_SPORTIVE("Médecine du sport");

    private final String libelle;

    SpecialiteEnum(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
