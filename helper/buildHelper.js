const fs = require('fs');
const deleteFolderRecursive = function(path) {
    if(fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file){
            const curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

deleteFolderRecursive('./lib');