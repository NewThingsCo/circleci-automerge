circleci-automerge
====

[![Greenkeeper badge](https://badges.greenkeeper.io/NewThingsCo/circleci-automerge.svg)](https://greenkeeper.io/)
[![CircleCI](https://circleci.com/gh/NewThingsCo/circleci-automerge.svg?style=svg)](https://circleci.com/gh/NewThingsCo/circleci-automerge)

Tool to auto merge GitHub pull request branches on Circle CI

# Usage

    Usage: circleci-automerge [options]

    Options:

      -v, --version                  output the version number
      -r, --repository <repository>  github repository in format "<owner>/<repo>"
      -f, --filter <regexp>          regular expression to filter branches
      -h, --help                     output usage information

## Examples

    circleci-automerge --repository="NewThingsCo/circleci-automerge" --filter="^greenkeeper/"

# Development

## Tests
    npm test

## Lint
    npm run lint
