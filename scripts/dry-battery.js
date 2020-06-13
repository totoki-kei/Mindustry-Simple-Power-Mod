
/*
実装方針
* 小容量のCapacityをもったBatteryとして動作
  * リチャージをほぼ不可能にする
* 蓄電量は内部電力から自動補充する
*/

// 失敗例
// 毎フレームcapacityを小さくしていくことで再充電不可を表現しようとしたが
// ConsumePowerのcapacityがfinalであり上書きできなかった
/*
const dryBattery = extendContent(Battery, "dry-battery", {
    placed(tile) {
        var ent = tile.entity.power;
        ent.status = 1.0;
    },
    update(tile) {
        var power = this.consumes.getPower();
        var ent = tile.entity.power;
        if (power.capacity >= 10.0 && ent.status < 1.0) {
            power.capacity *= ent.status;
            ent.status = 1.0;

            if (power.capacity < 10.0) power.capacity = 10.0;
        }
    }
});
//*/

//*

// 類似したクラスオブジェクトを複数作るためプロトタイプ化
function dryBatteryTemplate (capa) {
    // 本当はcontent/xxxxx.hjsonで設定可能にしたいが
    // やり方が分からないのでこのままにする
    //this.dryBatteryCapacity = 600.0;
    this.dryBatteryCapacity = capa;

    this.placed = function(tile) {
        this.super$placed(tile);
        var entity = tile.ent();
        entity.setRestPower(this.dryBatteryCapacity);
        entity.power.status = 1.0; // 初期状態で蓄電済みにする

        print("<placed> restPower:" + entity.getRestPower());
    };

    this.update = function(tile) {
        this.super$update(tile);

        var entity = tile.ent();

        const rest = entity.getRestPower();

        if (rest > 0) {
            // 注意
            // PowerModuleのstatusは、capacityに体する割合で表現されている(0.0f - 1.0f)
            const capa = this.consumes.getPower().capacity;
            const stat = entity.power.status * capa;

            // print("rest: " + rest);
            // print("capa: " + capa);
            // print("stat: " + stat);

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

    };
    
    this.setBars = function() {
        this.super$setBars();


        // バーに数値を載せたい場合は、entityファクトリの第1引数はCore.bundle.format()呼び出しのファンクタにする必要がある
        // またその時には第2引数の色指定もprov()ファンクタにしなければならない

        // バーだけでいいならばこれは不要で、第1引数はbundle識別名、第2引数は色指定の直接指定でよい。

        this.bars.add("restPower", func(entity => new Bar(
            prov(() => Core.bundle.format("bar.simple-powers.restPower",
                Strings.fixed(entity.getRestPower(), 0))), 
            prov(() => Pal.powerBar),
            floatp(() => entity.getRestPower() / this.dryBatteryCapacity)))
        );
    };

    this.setStats = function() {
        this.super$setStats();

        // 説明文のパラメーター数値追加
        // 第一引数はBlockStat列挙体から選択しなければならない : おそらく独自のものを追加することはできない
        this.stats.add(BlockStat.basePowerGeneration, new NumberValue(this.dryBatteryCapacity, StatUnit.none));
    };

};

// 状態を増やすためにTileEntityを拡張しこれを使うよう差し替える
// (Door.js等を参考に)
// ここで作ったクラスは、Javaではコンストラクタで以下のように指定して差し替えている
//   entityType = <Entity派生クラス>::new;
// JavaScriptでは、prov補助関数を使用して
// TileEntity派生クラスオブジェクトを生成するファクトリを作成し、それを設定する
// 参考： ThePythonGuy3 / MindBlow 
const dryBatteryEntityType = prov(() => {
	const entity = extend(TileEntity, {
		getRestPower: function(){
			return this._restPower;
		},
		setRestPower: function(val){
			this._restPower = val;
        },
        
        write(stream) {
            this.super$write(stream);
            stream.writeFloat(this._restPower);
        },
        read(stream, revision) {
            this.super$read(stream, revision);
            this._restPower = stream.readFloat();
        }
	});
	return entity;
})


// 実際のクラスオブジェクトの作成
const dryBattery = extendContent(Battery, "dry-battery", new dryBatteryTemplate(1200.0));
dryBattery.entityType = dryBatteryEntityType;

const dryBatteryLarge = extendContent(Battery, "dry-battery-large", new dryBatteryTemplate(25000.0));
dryBatteryLarge.entityType = dryBatteryEntityType;

//*/
