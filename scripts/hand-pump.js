//const handPump = extendContent(LiquidBlock, "hand-pump", {
const handPump = extendContent(LiquidTank, "hand-pump", {
    tapped(tile, player){
        //Log.info("tapped.");
        var liquidDrop = tile.floor().liquidDrop;

        if (tile.entity.cons.valid() && liquidDrop != null){
            // var maxPump = Math.min(
            //     liquidCapacity - tile.entity.liquids.total(),
            //     1
            // ) * tile.entity.efficiency();
            var maxPump = 5;

            tile.entity.liquids.add(liquidDrop, maxPump);
            Effects.effect(Fx.dooropen, Tmp.c1.set(Color.valueOf("84f491")), tile.drawx(), tile.drawy(), tile.block().size);
        }

    },
    canPlaceOn(tile){
        const ret = tile != null && tile.floor().liquidDrop != null;
        //print("canPlaceOn: " + ret);
        return ret;
    }

});
