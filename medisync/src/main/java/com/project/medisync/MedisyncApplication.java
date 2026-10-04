package com.project.medisync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MedisyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedisyncApplication.class, args);
    }

}
