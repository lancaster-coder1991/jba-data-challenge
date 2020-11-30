const fs = require("fs");
const { Client } = require("pg");
const format = require("pg-format");

const client = new Client({
  user: "george",
  host: "localhost",
  database: "precipitation_data",
  password: "georgescott123",
  port: 5432,
});

client.connect();

//Read the original file contents using nodefs
fs.readFile(
  "./data/cru-ts-2-10.1991-2000-cutdown.pre",
  "utf8",
  (err, contents) => {
    console.log(process.argv);
    const dataArr = contents.split(/(Grid-ref(.*\n){11})/g); //split contents into an array of grid-ref strings

    const metaData = dataArr[0]; //Separate the metadata at the top of the original file
    const metaRows = metaData.split(/\n/g).filter((val) => val); //Split this data into rows based on line breaks for insertion into different columns and filter out blank values that can be created by matching on line breaks

    const data = dataArr.slice(1).filter((gridref) => gridref.length > 100);
    //filter out blank values which can be created by regex matching on line breaks

    //split each gridref block into an array element per row of text
    const segmentedData = [];
    data.forEach((gridref) => segmentedData.push(gridref.split(/\n/)));

    //Map over the segmented data to produce an array for each value in the data (120 arrays per grid block) in the form [xref, yref, date, value], each representing a row of the required table
    const dataToWrite = segmentedData
      .map((gridArr) => {
        const refs = gridArr[0].match(/\d+/g);
        const xRef = refs[0];
        const yRef = refs[1];
        const returnArrs = [];
        for (let i = 1; i < gridArr.length; i++) {
          const thisYearsValues = gridArr[i].split(/\s+/g).filter((str) => str);
          thisYearsValues.forEach((value, index) => {
            const tableRow = [xRef, yRef];
            const month = index + 1;
            const year = i + 1991;
            tableRow.push(`${month}/1/${year}`, value, 1);
            returnArrs.push(tableRow);
          });
        }
        return returnArrs;
      })
      .flat();

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
);
