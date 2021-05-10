CREATE DATABASE granate;

USE granate;

CREATE TABLE answer(
    uuid VARCHAR(36) NOT NULL PRIMARY KEY, 
    user_id VARCHAR(36) NOT NULL, 
    question_id VARCHAR(36) NOT NULL, 
    value TEXT
);

create table task(
    uuid VARCHAR(36) NOT NULL PRIMARY KEY, 
    user_id VARCHAR(36) NOT NULL, 
    display_text VARCHAR(300), 
    priority VARCHAR(150), 
    status VARCHAR(150), 
    sub_tasks JSON, 
    due_date VARCHAR(150), 
    note VARCHAR(600), 
    category VARCHAR(150), 
    level INTEGER NOT NULL, 
    task_template_id VARCHAR(36), 
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

create table entity_answer(
    uuid VARCHAR(36) NOT NULL PRIMARY KEY,  
    user_id VARCHAR(36) NOT NULL, 
    template_id VARCHAR(36), 
    name VARCHAR(150), 
    answers JSON, 
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);
