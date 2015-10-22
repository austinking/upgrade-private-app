var fs = require('fs');

var request = require('request');

var releasesCache = null;

function getReleases (token, username, project, successCb, failureCb) {
    if (failureCb === undefined) {
        throw new Error('failureCb is required');
    }
    if (! releasesCache) {
        _getReleases(token, username, project, function (results) {
            if (!! results) {
                releasesCache = results;
            }
            successCb(results);
        }, failureCb);
    } else {
        successCb(releasesCache);
    }
}

exports.getReleases = getReleases;

function _getReleases(token, username, project, successCb, failureCb) {
    var releases;
    var ropts = {
        url: ['https://api.github.com/repos', username, project, 'releases'].join('/'),
        headers: {
            'User-Agent': userAgent(username, project),
            'Accept': '*/*'
        },
        followRedirect: true, // default... just documenting
        encoding: 'utf8'
    };
    ropts.headers.Authorization = 'token ' + token;

    request(ropts, function(err, res, body) {
        if (!err && 200 <= res.statusCode && res.statusCode < 300) {
            try {
                releases = JSON.parse(body);
                successCb(releases);
            } catch(e) {
                process.stderr.write('unable to parse releases on github\n');
                process.stderr.write(e.toString() + '\n');
                failureCb(e);
            }
        } else {
            failureCb(err, res.statusCode);
        }
    });
}

exports.downloadLatest = function (token, username, project, filename, cb) {  
    var ua = userAgent(username, project);  
    getReleases(token, username, project, pickLatest(token, filename, ua, cb), function(err, statusCode) {
        process.stderr.write('Unable to get current list of releases ' +
            err.toString() + ' HTTP status code=' + statusCode);
    });
};


function pickLatest(token, filename, ua, cb) {
    return function (releases) {
        for (var i=0; i < releases[0].assets.length; i++) {
            var asset = releases[0].assets[i];            
            if (asset.name === filename) {
                process.stdout.write('Downloading: ' + releases[0].tarball_url + '\n');
                download(asset.url, token, filename, ua, cb);
            }
        }
    };
}

function download(url, token, filename, ua, cb) {
    var ropts = {
        url: url,
        headers: {
            'User-Agent': ua,
            'Accept': 'application/octet-stream',
            'Authorization': 'token ' + token
        },
        followRedirect: true // default... just documenting
    };
    
    var tmpFile = fs.createWriteStream(filename);
    tmpFile.on('error', function(err) {
        process.stderr.write('Error downloading ' + url + '\n');
        process.stderr.write(err.toString() + '\n');
    });
    tmpFile.on('close', function() {        
        cb(null, filename);
    });
    request(ropts).pipe(tmpFile);
}

function userAgent(username, project) {
    return username + '-' + project;
}