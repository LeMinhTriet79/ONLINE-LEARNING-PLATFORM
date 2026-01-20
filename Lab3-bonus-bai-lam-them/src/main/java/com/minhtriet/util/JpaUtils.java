package com.minhtriet.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class JpaUtils {
    private static EntityManagerFactory emf;

    public static EntityManager getEntityManager() {
        if (emf == null || !emf.isOpen()) {
            // "Lab2PU" phải khớp với name trong persistence.xml
            emf = Persistence.createEntityManagerFactory("Lab2PU");
        }
        return emf.createEntityManager();
    }

    public static void close() {
        if (emf != null && emf.isOpen()) {
            emf.close();
        }
    }
}