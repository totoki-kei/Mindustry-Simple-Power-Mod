//const stepGenerator = extendContent(PowerDistributor, "step-generator", {
const stepGenerator = extendContent(Battery, "step-generator", {
    unitOn(tile, unit) {
        var val2 = unit.velocity().x * unit.velocity().x + unit.velocity().y * unit.velocity().y;
        var val = Mathf.sqrt(val2) * 5;
        //Log.info("power: " + val);
        tile.entity.power.graph.chargeBatteries(val);
        //Effects.effect(Fx.smoke, Tmp.c1.set(Color.valueOf("84f491")), tile.drawx(), tile.drawy(), tile.block().size);
    },
    tapped(tile, player){
        //Log.info("tapped.");
        tile.entity.power.graph.chargeBatteries(10);
        Effects.effect(Fx.dooropen, Tmp.c1.set(Color.valueOf("84f491")), tile.drawx(), tile.drawy(), tile.block().size);
    }
});
