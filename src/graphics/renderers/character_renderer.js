var CharacterRenderer = Renderer.extend({
    imgBase: null,
    imgHead: null,
    imgBody: null,

    scale: 1,

    init: function (entity, head, body) {
        this._super(entity);

        this.imgBase = Game.images.load('body_base.png');
        this.imgHead = Game.images.load('head_' + head + '.png');
        this.imgBody = Game.images.load('body_' + body + '.png');
    },

    draw: function (ctx, posX, posY) {
        posX -= 2;

        ctx.drawImage(this.imgBase, 0, 0, this.imgBase.width, this.imgBase.height, 0, 0, this.imgBase.width * this.scale, this.imgBase.height * this.scale);
        ctx.drawImage(this.imgBody, 0, 0, this.imgBody.width, this.imgBody.height, 0, 0, this.imgBody.width * this.scale, this.imgBody.height * this.scale);
        ctx.drawImage(this.imgHead, 0, 0, this.imgHead.width, this.imgHead.height, (this.imgBody.width * this.scale / 2) - (this.imgHead.width * this.scale / 2), 0, this.imgHead.width * this.scale, this.imgHead.height * this.scale);

        if (this.entity.hasWeapon && this.entity.imgWeapon) {
            var weapX = this.entity.getWidth() - this.entity.imgWeapon.width + 1;
            var weapY = this.entity.getHeight() - this.entity.imgWeapon.height - 10;

            if (this.entity.isAttacking) {
                var centerX = this.entity.getWidth() / 2;
                var centerY = this.entity.getHeight() / 2;

                ctx.translate(centerX, centerY);
                ctx.rotate(this.entity.attackingAnimation * (Math.PI / 180));
                ctx.translate(-centerX, -centerY);
            }

            ctx.drawImage(this.entity.imgWeapon, 0, 0, this.entity.imgWeapon.width, this.entity.imgWeapon.height, weapX, weapY, this.entity.imgWeapon.width * this.scale, this.entity.imgWeapon.height * this.scale);
        }
    }
});