CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INT NULL,
    ingredients TEXT NULL,
    content VARCHAR(50) NULL
);