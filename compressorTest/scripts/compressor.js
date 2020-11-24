const Path = require('path');
const Os = require('os');
const ChildProcess = require('child_process');

let filename = "test";
let compressOptions = `--quality 60-80 --force --skip-if-larger -o ${Path.join(Path.resolve("./"), `output/${filename}.png`)}`;

let pngquantPath = null;
if (Os.platform() == "darwin") pngquantPath = Path.join(Path.resolve("./"), "pngquant/mac/pngquant");
else if (Os.platform() == "win32") pngquantPath = Path.join(Path.resolve("./"), "pngquant/windows/pngquant");

let command = `${pngquantPath} ${compressOptions} -- ${Path.join(Path.resolve("./"), "texture/test.png")}`;

console.log(command);

function compress(command) {
    ChildProcess.exec(command, (err, stdout, stderr) => {
        if (!err) console.log("压缩完成");
        else console.log(err);
    });
}

compress(command);
