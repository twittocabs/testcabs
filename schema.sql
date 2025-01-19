CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT NOT NULL,
    salt TEXT
);

CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    pickUp TEXT NOT NULL,
    dropOff TEXT NOT NULL,
    userName TEXT NOT NULL,
    gender TEXT NOT NULL,
    seats INTEGER NOT NULL,
    carType TEXT NOT NULL,
    persons INTEGER NOT NULL,
    contact TEXT NOT NULL,
    bags TEXT,
    price TEXT,
    bagsAllowed TEXT,
    petsAllowed TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS shown_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER NOT NULL,
    show_contact TEXT NOT NULL,
    FOREIGN KEY (ride_id) REFERENCES rides(id)
);