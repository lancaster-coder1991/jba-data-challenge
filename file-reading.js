const fs = require("fs"); //require node fs for file reading
const { Client } = require("pg"); //require pg (postgres) for connection and writing to sql db
const format = require("pg-format"); //require pg format to easily insert multiple rows in one statement (see below)

//Create a new instance of the client object with details of local db - details would need to be changed depending on the server
const client = new Client({
  user: "george",
  host: "localhost",
  database: "precipitation_data",
  password: "georgescott123",
  port: 5432,
});

//connect to the db
client.connect();

//Read the data file contents using node-fs and the filename argument supplied to node when running the script
fs.readFile(process.argv[2], "utf8", (err, contents) => {
  if (err) {
    //if there is an error, log it and close the db connection
    console.log(err);
    client.end();
  } else {
    const dataArr = contents.split(/(Grid-ref(.*\n){11})/g); //split contents of file into an array of grid-ref strings

    const metaData = dataArr[0]; //Separate the metadata at the top of the original file
    const metaRows = metaData.split(/\n/g).filter((val) => val); //Split this data into rows based on line breaks for insertion into different columns and filter out blank values that can be created by matching on line breaks

    const data = dataArr.slice(1).filter((gridref) => gridref.length > 100); //assign the main data to a variable, filtering out undesired artifacts from the file

    //split each gridref block into an array element per row of text
    const segmentedData = [];
    data.forEach((gridref) => segmentedData.push(gridref.split(/\n/)));

    //Map over the segmented data to produce an array for each value in the data (120 arrays per grid block) in the form [xref, yref, date, value], each representing a row of the required table
    const dataToWrite = segmentedData
      .map((gridArr) => {
        const refs = gridArr[0].match(/\d+/g); //use regex to find the grid refs for each block
        const xRef = refs[0]; //assign x and y refs
        const yRef = refs[1];
        const returnArrs = []; //create array for each
        for (let i = 1; i < gridArr.length; i++) {
          //iterate over each value of the grid using a for loop followed by a forEach (see below)
          const thisYearsValues = gridArr[i].split(/\s+/g).filter((str) => str); //split each array into the individual precipitation values, filtering out any blanks
          thisYearsValues.forEach((value, index) => {
            const tableRow = [xRef, yRef];
            const month = index + 1; //assign the value's month based on index of the origin array
            const year = i + 1991; //assign year based on iterator of the above for loop
            tableRow.push(`${month}/1/${year}`, value, 1); //push date, value in mm and a reference to meta_data table to the table row array
            returnArrs.push(tableRow); //push the table row into the master array of rows
          });
        }
        return returnArrs;
      })
      .flat();

    //Insert meta data and main data into the db using pg queries and await/async, making sure to end connection after each happy/sad path
    const executeQueries = async () => {
      await client.query(
        "INSERT INTO meta_data(header, units, vers, coords, refs) VALUES ($1, $2, $3, $4, $5)",
        metaRows
      );
      await client.query(
        format(
          "INSERT INTO precipitation(xref, yref, calendarmonth, val, meta_id) VALUES %L",
          dataToWrite
        )
      );
      client.end();
    };

    executeQueries().catch((err) => {
      console.log(err);
      client.end();
    });
  }
});
