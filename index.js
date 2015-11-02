#!/usr/bin/env node
var bunyan = require('bunyan');

var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');

var yargs = require('yargs')
            .usage('Usage: $0 <command> [options]')
            .command('dashlane', 'Transform dashlane CSV file to specified output format')
            .demand(1)
            .example('$0 dashlane -o lastpass -f foo.csv', 'Transform foo.csv from dashlane to lastpass')
            .demand('f')
            .alias('f', 'file')
            .nargs('f', 1)
            .describe('f', 'Load a file')
            .alias('o', 'output-format')
            .describe('o', 'supported output formats')
            .choices('o', ['dashlane', 'lastpass'])
            .demand('l')
            .alias('l', 'log-level')
            .describe('l', 'Enable and set log level')
            .boolean('l')
            .default('l', false)
            .help('h')
            .alias('h', 'help');
var argv = yargs.argv;
 
var localLogLevel = bunyan.INFO;
if (argv.logLevel) {
    localLogLevel = bunyan.DEBUG;
}

if (argv.outputFormat !== "lastpass") {
    console.log("Only lastpass is supported.");
    yargs.showHelp("log");
    process.exit(-1);
}

var log = bunyan.createLogger({
    name: "fix-csv",
    stream: process.stdout,
    level : localLogLevel
});

var output = [];
var parser = parse({delimiter: ','});
var input = fs.createReadStream(argv.file);
var transformer = transform(function(data, callback){
    if (data.length > 5) {
        log.debug('Old record: %s', data);
        /* if the record has more than 5 fields, the 3rd one is the username.
         * This typically happens for records where the username is stored in dashlane
         * but is not the 'login-name'  */
        var username = data.splice(2, 1);   
        var comments = data.pop();
        var item = "";
        if (comments && comments.length > 0) {
            item += "comments: " + comments + ", ";
        }
        item += "username: " + username;

        data.push(item);
        log.debug('New record: %s. len=%s.', data, data.length);
        log.debug('Item: %s', item);
    }
    callback(null, '"' + data.join('","')+'"\n');

}, {parallel: 10});

input.pipe(parser).pipe(transformer).pipe(process.stdout);


