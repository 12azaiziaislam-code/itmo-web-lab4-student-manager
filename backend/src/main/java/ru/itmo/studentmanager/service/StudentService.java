package ru.itmo.studentmanager.service;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import ru.itmo.studentmanager.dto.StudentRequestDto;
import ru.itmo.studentmanager.dto.StudentResponseDto;
import ru.itmo.studentmanager.dto.StudentUpdateDto;
import ru.itmo.studentmanager.exception.DuplicateResourceException;
import ru.itmo.studentmanager.exception.ResourceNotFoundException;
import ru.itmo.studentmanager.model.Student;
import ru.itmo.studentmanager.repository.StudentRepository;

import java.util.List;
import java.util.Map;

@Service
public class StudentService {

    private final StudentRepository repo;

    public StudentService(StudentRepository repo) {
        this.repo = repo;
    }

    public List<StudentResponseDto> getFilteredStudents(Map<String, String> filters) {
        return repo.findAll(filters).stream()
                .map(this::toResponseDto)
                .toList();
    }

    public long countStudents(Map<String, String> filters) {
        return repo.count(filters);
    }

    public StudentResponseDto getStudentByIsu(String isuId) {
        return repo.findByIsu(isuId)
                .map(this::toResponseDto)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    public StudentResponseDto createStudent(StudentRequestDto dto) {
        if (repo.existsByIsu(dto.isuId())) {
            throw new DuplicateResourceException("Student with this ISU ID already exists");
        }
        Student student = new Student(
                dto.isuId(),
                dto.fullName(),
                dto.group(),
                dto.dormitoryNumber(),
                dto.room(),
                dto.accommodationPeriod(),
                dto.isInternational(),
                dto.notes()
        );
        try {
            Student saved = repo.save(student);
            return toResponseDto(saved);
        } catch (DuplicateKeyException e) {
            throw new DuplicateResourceException("Student with this ISU ID already exists");
        }
    }

    public StudentResponseDto updateStudent(String isuId, StudentUpdateDto dto) {
        Student student = new Student(
                isuId,
                dto.fullName(),
                dto.group(),
                dto.dormitoryNumber(),
                dto.room(),
                dto.accommodationPeriod(),
                dto.isInternational(),
                dto.notes()
        );
        return repo.update(student)
                .map(this::toResponseDto)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    public void deleteStudent(String isuId) {
        if (!repo.delete(isuId)) {
            throw new ResourceNotFoundException("Student not found");
        }
    }

    private StudentResponseDto toResponseDto(Student student) {
        return new StudentResponseDto(
                student.isuId(),
                student.fullName(),
                student.studentGroup(),
                student.dormitoryNumber(),
                student.room(),
                student.accommodationPeriod(),
                student.isInternational(),
                student.notes()
        );
    }
}
