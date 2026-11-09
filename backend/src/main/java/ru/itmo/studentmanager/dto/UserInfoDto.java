package ru.itmo.studentmanager.dto;

public record UserInfoDto(
        Long id,
        String username,
        String email,
        String role
) {}
