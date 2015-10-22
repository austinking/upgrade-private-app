var fs = require('fs');
var path = require('path');
var readline = require('readline');

var github = require('./github');

var promptForAccessToken = 'Please give me a github.com personal access token.\n' +
    'You can create a new token by going to https://github.com/settings/tokens/new and using the default settings.\n' +
    'Access Token: ';
var askToStoreToken = 'May I store this token in a hidden file?\n' +
    'Note: this is a convenience, but an insecure choice.\n' +
    'Store token? Y or N: ';

module.exports = function startPromptForTokenFlow(acceptTokenCb, cb) {    
    if (typeof acceptTokenCb !== 'function') {
        throw new Error('Expected acceptTokenCb to be a function');
    }
    var accessToken = readToken();
    if (accessToken === null) {
        promptForToken(acceptTokenCb, function (token) {
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(askToStoreToken, function (answer) {
                rl.close();
                if (answer.toLowerCase()[0] === 'y') {
                    writeToken(token);
                }
                cb(token);
            });
        });
    } else {
        acceptTokenCb(accessToken, function (isValid) {
            if (isValid) {
                cb(accessToken);
            } else {
                deleteToken();
                startPromptForTokenFlow(acceptTokenCb, cb);
            }
        });
    }
}

function promptForToken(acceptTokenCb, cb) {
    if (acceptTokenCb === undefined) {
        throw new Error('acceptTokenCb must be defined');
    }
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(promptForAccessToken, function (answer) {
        var token = answer.trim();
        if (acceptTokenCb === undefined) {
            throw new Error('wow acceptTokenCb was un defined');
        }
        
        acceptTokenCb(token, function (isValid) {
            rl.close();
            if (isValid) {
                cb(token);
            } else {
                promptForToken(acceptTokenCb, cb);
            }
        });
    });
}

function tokenFilename() {
    // TODO --token-file option
    return path.resolve(process.env.HOME, '.upgrade_private_app_token');
}

function writeToken(token) {
    var tokenFile;
    var fOpts = {
        encoding: 'utf8',
        mode: parseInt('0600', 8),
        flag: 'w'
    };
    if (process.env.HOME === undefined) {
        process.stderr.write('No HOME environment variable, unable to save token\n');
        return;
    }
    fs.writeFile(tokenFilename(), token, fOpts, function (err) {
        if (err) {
            process.stderr.write('Unable to store token, ' + err.toString() + '\n');
        } else {
            process.stderr.write('token stored in ' + tokenFilename() + '\n');
        }
    });
}

function readToken(token) {
    var tokenFile;
    if (process.env.HOME === undefined) {
        return null;
    }
    try {
        return fs.readFileSync(tokenFilename(), {encoding: 'utf8'});
    } catch(e) {
        return null;
    }
}

function deleteToken() {
    try {
        fs.unlinkSync(tokenFilename());
    } catch (e) {
        // Try to cleanup a bad token, failure is okay
    }

}