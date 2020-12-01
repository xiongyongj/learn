const child_process = require('child_process');
const Fs = require('fs');
const Os = require('os');
const Path = require('path');
const Tinify = require('tinify');

let CompressType = {
    "pngquant" : "pngquant",
    "tinypng" : "tinypng",
    "both" : "both"
}

function onBeforeBuildFinish(options, callback) {
    let config = Fs.readFileSync(Editor.url("packages://auto-compress/config.json"), "utf-8");
    if (config) config = JSON.parse(config);
    if (!config || !config.enabled) {
        callback();
        return;
    }
    Tinify.key = config.apiKey || "";
    Editor.log("[构建后自动压缩png图片开始]");

    let queue = [];

    options.bundles.forEach((bundle) => {
        let buildResults = bundle.buildResults;

        let assets = buildResults.getAssetUuids();
        assets.forEach((uuid) => {
            let url = Editor.assetdb.uuidToUrl(uuid);
            let regular = null;
            if (config.compressType == CompressType.tinypng) regular = /\.png|\.jpg|\.jpeg$/;
            else regular = /\.png$/;
            if (!(regular.test(url))) return;
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
        invalid:0,
        tatal : queue.length
    }
    compressStart(config, queue, info, callback);
}

function isSpine(url) {
    let baseUrl = Path.dirname(url);
    let ext = Path.extname(url);
    let name = Path.basename(url).split(ext)[0];
    let json = Path.join(baseUrl, `${name}.json`);
    let atlas = Path.join(baseUrl, `${name}.atlas`);

    json = json.replace('db:', Editor.Project.path);
    atlas = atlas.replace('db:', Editor.Project.path);

    return !!(Fs.existsSync(json) && Fs.existsSync(atlas));
}

function compressStart(config, queue = [], info = {}, callback = null) {
    if (queue.length <= 0) {
        Editor.log(`[自动压缩完成] =>总共${info.tatal}张 | 成功${info.success}张 | 失败${info.fail}张 | 无效${info.invalid}`);
        callback && callback();
        return;
    }
    let obj = queue.shift();
    if (!obj.url || !obj.path || /^db:\/\/internal/.test(obj.url) ||
        (config.compressType == CompressType.pngquant && isSpine(obj.url))) {
        info.invalid++;
        compressStart(config, queue, info, callback);
        return;
    }

    let func = () => compressStart(config, queue, info, callback);
    if (config.compressType == CompressType.pngquant) {
        compress(obj, config, info, func);
    } else if (config.compressType == CompressType.tinypng) {
        compress2(obj, config, info, func);
    } else {
        if (isSpine(obj.url)) {
            compress2(obj, config, info, func);
        } else {
            compress(obj, config, info, func);
        }
    }
}

/**
 * pngquant 压缩
 */
function compress(obj, config, info, cb) {
    let url = obj.url, path = obj.path;
    Editor.log(`正在使用 pngquant 压缩 ${Path.basename(url)} | 构建前路径 ${url} | 构建后路径 ${path}`);
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

/**
 * tinify 压缩
 */
function compress2(obj, config, info, cb) {
    let url = obj.url, path = obj.path;
    Editor.log(`正在使用 tinypng 压缩 ${Path.basename(url)} | 构建前路径 ${url} | 构建后路径 ${path}`);
    let BSize = (Fs.statSync(path).size / 1024).toFixed(2);
    let source = Tinify.fromFile(path);
    source.toFile(path, (error, data) => {
        if (!error) {
            let ASize = (Fs.statSync(path).size / 1024).toFixed(2);
            info.success++;
            Editor.log(`压缩成功 >>> 压缩前 ${BSize}KB | 压缩后 ${ASize}KB | ${path}`);
        } else {
            info.fail++;
            Editor.warn(`压缩失败 >>> ${path}`, error);
            let reason = "";
            if (error instanceof Tinify.AccountError) reason = "本月压缩数量已达上限" + error.message;
            else if (error instanceof Tinify.ClientError) reason = "提交的数据存在问题，无法完成请求";
            else if (error instanceof Tinify.ServerError) reason = "Tinify API出现问题，无法完成请求";
            else if (error instanceof Tinify.ConnectionError) reason = "连接出现问题";
            else reason = "error ->" + error.message;
            Editor.log(`-   失败原因：${reason}`);
        }
        cb && cb();
    });
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