-- Database schema for Expense Sharing Application

CREATE TABLE user_table (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE user_group (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by_id BIGINT REFERENCES user_table(id)
);

CREATE TABLE group_members (
    group_id BIGINT REFERENCES user_group(id),
    user_id BIGINT REFERENCES user_table(id),
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE expense (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_by_id BIGINT REFERENCES user_table(id),
    group_id BIGINT REFERENCES user_group(id),
    split_type VARCHAR(20) NOT NULL
);

CREATE TABLE split (
    id BIGSERIAL PRIMARY KEY,
    expense_id BIGINT REFERENCES expense(id),
    user_id BIGINT REFERENCES user_table(id),
    amount DECIMAL(10,2),
    percentage DECIMAL(5,2)
);

CREATE TABLE balance (
    id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT REFERENCES user_table(id),
    to_user_id BIGINT REFERENCES user_table(id),
    amount DECIMAL(10,2) NOT NULL,
    group_id BIGINT REFERENCES user_group(id)
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT REFERENCES user_table(id),
    to_user_id BIGINT REFERENCES user_table(id),
    amount DECIMAL(10,2) NOT NULL,
    date TIMESTAMP NOT NULL,
    group_id BIGINT REFERENCES user_group(id)
);
