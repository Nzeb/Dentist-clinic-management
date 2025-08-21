CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Reception')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, role) VALUES ('admin', '$2b$10$w.bMTD7i2/7dllUgFGlTxOQ6lwKr.lNg1JfL3/qTmJfFBp.UTMF46', 'Admin');
