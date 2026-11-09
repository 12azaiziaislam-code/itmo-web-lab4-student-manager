package ru.itmo.studentmanager.repository;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.SortField;
import org.springframework.stereotype.Repository;
import ru.itmo.studentmanager.model.Student;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.jooq.impl.DSL.and;
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

    private static String param(Map<String, String> filters, String... keys) {
        for (String key : keys) {
            String value = filters.get(key);
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private static Integer parseInt(String value) {
        if (value == null) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static LocalDate parseDate(String value) {
        if (value == null) return null;
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private List<Condition> buildConditions(Map<String, String> filters) {
        List<Condition> conditions = new ArrayList<>();
        if (filters == null) {
            return conditions;
        }

        String search = param(filters, "search", "q");
        if (search != null) {
            conditions.add(field("full_name", String.class).containsIgnoreCase(search)
                    .or(field("isu_id", String.class).containsIgnoreCase(search))
                    .or(field("student_group", String.class).containsIgnoreCase(search))
                    .or(field("notes", String.class).containsIgnoreCase(search)));
        }

        String name = param(filters, "fullName", "name");
        if (name != null) {
            conditions.add(field("full_name", String.class).containsIgnoreCase(name));
        }

        String group = param(filters, "group");
        if (group != null) {
            conditions.add(field("student_group", String.class).containsIgnoreCase(group));
        }

        String isuId = param(filters, "isuId", "isu");
        if (isuId != null) {
            conditions.add(field("isu_id", String.class).containsIgnoreCase(isuId));
        }

        Integer dormitory = parseInt(param(filters, "dormitoryNumber", "dormitory"));
        if (dormitory != null) {
            conditions.add(field("dormitory_number", Integer.class).eq(dormitory));
        }

        Integer room = parseInt(param(filters, "room"));
        if (room != null) {
            conditions.add(field("room", Integer.class).eq(room));
        }

        LocalDate date = parseDate(param(filters, "accommodationPeriod"));
        if (date != null) {
            conditions.add(field("accommodation_period", LocalDate.class).eq(date));
        }
        LocalDate from = parseDate(param(filters, "accommodationFrom"));
        if (from != null) {
            conditions.add(field("accommodation_period", LocalDate.class).ge(from));
        }
        LocalDate to = parseDate(param(filters, "accommodationTo"));
        if (to != null) {
            conditions.add(field("accommodation_period", LocalDate.class).le(to));
        }

        String international = param(filters, "isInternational");
        if ("true".equalsIgnoreCase(international) || "false".equalsIgnoreCase(international)) {
            conditions.add(field("is_international", Boolean.class).eq(Boolean.parseBoolean(international)));
        }

        String notes = param(filters, "notes");
        if (notes != null) {
            conditions.add(field("notes", String.class).containsIgnoreCase(notes));
        }

        return conditions;
    }

    @Override
    public List<Student> findAll(Map<String, String> filters) {
        List<Condition> conditions = buildConditions(filters);

        String requestedSort = (filters != null && filters.get("sortBy") != null) ? filters.get("sortBy") : "isuId";
        String sortColumn = SORT_COLUMNS.getOrDefault(requestedSort, "isu_id");
        String order = filters != null ? filters.getOrDefault("order", "asc") : "asc";
        SortField<?> sortField = "desc".equalsIgnoreCase(order)
                ? field(sortColumn).desc()
                : field(sortColumn).asc();

        int limit = 100;
        int offset = 0;
        if (filters != null) {
            Integer l = parseInt(filters.get("limit"));
            Integer o = parseInt(filters.get("offset"));
            if (l != null) limit = l;
            if (o != null) offset = o;
        }
        limit = Math.max(1, Math.min(limit, 100));
        offset = Math.max(0, offset);

        return dsl.select()
                .from(table("students"))
                .where(conditions)
                .orderBy(sortField, field("isu_id").asc())
                .limit(limit)
                .offset(offset)
                .fetch(this::mapRecord);
    }

    @Override
    public long count(Map<String, String> filters) {
        return dsl.fetchCount(table("students"), and(buildConditions(filters)));
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
