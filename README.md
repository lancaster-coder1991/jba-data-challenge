# JBA DB Challenge

This project repository was created by George Scott in November 2020 in order to complete the challenge listed on JBA Consulting's careers page, listed [here](https://jbasoftware.com/careers/code-challenge/).

The challenge has been solved using Node.js for the runtime environment and utility packages, JavaScript for file reading and data manipulation, and PostgreSQL for DB creation and data storage.

## Setup

In order to test this solution, you will need to ensure that Node.js is installed. Please follow the instructions found [here](https://nodejs.org/en/download/) in order to do so.

PostgreSQL will also need to be installed, following the instructions found [here](https://www.postgresql.org/download/).

Once this is done, create a Postgres user with a password. Instructions for doing so can be found on the [PostgreSQL website](https://www.postgresql.org/docs/).

Now, clone the GitHub repository for this project to a local directory. Using a terminal, navigate to the new directory and run the following command to install the required dependencies:

```
npm i
```

If for whatever reason the command fails to run or hasn't installed all of the required dependencies, they can be installed individually using this command:

```
npm i fs pg pgtools pg-format nodefs tools
```

You should now be ready to run the solution.

## Running the solution

You have a couple of options to run the code. In order to run the setup of the db, the file reading of the file provided on the JBA website, and the insertion of data into the db in one command, a 'seeding' script has been set up that can be run like so:

```
npm run seeding
```

However, this will only work if the username and password in the script are changed manually on line 8 of the package.json file to match your postgres user (test user 'george' and test password 'georgescott123' currently represent where these would need to be placed - do not change the structure of this script!). Feel free to do this now. After you have done so, this command should be runnable as many times as you like (the database is dropped and created again each time to avoid data duplication).

If you would prefer to specify the filepath and user details each time, this is also possible. You will need to drop and create the db using the following command:

```
npm run createdb
```

And then use the following command, replacing the indicated fields as appropriate:

```
node file-reading.js *insert file path here* *insert postgres username here* *insert postgres password here*
```

Note that you will need to use [node file path notation](https://nodejs.dev/learn/nodejs-file-paths) for the filepath.

After using either of the methods above, the db will be populated with the data - messages will appear in the terminal confirming this.
