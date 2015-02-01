var fs = require('fs');


module.exports = getFileEnding;

function getFileEnding(candidate, cb) {
  var hasMdEnding = /\.md$/.test(candidate),
      hasMarkdownEnding = /\.markdown$/.test(candidate);

  if (hasMdEnding) return cb(null, null);
  if (hasMarkdownEnding) return cb(null, null);

  fs.exists(candidate + '.md', function(mdExists) {
    fs.exists(candidate + '.markdown', function(markdownExists) {
      if (mdExists && markdownExists)
        return cb(new Error('.md and .markdown file exist for ' + candidate));

      if (mdExists) return cb(null, '.md');
      if (markdownExists) return cb(null, '.markdown');

      if (!markdownExists && !mdExists)
        return cb(new Error('no file found for ' + candidate));
    });
  });
}
