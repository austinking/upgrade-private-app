# upgrade-private-app

This CLI node app is handy for updating a binary app distributed via a private github repo.

## Installation

    npm install -g upgrade-private-app

It is best installed via a wrapper, such as:

    alias upgrade-sekrit-app="upgrade-private-app exampleco sekrit-app sekrit-build.tgz _output/darwin/amd64/sekrit-app"

This could be placed in your `~/.bash_profile`, for example.

## Limitations

The app you are upgrading must have the same name and already be installed.

This quick hack currently supports only Mac OS X. It depends on

* `which` to locate you're current app
* tar and your archive should be a decompressed via `tar zxf file.tgz`

## Bugs

You betcha. Pull requests welcome.