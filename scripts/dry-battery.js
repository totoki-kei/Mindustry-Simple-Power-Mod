//const stepGenerator = extendContent(PowerDistributor, "step-generator", {

// パラメーター
// Dry Batteryの容量
const dryBatteryCapacity = 4000;

const dryBattery = extendContent(Battery, "dry-battery", {
    
    
    update(tile) {
        this.super$update(tile);

        var entity = tile.ent();

        const rest = entity.getRestPower();

        if (rest > 0) {
            // 注意
            // PowerModuleのstatusは、capacityに体する割合で表現されている(0.0f - 1.0f)
            const capa = this.consumes.getPower().capacity;
            const stat = entity.power.status * capa;

            print("rest: " + rest);
            print("capa: " + capa);
            print("stat: " + stat);

            const delta = capa - stat;

            if (delta > 0) {
                if (delta < rest) {
                    entity.power.status += delta / capa;
                    entity.setRestPower(rest - delta);
                } else {
                    entity.power.status += rest / capa;
                    entity.setRestPower(0);
                }
            }
        }

    },
    
    setBars() {
        this.super$setBars();


        // バーに数値を載せたい場合は、entityファクトリの第1引数はCore.bundle.format()呼び出しのファンクタにする必要がある
        // またその時には第2引数の色指定もprov()ファンクタにしなければならない

        // バーだけでいいならばこれは不要で、第1引数はbundle識別名、第2引数は色指定の直接指定でよい。

        this.bars.add("restPower", func(entity => new Bar(
            prov(() => Core.bundle.format("block.restPower",
                Strings.fixed(entity.getRestPower(), 0))), 
            prov(() => Pal.powerBar),
            floatp(() => entity.getRestPower() / dryBatteryCapacity)))
        );
    }

});

// 状態を増やすためにTileEntityを拡張しこれを使うよう差し替える
// (Door.js等を参考に)
// ここで作ったクラスは、Javaではコンストラクタで以下のように指定して差し替えている
//   entityType = <Entity派生クラス>::new;
// JavaScriptでは、prov補助関数を使用して
// TileEntity派生クラスオブジェクトを生成するファクトリを作成し、それを設定する
// 参考： ThePythonGuy3 / MindBlow 
dryBattery.entityType = prov(() => {
	const entity = extend(TileEntity, {
		getRestPower: function(){
			return this._restPower;
		},
		setRestPower: function(val){
			this._restPower = val;
		}
	});
	entity.setRestPower(dryBatteryCapacity);
	return entity;
});

/*
実装方針
* 小容量のCapacityをもったBatteryとして動作
  * リチャージをほぼ不可能にする
・蓄電量は内部電力から自動補充される
*/