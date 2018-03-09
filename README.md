circleci-automerge
====
[![CircleCI](https://circleci.com/gh/NewThingsCo/circleci-automerge.svg?style=svg)](https://circleci.com/gh/NewThingsCo/circleci-automerge)

Tool to auto merge GitHub pull request branches on Circle CI

# Usage

## Install

    npm install -g circleci-automerge

## Prerequisite

1. Create [personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) in GitHub
2. Add access token to `GH_TOKEN` environment variable in Circle CI

## Options

    Usage: circleci-automerge [options]

    Options:

      -v, --version                  output the version number
      -f, --filter <regexp>          regular expression to filter branches
      -h, --help                     output usage information

## Examples

Auto merge only branches that start with 'greenkeeper/'

    circleci-automerge --filter="^greenkeeper/"

# Development

## Tests
    npm test

## Lint
    npm run lint
