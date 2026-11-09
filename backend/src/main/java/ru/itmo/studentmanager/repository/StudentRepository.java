package ru.itmo.studentmanager.repository;

import ru.itmo.studentmanager.model.Student;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface StudentRepository {
    List<Student> findAll(Map<String, String> filters);
    long count(Map<String, String> filters);
    Optional<Student> findByIsu(String isuId);
    boolean existsByIsu(String isuId);
    Student save(Student student);
    Optional<Student> update(Student student);
    boolean delete(String isuId);
}
