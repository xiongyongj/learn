const child_process = require('child_process');
const Fs = require('fs');
const Os = require('os');

function onBeforeBuildFinish(options, callback) {
    let config = Fs.readFileSync(Editor.url("packages://auto-compress/config.json"), "utf-8");
    if (config) config = JSON.parse(config);
    if (!config || !config.enabled) {
        callback();
        return;
    }
    Editor.log("[构建后自动压缩png图片开始]");

    let queue = [];

    options.bundles.forEach((bundle) => {
        let buildResults = bundle.buildResults;

        let assets = buildResults.getAssetUuids();
        assets.forEach((uuid) => {
            let url = Editor.assetdb.uuidToUrl(uuid);
            if (!(/\.png$/.test(url))) return;
            let path = buildResults.getNativeAssetPath(uuid);
            let obj = {
                url : url,
                path : path
            }
            queue.push(obj);
        })
    })
    let info = {
        success : 0,
        fail : 0,
        tatal : queue.length
    }
    compressStart(config, queue, info, callback);
}

function compressStart(config, queue = [], info = {}, callback = null) {
    if (queue.length <= 0) {
        Editor.log(`[自动压缩完成] =>总共${info.tatal}张 | 成功${info.success}张 | 失败${info.fail}张`);
        callback && callback();
        return;
    }
    let obj = queue.shift();
    let u = obj.url.split("/");
    let name = u[u.length - 1];
    Editor.log(`正在压缩 ${name} | 构建后路径 ${obj.path}`);
    if (!obj.url || !obj.path) {
        info.fail++;
        compressStart(config, queue, info, callback);
        return;
    }
    compress(obj.path, config, info, () => {
        compressStart(config, queue, info, callback);
    })
}

function compress(path, config, info, cb) {

    let compressOptions = `--quality ${config.minQuality}-${config.maxQuality} --ext=.png --force --skip-if-larger`;
    let pngquant = null;
    if (Os.platform() == "darwin") pngquant = Editor.url("packages://auto-compress/pngquant/mac/pngquant");
    else if (Os.platform() == "win32") pngquant = Editor.url("packages://auto-compress/pngquant/windows/pngquant");
    let command = `${pngquant} ${compressOptions} -- ${path}`;

    let stat = Fs.statSync(path);
    let BSize = (stat.size / 1024).toFixed(2);

    child_process.exec(command, (error, stdout, stderr) => {
        if (!error) {
            let stat_ = Fs.statSync(path);
            let ASize = (stat_.size / 1024).toFixed(2);
            info.success++;
            Editor.log(`压缩成功 >>> 压缩前 ${BSize}KB | 压缩后 ${ASize}KB | ${path}`);
        } else {
            info.fail++;
            Editor.warn(`压缩失败 >>> ${path}`, error);
            let reason = "";
            switch (error.code) {
                case 98:
                    reason = "压缩后体积变大(无法再压缩)";
                    break;
                case 99:
                    reason = "压缩后质量低于最低质量配置";
                    break;
                case 127:
                    reason = "压缩引擎没有执行权限";
                    break;
                default:
                    reason = "error code ->" + error.code;
                    break;
            }
            Editor.log(`-   失败原因：`, reason);
        }
        cb && cb();
    })
}




module.exports = {

    load() {
        Editor.Builder.on("before-change-files", onBeforeBuildFinish);
    },
    
    unload() {
        Editor.Builder.removeListener("before-change-files", onBeforeBuildFinish);
    },

    messages: {
        "hello"() {
            Editor.log("[hello world]");
        },

        "open"() {
            Editor.log("打开Auto Compress面板");
            Editor.Panel.open("auto-compress");
        }
    }
}