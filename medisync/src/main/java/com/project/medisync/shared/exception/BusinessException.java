package com.project.medisync.shared.exception;

/**
 * Exception levée lorsqu'une règle métier est violée.
 * Le message doit toujours être rédigé en français et être explicite.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
