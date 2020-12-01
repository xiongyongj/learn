
const Fs = require('fs');

let CompressType = {
    "pngquant" : "pngquant",
    "tinypng" : "tinypng",
    "both" : "both"
}

function saveConfig(config) {
    Fs.writeFileSync(Editor.url("packages://auto-compress/config.json"), JSON.stringify(config, null, "\t"));
    Editor.log(`保存成功:${Editor.url("packages://auto-compress/config.json")}`);
}

function readConfig() {
    let config = Fs.readFileSync(Editor.url("packages://auto-compress/config.json"), "utf-8");
    return JSON.parse(config);
}

Editor.Panel.extend({
    
    style : Fs.readFileSync(Editor.url("packages://auto-compress/panel/style.css"), "utf-8"),

    template : Fs.readFileSync(Editor.url("packages://auto-compress/panel/index.html"), "utf-8"),

    $ : {
        EI : "#EI",
        SAVE : ".save",
        MIN_QI : "#MIN_QI",
        MAX_QI : "#MAX_QI",
        API_KEY : "#API_KEY",
        PNGQUANT : "#pngquant",
        TINYPNG : "#tinypng",
        BOTH : "#both"
    },

    ready() {
        this.$SAVE.removeEventListener("clicl", this.saveEvent.bind(this));
        this.$SAVE.addEventListener("click", this.saveEvent.bind(this))

        let config = readConfig();
        this.initPanel(config);
        this.initCompressType(config);
    },

    saveEvent() {
        let config = {};
        config.enabled = !!this.$EI.checked,
        config.minQuality = parseInt(this.$MIN_QI.value);
        config.maxQuality = parseInt(this.$MAX_QI.value);
        config.apiKey = this.$API_KEY.value;
        config.compressType = this.getCompressType();
        saveConfig(config);
    },

    initPanel(config) {
        if (!config) return;
        this.$EI.checked = !!config.enabled;
        this.$MIN_QI.value = config.minQuality || 60;
        this.$MAX_QI.value = config.maxQuality || 80;
        this.$API_KEY.value = config.apiKey || "";
    },

    initCompressType(config) {
        if (!config) return;
        if (!config.compressType) {
            this.$BOTH.checked = true;
        } else {
            this.$PNGQUANT.checked = (config.compressType == CompressType.pngquant);
            this.$TINYPNG.checked = (config.compressType == CompressType.tinypng);
            this.$BOTH.checked = (config.compressType == CompressType.both);
        }
    },

    getCompressType() {
        let type = "";
        let element = [this.$PNGQUANT, this.$TINYPNG, this.$BOTH];
        for (let i = 0; i < element.length; ++i) {
            let val = element[i];
            if (val.checked) {
                type = val.id;
                break;
            }
        }
        return type;
    }
})