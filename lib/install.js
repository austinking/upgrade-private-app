var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var SUCCESS = 0; // posix exit code

module.exports = function startInstall(archive, appDirPath) {
    var tar = spawn('tar', ['zxf', archive]);
    tar.stdout.on('data', stdout);
    tar.stderr.on('data', stderr);
    tar.on('close', function (code) {
        if (code !== 0) {
            process.stdout.write('Unable to decompress ' + archive + '\n');
            process.exit(code);
        }
        install(appDirPath);
    });
};

function install(appDirPath) {
    var destination;
    var appFilename = path.basename(appDirPath);
    var which = spawn('which', [appFilename]);
    which.on('error', function(err) {
        process.stdout.write('Ouch ' + err.toString() + '\n');
    });
    which.stdout.on('data', function(data) {
        destination =  data.toString('utf8').trim();
        process.stdout.write('Installing into ' + destination + '\n');
    });
    which.stderr.on('data', stderr);
    which.on('close', moveApp.bind(undefined, appDirPath, destination));
}

function moveApp (appDirPath, destination, code) {
    if (code !== 0) {
        process.stderr.write('Unable to determine ' + appFilename + ' current location\n');
        process.exit(code);
    }
    // TODO: assumes the app binary supports being executed with version as an argument    
    spawn(appDirPath, ['version'])
        .stdout.on('data', function (data) {
            process.stdout.write('Version: ' + data.toString('utf8') + '\n');
        });

    var mv = spawn('mv', ['-v', appDirPath, destination]);

    mv.stderr.on('data', stderr);

    mv.on('close', finish);
}

function finish (code) {
    if (code === 0) {
        // TODO remove the tmpFile
        process.stdout.write('Installed\n');
    } else {        
        process.stderr.write('Install failed\n');
        process.exit(code);
    }
}

function stdout (data) {
    process.stdout.write(data.toString('utf8') + '\n');
}

function stderr (data) {
    process.stderr.write(data.toString('utf8') + '\n');
}
