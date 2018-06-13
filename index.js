// step 1 would be to establish the nodejs project
// step 2 initialise nodemon or similar so it runs as a service
// step 3 at start up/restart, loki and node js components gets reinitlised and reloading components until its ready
// step 4 once lokijs is ready and db files been loaded and ready to work, nodejs checks if there are any available json files in a particular folder
// step 5 if there are no json files, it waits for 2 seconds and then checks again , and again , and again , eternity loop
// step 6 when a files lands there, they will be in an array and the content will be parsed and its messages will be sent to the x lokijs instances to process
// step 7 lokijs will follow 2 or 3 lookup checks to the in memory databases and return a response message back to nodejs
// step 8 once all messages for the particular file had been collected (this process should be super fast as its mostly done in memory); nodejs will save output as a json file
// step 9 - no other files will be picked up until the previous file has completed. the loading of files must be sequential , oldest to newest
// step 10 if any errors during processing (i.e. parse json file, read messages etc), this needs to be output to a log file yyyymmdd with error details
// step 11 - continue and repeat step 5 onwards

const loki = require('lokijs');
const cluster = require('cluster');
const fs = require('fs');

const folder = './data';
const cpuCores = require('os').cpus().length;

const db = new loki('example.db');
const users = db.addCollection('users');

const func = () => {
  const files = fs.readdirSync(folder)
    .map(f => ({ name: f, time: fs.statSync(`${folder}/${f}`).mtime.getTime() }))
    .sort((a, b) => a.time - b.time)
    .map(f => f.name);
  if (files.length <= 0) {
    return;
  }
  console.log(files);
};

if (cluster.isMaster) {
  console.log(`Master ${process.pid}`);
  for (let i = 0; i < cpuCores; i += 1) {
    cluster.fork();
  }
  setInterval(func, 2000);
} else {
  console.log(`Worker ${process.pid}`);
  setInterval(func, 2000);
}
