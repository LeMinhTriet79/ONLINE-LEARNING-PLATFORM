package com.minhtriet.repository;

import com.minhtriet.entity.Book;
import com.minhtriet.util.JpaUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.util.List;

public class BookRepository {

    public void save(Book book) {
        EntityManager em = JpaUtils.getEntityManager();
        EntityTransaction trans = em.getTransaction();
        try {
            trans.begin();
            em.persist(book);
            trans.commit();
        } catch (Exception e) {
            trans.rollback();
            e.printStackTrace();
        } finally {
            em.close();
        }
    }

    public void update(Book book) {
        EntityManager em = JpaUtils.getEntityManager();
        EntityTransaction trans = em.getTransaction();
        try {
            trans.begin();
            em.merge(book);
            trans.commit();
        } catch (Exception e) {
            trans.rollback();
            e.printStackTrace();
        } finally {
            em.close();
        }
    }

    public void delete(String code) {
        EntityManager em = JpaUtils.getEntityManager();
        EntityTransaction trans = em.getTransaction();
        try {
            trans.begin();
            Book book = em.find(Book.class, code);
            if (book != null) {
                em.remove(book);
            }
            trans.commit();
        } catch (Exception e) {
            trans.rollback();
            e.printStackTrace();
        } finally {
            em.close();
        }
    }

    public Book findById(String code) {
        EntityManager em = JpaUtils.getEntityManager();
        try {
            return em.find(Book.class, code);
        } finally {
            em.close();
        }
    }

    public List<Book> findAll() {
        EntityManager em = JpaUtils.getEntityManager();
        try {
            // Sử dụng JPQL để lấy danh sách
            return em.createQuery("SELECT b FROM Book b", Book.class).getResultList();
        } finally {
            em.close();
        }
    }
}