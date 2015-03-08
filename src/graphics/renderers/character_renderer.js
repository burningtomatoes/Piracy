var CharacterRenderer = Renderer.extend({
    imgBase: null,
    imgHead: null,
    imgBody: null,

    init: function (head, body) {
        this.imgBase = Game.images.load('body_base.png');
        this.imgHead = Game.images.load('head_' + head + '.png');
        this.imgBody = Game.images.load('body_' + body + '.png');
    },

    draw: function (ctx, posX, posY) {
        posX -= 2;
        ctx.translate(posX, posY);
        ctx.drawImage(this.imgBase, 0, 0, this.imgBase.width, this.imgBase.height, 0, 0, this.imgBase.width, this.imgBase.height);
        ctx.drawImage(this.imgHead, 0, 0, this.imgHead.width, this.imgHead.height, (this.imgBody.width / 2) - (this.imgHead.width / 2), 0, this.imgHead.width, this.imgHead.height);
        ctx.drawImage(this.imgBody, 0, 0, this.imgBody.width, this.imgBody.height, 0, 0, this.imgBody.width, this.imgBody.height);
        ctx.translate(-posX, -posY);
    }


});