#!/usr/bin/env node
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var marked = require('marked');
var fs = require('fs');
var path = require('path');
var findMarkdownFile = require('./lib/find-markdown-file.js');
var getConfigForMarkdownFile = require('./lib/get-config-for-markdown-file.js');

var html = require('./html.js');
var json = require('./json.js');

// parse the args.
// Don't use nopt or whatever for this.  It's simple enough.

var args = process.argv.slice(2);
var format = 'json';
var template = null;
var inputFile = null;

args.forEach(function (arg) {
  if (!arg.match(/^\-\-/)) {
    inputFile = arg;
  } else if (arg.match(/^\-\-format=/)) {
    format = arg.replace(/^\-\-format=/, '');
  } else if (arg.match(/^\-\-template=/)) {
    template = arg.replace(/^\-\-template=/, '');
  }
})


if (!inputFile) {
  throw new Error('No input file specified');
}


console.error('Input file = %s', inputFile);
fs.readFile(inputFile, 'utf8', function(er, input) {
  if (er) throw er;
  // process the input for @include lines
  processIncludes(input, next);
});


var includeExpr = /^@include\s+([A-Za-z0-9-_]+)(?:\.)?([a-zA-Z]*)$/gmi;
var includeData = {};
function processIncludes(input, cb) {
  var includes = input.match(includeExpr);
  if (includes === null) return cb(null, input);
  var errState = null;
  console.error(includes);
  var incCount = includes.length;
  if (incCount === 0) cb(null, input);

  includes.forEach(function(include) {
    var fname = include.replace(/^@include\s+/, '');
    findMarkdownFile(path.resolve(path.dirname(inputFile), fname), function(err, file) {
      if (err) throw err;
      if (includeData.hasOwnProperty(file)) {
        input = input.split(include).join(includeData[file]);
        incCount--;
        if (incCount === 0) {
          return cb(null, input);
        }
      }

      var fullFname = path.resolve(path.dirname(inputFile), file);
      fs.readFile(fullFname, 'utf8', function(err, inc) {
        if (errState) return;
        if (err) return cb(errState = err);
        processIncludes(inc, function(err, inc) {
          if (errState) return;
          if (err) return cb(errState = err);
          incCount--;
          includeData[file] = inc;
          input = input.split(include + '\n').join(includeData[file] + '\n');
          if (incCount === 0) {
            return cb(null, input);
          }
        });
      });
    });
  });
}


function next(er, input) {
  if (er) throw er;
  switch (format) {
    case 'json':
      json(input, inputFile, function(er, obj) {
        console.log(JSON.stringify(obj, null, 2));
        if (er) throw er;
      });
      break;

    case 'html':
      var configObj = getConfigForMarkdownFile(inputFile);
      html(input, inputFile, template, configObj, function(er, html) {
        if (er) throw er;
        console.log(html);
      });
      break;

    default:
      throw new Error('Invalid format: ' + format);
  }
}
