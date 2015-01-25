var Lab = require('lab');
var lab = exports.lab = Lab.script();
var assert = require('assert');

var spawn = require('child_process').spawn;

lab.experiment('doc generation', function() {
  lab.test('it renders html from *.md files', function(done) {
    var files = [__dirname + '/fixtures/md/index.md'];

    generate('html', files, function (err, buf) {
      assert.ok(/<h2>hello from index.md/.test(buf.toString()));
      done();
    });
  });

  lab.test('it processes includes from *.md files', function(done) {
    var files = [__dirname + '/fixtures/md/index.md'];

    generate('html', files, function (err, buf) {
      assert.ok(/<h2>Hello from include with md-fileending!/.test(buf.toString()));
      done();
    });
  });
});


function generate(format, files, cb) {
  var buffer = '',
      child;

  child = spawn(__dirname + '/../generate.js', [
    '--format=' + format,
    '--template=' + __dirname + '/fixtures/template.html'
  ].concat(files));

  child.stdout.on('data', function(chunk) {
    buffer += chunk;
  });

  child.on('close', function () {
    cb(null, buffer);
  });
}
