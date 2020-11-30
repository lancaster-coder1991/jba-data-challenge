--Each time the seeding script is run, drop the DB if it exists in order to prevent data duplication
DROP DATABASE IF EXISTS precipitation_data;

--Create DB
CREATE DATABASE precipitation_data;

--Connect to DB
\c precipitation_data;

--Create Table for storing meta data (a column for each row) - include serial key for the entry
CREATE TABLE meta_data(
    meta_id SERIAL PRIMARY KEY,
    header VARCHAR,
    units VARCHAR,
    vers VARCHAR,
    coords VARCHAR,
    refs VARCHAR
);

--Create table for storing main data - include serial key for each entry, plus refrence key linking to meta data table
CREATE TABLE precipitation(
    entry_id SERIAL PRIMARY KEY,
    Xref INT,
    Yref INT,
    calendarmonth date,
    val INT,
    meta_id INT REFERENCES meta_data(meta_id)
);