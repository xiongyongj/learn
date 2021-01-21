
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad() {
        this._body = this.node.getChildByName("body");
        this._spine = this._body.getChildByName("spine");

        this.loadSpine();
    },

    loadSpine() {
        this._body.scale = 0.2;

        cc.resources.load("spines/gaojixiongnujiangling2", sp.SkeletonData, (err, res) => {
            let spine = this._spine.getComponent(sp.Skeleton);
            spine.skeletonData = res;
            // spine.clearTracks();
            spine.setAnimation(0, "Idle", true);
            setTimeout(() => {
                // spine.clearTracks();
                spine.setAnimation(0, "Run", true);
                spine.clearTracks();
            }, 200)
        })
    },
});