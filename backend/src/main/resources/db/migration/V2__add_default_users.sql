-- Migration V2: Add default users (admin: admin123, student_user: user123)
INSERT INTO users (username, email, password, role)
VALUES 
    ('admin', 'admin@itmo.ru', '$2a$10$nXCKoSGyWjNi1z2aW.ybR.eD3n4wEGKe/zDzuwb.CyGV9dnj2CtfK', 'ADMIN'),
    ('student_user', 'user@itmo.ru', '$2a$10$nqZL2dIWXHkms5H0UHB0v.QFusYXm4a.frjPXbiBRQPZWwP4CP0gy', 'USER')
ON CONFLICT (username) DO NOTHING;
