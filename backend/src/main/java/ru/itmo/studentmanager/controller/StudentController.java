package ru.itmo.studentmanager.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.studentmanager.dto.StudentRequestDto;
import ru.itmo.studentmanager.dto.StudentResponseDto;
import ru.itmo.studentmanager.dto.StudentUpdateDto;
import ru.itmo.studentmanager.service.StudentService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<StudentResponseDto>> getStudents(@RequestParam Map<String, String> params) {
        return listWithTotal(params);
    }

    @PostMapping("/search")
    public ResponseEntity<List<StudentResponseDto>> queryStudents(@RequestBody(required = false) Map<String, Object> filters) {
        Map<String, String> stringFilters = new HashMap<>();
        if (filters != null) {
            filters.forEach((k, v) -> stringFilters.put(k, v != null ? v.toString() : null));
        }
        return listWithTotal(stringFilters);
    }

    private ResponseEntity<List<StudentResponseDto>> listWithTotal(Map<String, String> filters) {
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(service.countStudents(filters)))
                .body(service.getFilteredStudents(filters));
    }

    @GetMapping("/{isuId}")
    public StudentResponseDto getStudent(@PathVariable String isuId) {
        return service.getStudentByIsu(isuId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponseDto createStudent(@Valid @RequestBody StudentRequestDto dto) {
        return service.createStudent(dto);
    }

    @PatchMapping("/{isuId}")
    public StudentResponseDto patchStudent(@PathVariable String isuId, @Valid @RequestBody StudentUpdateDto dto) {
        return service.updateStudent(isuId, dto);
    }

    @PutMapping("/{isuId}")
    public StudentResponseDto putStudent(@PathVariable String isuId, @Valid @RequestBody StudentUpdateDto dto) {
        return service.updateStudent(isuId, dto);
    }

    @DeleteMapping("/{isuId}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String isuId) {
        service.deleteStudent(isuId);
        return ResponseEntity.noContent().build();
    }
}
