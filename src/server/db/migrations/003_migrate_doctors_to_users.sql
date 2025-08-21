INSERT INTO users (username, password, role, "fullName", email)
SELECT
    lower(replace(name, ' ', '')),
    '$2b$10$rqi/rgxouqjLCujN0XFZsemUJCXg0AkuOQgNJzodwpiZSlJfS/qWC',
    'Doctor',
    name,
    lower(replace(name, ' ', '')) || '@example.com'
FROM doctors;
