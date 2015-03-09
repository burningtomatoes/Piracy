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