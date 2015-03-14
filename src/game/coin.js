var Coin = Entity.extend({
    value: null,

    causesCollision: false,
    receivesCollision: true,

    init: function (value, pX, pY) {
        this.value = value;

        this.posX = pX;
        this.posY = pY;

        this.velocityX = chance.floating({ min: -10, max: 10 });
        this.velocityY = chance.floating({ min: 3, max: 16 });

        this.renderer = new CoinRenderer();
    },

    update: function () {
        this._super();

        this.velocityX *= 0.75;

        if (World.player != null && !World.player.dead) {
            var theirRect = World.player.getRect();
            var ourRect = this.getRect();

            if (Utils.rectIntersects(theirRect, ourRect)) {
                Game.addGold(this.value);
                World.remove(this);
                return;
            }
        }
    },

    draw: function (ctx) {
        this._super(ctx);
    }
});