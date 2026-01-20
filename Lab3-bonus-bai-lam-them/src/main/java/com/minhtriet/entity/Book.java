package com.minhtriet.entity;


import jakarta.persistence.*;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "Book")
public class Book {

    @Id
    @Column(name = "code", length = 10, nullable = false)
    private String code;

    @Nationalized
    @Column(name = "title", length = 30)
    private String title;

    @Column(name = "price")
    private Integer price;

    @Nationalized
    @Column(name = "authors", length = 30)
    private String authors;

    @Column(name = "edition")
    private Integer edition;

    // Constructor mặc định (Bắt buộc cho JPA)
    public Book() {
    }

    // Constructor đầy đủ tham số
    public Book(String code, String title, Integer price, String authors, Integer edition) {
        this.code = code;
        this.title = title;
        this.price = price;
        this.authors = authors;
        this.edition = edition;
    }

    // --- Getter & Setter (Nếu không dùng Lombok) ---
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public Integer getEdition() { return edition; }
    public void setEdition(Integer edition) { this.edition = edition; }

    @Override
    public String toString() {
        return "Book{" +
                "code='" + code + '\'' +
                ", title='" + title + '\'' +
                ", price=" + price +
                ", authors='" + authors + '\'' +
                ", edition=" + edition +
                '}';
    }
}