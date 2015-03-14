var Coin = Entity.extend({
    value: null,
    imgCoin: null,

    causesCollision: false,
    receivesCollision: true,

    init: function (value, pX, pY) {
        this.value = value;

        this.imgCoin = Game.images.load('goldpc.png');

        this.posX = pX;
        this.posY = pY;

        this.velocityX = chance.floating({ min: -10, max: 10 });
        this.velocityY = chance.floating({ min: 3, max: 16 });
    },

    getHeight: function () {
        if (this.imgCoin == null) {
            return 0;
        }

        return this.imgCoin.height;
    },

    getWidth: function () {
        if (this.imgCoin == null) {
            return 0;
        }

        return this.imgCoin.width;
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
        ctx.drawImage(this.imgCoin, 0, 0, this.imgCoin.width, this.imgCoin.height, Camera.translateX(this.posX), Camera.translateY(this.posY), this.imgCoin.width, this.imgCoin.height);
    }
});