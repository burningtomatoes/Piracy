var Boat = Entity.extend({
    init: function () {
        this._super();

        this.renderer = Game.prefabs.load('cargo_ship_1.json');
        this.renderer.onLoadComplete = function () {
            this.floatToWater();
        }.bind(this);
    }
});