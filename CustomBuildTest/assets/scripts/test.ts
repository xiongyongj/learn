
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    monsterPre : cc.Prefab = null;

    // onLoad () {}

    start () {

        this.loadMonster();
    }

    loadMonster() {
        // cc.resources.load("prefabs/monster", cc.Prefab, (err, pfb) => {
        //     let monster = cc.instantiate(pfb);
        //     cc.find('Canvas').addChild(monster);
        // })
    }

    // update (dt) {}
}
