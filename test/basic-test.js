var Lab = require('lab');
var lab = exports.lab = Lab.script();
var assert = require('assert');

var spawn = require('child_process').spawn;

lab.experiment('doc generation', function() {
  lab.test('it renders html from *.md files', function(done) {
    var files = [__dirname + '/fixtures/md/index.md'];

    generate('html', files, function (err, buf) {
      var res = /<h2>hello from index.md/.test(buf.toString());
      assert.ok(res, 'should render .md files');
      done();
    });
  });

  lab.test('it processes includes from *.md files', function(done) {
    var files = [__dirname + '/fixtures/md/index.md'];

    generate('html', files, function (err, buf) {
      var res = /<h2>Hello from include with md-fileending!/;
      assert.ok(res.test(buf.toString()), 'should render .md includes');
      done();
    });
  });

  lab.test('it renders html from *.markdown files', function(done) {
    var files = [__dirname + '/fixtures/markdown/index.markdown'];

    generate('html', files, function (err, buf) {
      var res = /<h2>hello from index.markdown/.test(buf.toString());
      assert.ok(res, 'should render .markdown');
      done();
    });
  });

  lab.test('it processes includes from *.markdown files', function(done) {
    var files = [__dirname + '/fixtures/markdown/index.markdown'];

    generate('html', files, function (err, buf) {
      var res = /<h2>Hello from include with markdown-fileending!/.test(buf.toString());
      assert.ok(res, 'should render .markdown includes');
      done();
    });
  });

  lab.test('it processes includes with an explicit fileending', function(done) {
    var files = [__dirname + '/fixtures/include-with-file-ending/index.markdown'];

    generate('html', files, function (err, buf) {
      var res = /<h2>Hello from _toc.markdown/.test(buf.toString());
      assert.ok(res, 'should render .markdown includes with a defined fileending');
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
