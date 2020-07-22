
cc.Class({
    extends: cc.Component,

    properties: {
        RLabel: cc.Label,
        GLabel: cc.Label,
        BLabel: cc.Label,
        ALabel: cc.Label,

        RSlider: cc.Slider,
        GSlider: cc.Slider,
        BSlider: cc.Slider,
        ASlider: cc.Slider,

        WidthSlider: cc.Slider,
        WidthLabel: cc.Label,

        AngleSlider: cc.Slider,
        AngleLabel: cc.Label,

        fogToggle: cc.Toggle,

        customTex: cc.Sprite,
        coord: cc.Node,
    },

    start() {
        this.coord.on("touchmove", this.changeCoord, this);

        this.changeRGBA();
        this.changeWidth();
        this.changeAngle();
        this.changeFogFlag(this.fogToggle);
    },

    changeRGBA(slider, custom) {
        if (custom == "R") {
            this.setLabel(this.RLabel, this.RSlider.progress);
        } else if (custom == "G") {
            this.setLabel(this.GLabel, this.GSlider.progress);
        } else if (custom == "B") {
            this.setLabel(this.BLabel, this.BSlider.progress);
        } else if (custom == "A") {
            this.setLabel(this.ALabel, this.ASlider.progress);
        }
        this.setUniformData("lineColor", [this.RSlider.progress, this.GSlider.progress, this.BSlider.progress, this.ASlider.progress]);
    },

    changeWidth(slider, custom) {
        this.setLabel(this.WidthLabel, this.WidthSlider.progress);
        this.setUniformData("lineWidth", this.WidthSlider.progress);
    },

    changeAngle(slider, custom) {
        let angle = (this.AngleSlider.progress * 360).toFixed(2);
        this.setLabel(this.AngleLabel, angle);
        this.setUniformData("lineAngle", angle);
    },

    changeCoord(event) {
        let local = this.coord.convertToNodeSpaceAR(event.getLocation());
        let coord = cc.v2(
            this.coord.anchorX + local.x / this.coord.width,
            1.0 - (this.coord.anchorY + local.y / this.coord.height)
        )
        this.setUniformData("lineCenter", coord);
    },

    changeFogFlag(toggle) {
        this.setUniformData("lineFog", toggle.isChecked ? 1.0 : 0.0);
    },

    setLabel(label, str = "") {
        label.string = Number(str).toFixed(2);
    },

    setUniformData(property, value) {
        let material = this.customTex.getMaterial(0);

        material.setProperty(property, value, 0);

        this.customTex.setMaterial(0, material);
    },



});