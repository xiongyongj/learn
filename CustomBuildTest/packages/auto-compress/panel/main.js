
const Fs = require('fs');
const { type } = require('os');

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
        MAX_QI : "#MAX_QI"
    },

    ready() {
        Editor.log(this.$MIN_QI.width);
        this.$SAVE.removeEventListener("clicl", this.saveEvent.bind(this));
        this.$SAVE.addEventListener("click", this.saveEvent.bind(this))

        let config = readConfig();
        this.initPanel(config);
    },

    saveEvent() {
        let config = {};
        config.enabled = !!this.$EI.checked,
        config.minQuality = parseInt(this.$MIN_QI.value);
        config.maxQuality = parseInt(this.$MAX_QI.value);
        saveConfig(config);
    },

    initPanel(config) {
        if (!config) return;
        this.$EI.checked = !!config.enabled;
        this.$MIN_QI.value = config.minQuality || 60;
        this.$MAX_QI.value = config.maxQuality || 80;
    },
})