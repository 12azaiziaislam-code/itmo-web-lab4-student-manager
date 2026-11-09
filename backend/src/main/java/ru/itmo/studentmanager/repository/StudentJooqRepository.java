package ru.itmo.studentmanager.repository;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.SortField;
import org.springframework.stereotype.Repository;
import ru.itmo.studentmanager.model.Student;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.table;

@Repository
public class StudentJooqRepository implements StudentRepository {

    private static final Map<String, String> SORT_COLUMNS = Map.ofEntries(
            Map.entry("isuId", "isu_id"),
            Map.entry("isu", "isu_id"),
            Map.entry("isu_id", "isu_id"),
            Map.entry("fullName", "full_name"),
            Map.entry("name", "full_name"),
            Map.entry("full_name", "full_name"),
            Map.entry("group", "student_group"),
            Map.entry("studentGroup", "student_group"),
            Map.entry("student_group", "student_group"),
            Map.entry("dormitory", "dormitory_number"),
            Map.entry("dormitoryNumber", "dormitory_number"),
            Map.entry("dormitory_number", "dormitory_number"),
            Map.entry("room", "room"),
            Map.entry("accommodationPeriod", "accommodation_period"),
            Map.entry("accommodation_period", "accommodation_period"),
            Map.entry("isInternational", "is_international"),
            Map.entry("is_international", "is_international"),
            Map.entry("notes", "notes")
    );

    private final DSLContext dsl;

    public StudentJooqRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    private Student mapRecord(Record r) {
        return new Student(
                r.get("isu_id", String.class),
                r.get("full_name", String.class),
                r.get("student_group", String.class),
                r.get("dormitory_number", Integer.class),
                r.get("room", Integer.class),
                r.get("accommodation_period", LocalDate.class),
                r.get("is_international", Boolean.class),
                r.get("notes", String.class)
        );
    }

    @Override
    public List<Student> findAll(Map<String, String> filters) {
        List<Condition> conditions = new ArrayList<>();

        if (filters != null) {
            String name = filters.getOrDefault("fullName", filters.get("name"));
            String group = filters.get("group");
            String dormitory = filters.getOrDefault("dormitory", filters.get("dormitoryNumber"));
            String room = filters.get("room");
            String isuId = filters.getOrDefault("isuId", filters.get("isu"));

            if (name != null && !name.trim().isEmpty()) {
                conditions.add(field("full_name", String.class).containsIgnoreCase(name.trim()));
            }
            if (group != null && !group.trim().isEmpty()) {
                conditions.add(field("student_group", String.class).containsIgnoreCase(group.trim()));
            }
            if (dormitory != null && !dormitory.trim().isEmpty()) {
                try {
                    int dormNum = Integer.parseInt(dormitory.trim());
                    conditions.add(field("dormitory_number", Integer.class).eq(dormNum));
                } catch (NumberFormatException ignored) {}
            }
            if (room != null && !room.trim().isEmpty()) {
                try {
                    int roomNum = Integer.parseInt(room.trim());
                    conditions.add(field("room", Integer.class).eq(roomNum));
                } catch (NumberFormatException ignored) {}
            }
            if (isuId != null && !isuId.trim().isEmpty()) {
                conditions.add(field("isu_id", String.class).containsIgnoreCase(isuId.trim()));
            }
        }

        String requestedSort = (filters != null && filters.get("sortBy") != null) ? filters.get("sortBy") : "isuId";
        String sortColumn = SORT_COLUMNS.getOrDefault(requestedSort, "isu_id");
        String order = filters != null ? filters.getOrDefault("order", "asc") : "asc";
        SortField<?> sortField = "desc".equalsIgnoreCase(order)
                ? field(sortColumn).desc()
                : field(sortColumn).asc();

        int limit = 100;
        int offset = 0;
        if (filters != null) {
            try {
                if (filters.containsKey("limit")) limit = Integer.parseInt(filters.get("limit"));
                if (filters.containsKey("offset")) offset = Integer.parseInt(filters.get("offset"));
            } catch (NumberFormatException ignored) {}
        }
        limit = Math.max(1, Math.min(limit, 100));
        offset = Math.max(0, offset);

        return dsl.select()
                .from(table("students"))
                .where(conditions)
                .orderBy(sortField)
                .limit(limit)
                .offset(offset)
                .fetch(this::mapRecord);
    }

    @Override
    public Optional<Student> findByIsu(String isuId) {
        return dsl.select()
                .from(table("students"))
                .where(field("isu_id").eq(isuId))
                .fetchOptional(this::mapRecord);
    }

    @Override
    public boolean existsByIsu(String isuId) {
        return dsl.fetchExists(
                dsl.selectOne().from(table("students")).where(field("isu_id").eq(isuId))
        );
    }

    @Override
    public Student save(Student student) {
        dsl.insertInto(table("students"))
                .columns(
                        field("isu_id"),
                        field("full_name"),
                        field("student_group"),
                        field("dormitory_number"),
                        field("room"),
                        field("accommodation_period"),
                        field("is_international"),
                        field("notes")
                )
                .values(
                        student.isuId(),
                        student.fullName(),
                        student.studentGroup(),
                        student.dormitoryNumber(),
                        student.room(),
                        student.accommodationPeriod(),
                        student.isInternational() != null ? student.isInternational() : false,
                        student.notes()
                )
                .execute();

        return findByIsu(student.isuId()).orElseThrow();
    }

    @Override
    public Optional<Student> update(Student student) {
        var step = dsl.update(table("students"));
        var setStep = step.set(field("isu_id"), student.isuId());

        if (student.fullName() != null) setStep = setStep.set(field("full_name"), student.fullName());
        if (student.studentGroup() != null) setStep = setStep.set(field("student_group"), student.studentGroup());
        if (student.dormitoryNumber() != null) setStep = setStep.set(field("dormitory_number"), student.dormitoryNumber());
        if (student.room() != null) setStep = setStep.set(field("room"), student.room());
        if (student.accommodationPeriod() != null) setStep = setStep.set(field("accommodation_period"), student.accommodationPeriod());
        if (student.isInternational() != null) setStep = setStep.set(field("is_international"), student.isInternational());
        setStep = setStep.set(field("notes"), student.notes());

        int updated = setStep.where(field("isu_id").eq(student.isuId())).execute();
        if (updated == 0) {
            return Optional.empty();
        }
        return findByIsu(student.isuId());
    }

    @Override
    public boolean delete(String isuId) {
        int deleted = dsl.deleteFrom(table("students"))
                .where(field("isu_id").eq(isuId))
                .execute();
        return deleted > 0;
    }
}
