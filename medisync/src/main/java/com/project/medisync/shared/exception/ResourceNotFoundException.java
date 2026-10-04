package com.project.medisync.shared.exception;


/**
 * Exception levée lorsqu'une ressource est introuvable en base de données.
 * Mappée sur HTTP 404 par le GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, String id) {
        super(String.format("%s introuvable avec l'identifiant : %s", resourceName, id));
    }

    public ResourceNotFoundException(String resourceName, String field, Object value) {
        super(String.format("%s introuvable avec %s = %s", resourceName, field, value));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
