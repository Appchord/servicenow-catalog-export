var csv = require('csv');
var fs = require('fs');

var users = require('./users');

function transform(source, target, adapter, options, callback) {
    console.log('Processing file ' + source + '...');

    var parser = csv.parse(options.in);
    var stringify = csv.stringify(options.out);
    var transformer = csv.transform(adapter);

    var input = fs.createReadStream(source);
    var output = fs.createWriteStream(target);

    input
        .pipe(parser)
        .pipe(transformer)
        .pipe(stringify)
        .pipe(output);

    output.on('finish', function () {
        console.log('File ' + source + ' has been processed successfully.');
        callback(null, 'finish');
    });

    parser.on('error', function(err){
        console.log('Unable to parse file. ', err.message);
    });
}
module.exports = transform;
