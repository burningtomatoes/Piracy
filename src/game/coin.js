var Coin = Entity.extend({
    value: null,

    causesCollision: false,
    receivesCollision: true,

    init: function (value, pX, pY) {
        this.value = value;

        this.posX = pX;
        this.posY = pY;

        this.velocityX = chance.floating({ min: -10, max: 10 });
        this.velocityY = chance.floating({ min: -5, max: -1 });

        this.renderer = new CoinRenderer();
    },

    getRect: function (overrideX, overrideY) {
        var x = this.posX;
        var y = this.posY;

        if (overrideX != null) {
            x = overrideX;
        }

        if (overrideY != null) {
            y = overrideY;
        }

        var w = this.getWidth();
        var h = this.getHeight();

        var margin = 2;

        var rect = {
            left: x,
            top: y,
            height: h - margin,
            width: w - margin
        };
        rect.bottom = rect.top + rect.height;
        rect.right = rect.left + rect.width;
        return rect;
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

        if (this.isFloating()) {
            World.remove(this);
        }
    },

    draw: function (ctx) {
        this._super(ctx);
    }
});