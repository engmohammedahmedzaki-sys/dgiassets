-- Create Admin User
-- Email: mohammedahmed.zaki.94@gmail.com
-- Password: Elking_009
-- Password hash generated using bcrypt with salt rounds 10
INSERT INTO "user" (
        id,
        email,
        password,
        "fullName",
        "phoneNumber",
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'mohammedahmed.zaki.94@gmail.com',
        '$2b$10$rOXcUHPqJGP3qr8K8RZcOeQMkGE6ggRj0Y.N8B5xE5ZkYd7mZ4KpO',
        -- Elking_009 hashed
        'Mohammed Ahmed Zaki',
        '+201234567890',
        'seller',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT (email) DO
UPDATE
SET password = EXCLUDED.password,
    "fullName" = EXCLUDED."fullName",
    "phoneNumber" = EXCLUDED."phoneNumber";