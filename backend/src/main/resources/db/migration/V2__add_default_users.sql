-- Migration V2: Add default users (admin and student_user)
INSERT INTO users (username, email, password, role)
VALUES 
    ('admin', 'admin@itmo.ru', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ADMIN'),
    ('student_user', 'user@itmo.ru', '$2a$10$04m5bM01u8N2b8Msmq6EruX1G6uB6vj7GvF4I6g9b4K6m9o1L2.2G', 'USER')
ON CONFLICT (username) DO NOTHING;
