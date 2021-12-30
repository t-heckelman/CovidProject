CREATE TABLE IF NOT EXISTS reviews (username VARCHAR(20), song VARCHAR(200), review VARCHAR(300) NOT NULL, review_date DATE NOT NULL);
INSERT INTO reviews(username, song, review, review_date) values('TEDDY', 'Sunbleached Girl', 'Catchy', '2021-12-28');
CREATE TABLE IF NOT EXISTS users (name VARCHAR(20), username VARCHAR(200), password VARCHAR(300) NOT NULL);
INSERT INTO reviews(username, song, review, review_date) values('MALCOLM', 'Alamania', 'Gas pack', '2021-12-28');
INSERT INTO users(name, username, password) values('Teddy Heckelman', 'TEDDY', 'Teddy123');
INSERT INTO users(name, username, password) values('Malcolm Holman', 'MALCOLM', 'Malc123');
