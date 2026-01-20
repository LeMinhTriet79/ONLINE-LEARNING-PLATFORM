package com.minhtriet.service;

import com.minhtriet.entity.Book;
import com.minhtriet.repository.BookRepository;
import java.util.List;

public class BookService {
    private final BookRepository bookRepository;

    public BookService() {
        this.bookRepository = new BookRepository();
    }

    public void addBook(Book book) {
        bookRepository.save(book);
    }

    public void updateBook(Book book) {
        bookRepository.update(book);
    }

    public void deleteBook(String code) {
        bookRepository.delete(code);
    }

    public Book getBookByCode(String code) {
        return bookRepository.findById(code);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
}