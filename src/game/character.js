var Character = Entity.extend({
    doesFloat: true,
    affectedByGravity: true,

    isCharacter: true,
    hasHealthBar: true,

    init: function () {
        this.renderer = new CharacterRenderer
        (
            chance.integer({ min: 1, max: 6 }),
            chance.integer({ min: 1, max: 6 })
        )
    },

    drowning: false,

    damage: function (d) {
        if (!this.drowning && !this.dead) {
            Particles.emit({
                srcX: this.posX + (this.getWidth() / 2),
                srcY: this.posY + (this.getHeight() / 2),
                minAmount: 1,
                maxAmount: d,
                color: '#ff0000',
                lifetime: 60
            });
        }

        this._super(d);
    },

    update: function () {
        if (this.drowning) {
            this.damage(2);
            this.renderer.scale *= 0.975;
            this.posY += 0.5;

            if (this.alpha > 0) {
                this.alpha -= 0.025;
                this.alpha = MathHelper.clamp(this.alpha, 0, 1);
            }
        } else {
            this._super();

            if (this.isFloating()) {
                this.drowning = true;

                AudioOut.playSfx('splash.wav', 1);

                Particles.emit({
                    srcX: this.posX + (this.getWidth() / 2),
                    srcY: this.posY + (this.getHeight() / 2),
                    minAmount: 50,
                    maxAmount: 100,
                    color: '#fff',
                    lifetime: 60
                });
            }
        }
    },

    die: function () {
        this._super();

        if (this.drowning) {
            World.remove(this);
        }
    }
});