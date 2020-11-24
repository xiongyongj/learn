
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        cc.loader.loadRes("prefabs/flash-light", cc.Prefab, (err, pfb) => {
            if (err) {

            } else {
                let node = cc.instantiate(pfb);
                this.node.addChild(node);
            }
        })
    },

});
