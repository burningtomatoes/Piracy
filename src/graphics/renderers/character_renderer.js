var CharacterRenderer = Renderer.extend({
    imgBase: null,
    imgHead: null,
    imgBody: null,

    scale: 1,

    init: function (head, body) {
        this.imgBase = Game.images.load('body_base.png');
        this.imgHead = Game.images.load('head_' + head + '.png');
        this.imgBody = Game.images.load('body_' + body + '.png');
    },

    draw: function (ctx, posX, posY) {
        posX -= 2;
        ctx.drawImage(this.imgBase, 0, 0, this.imgBase.width, this.imgBase.height, 0, 0, this.imgBase.width * this.scale, this.imgBase.height * this.scale);
        ctx.drawImage(this.imgBody, 0, 0, this.imgBody.width, this.imgBody.height, 0, 0, this.imgBody.width * this.scale, this.imgBody.height * this.scale);
        ctx.drawImage(this.imgHead, 0, 0, this.imgHead.width, this.imgHead.height, (this.imgBody.width * this.scale / 2) - (this.imgHead.width * this.scale / 2), 0, this.imgHead.width * this.scale, this.imgHead.height * this.scale);
    }
});