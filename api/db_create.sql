
CREATE USER 'crixalis'@'%' IDENTIFIED BY 'sandking';
GRANT ALL PRIVILEGES ON election_db.* TO 'crixalis'@'%';
FLUSH PRIVILEGES;
CREATE DATABASE election_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;