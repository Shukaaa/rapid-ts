const fs = require('fs');

fs.readFile("./dist/package.json", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const packageJson = JSON.parse(data);
    const version = packageJson.version;
    const versionParts = version.split(".");
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;
    packageJson.version = newVersion;
    fs.writeFile("./dist/package.json", JSON.stringify(packageJson, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Version increased from ${version} to ${newVersion}`);
    });
});
