var CoinRenderer = Renderer.extend({
    imgCoin: null,

    scale: 1,

    init: function (entity) {
        this._super(entity);

        this.imgCoin = Game.images.load('goldpc.png');
    },

    getWidth: function () {
        if (this.imgCoin == null) {
            return 0;
        }

        return this.imgCoin.width;
    },

    getHeight: function () {
        if (this.imgCoin == null) {
            return 0;
        }

        return this.imgCoin.height;
    },

    update: function () {

    },

    draw: function (ctx, posX, posY) {
        ctx.drawImage(this.imgCoin, 0, 0, this.imgCoin.width, this.imgCoin.height, 0, 0, this.imgCoin.width, this.imgCoin.height);
    }
});