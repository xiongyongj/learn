
cc.Class({
    extends: cc.Component,

    properties: {
        monsterPre : cc.Prefab,
    },

    start() {
        this.loadMonster();
    },

    loadMonster() {
        cc.resources.load("prefabs/monster", cc.Prefab, (err, pfb) => {
            var monster = cc.instantiate(pfb);
            cc.find('Canvas').addChild(monster);
        })
    }

});
