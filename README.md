# urlio

[![npm version](https://badge.fury.io/js/urlio.svg)](https://www.npmjs.com/package/urlio)
[![Travis CI Build Status](https://travis-ci.org/chbrown/urlio.svg)](https://travis-ci.org/chbrown/urlio)
[![Coverage Status](https://coveralls.io/repos/chbrown/urlio/badge.svg)](https://coveralls.io/github/chbrown/urlio)

A module for matching URLs against patterns with a syntax inspired by Ember.js (and thus react-router and angular's ui-router), but also generating URLs from pre-defined routes given path parameters.

    npm install --save urlio

For now, in its very alpha state, it supports `:var` and `*` (splat) segments in addition to literal contexts.

See the [tests](test/index.ts) for examples.


## License

Copyright 2015–2018 Christopher Brown.
[MIT Licensed](http://chbrown.github.io/licenses/MIT/#2015-2018)
