// copy ./README.md to ./dist/README.md
const fs = require('fs-extra');
fs.copySync('./README.md', './dist/README.md');

// delete ./dist/lib
fs.removeSync('./dist/lib');
