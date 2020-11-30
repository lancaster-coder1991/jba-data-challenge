DROP DATABASE IF EXISTS precipitation_data;

CREATE DATABASE precipitation_data;

\c precipitation_data;

CREATE TABLE meta_data(
    meta_id SERIAL PRIMARY KEY,
    header VARCHAR,
    units VARCHAR,
    vers VARCHAR,
    coords VARCHAR,
    refs VARCHAR
);

CREATE TABLE precipitation(
    entry_id SERIAL PRIMARY KEY,
    Xref INT,
    Yref INT,
    calendarmonth date,
    val INT,
    meta_id INT REFERENCES meta_data(meta_id)
);