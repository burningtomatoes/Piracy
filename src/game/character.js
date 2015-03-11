var Character = Entity.extend({
    doesFloat: true,
    affectedByGravity: true,

    isCharacter: true,
    hasHealthBar: true,

    hasWeapon: false,
    imgWeapon: null,
    weaponDamage: 0,

    init: function () {
        this.renderer = new CharacterRenderer(
            this,
            chance.integer({ min: 1, max: 7 }),
            chance.integer({ min: 1, max: 6 })
        );

        this.equipWeapon('sword_basic', 10);
    },

    equipWeapon: function (id, damage) {
        this.imgWeapon = Game.images.load(id + '.png');
        this.weaponDamage = damage;
        this.hasWeapon = true;
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

        if (this.isPlayer()) {
            Camera.rumble(5, 2);
            if (!this.drowning) {
                AudioOut.playSfx('pain_big.wav', 0.75);
            }
        } else {
            if (!this.drowning) {
                AudioOut.playSfx('pain_small.wav', 0.5);
            }
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

        if (this.isPlayer() && !Game.isGameOver) {
            Game.gameOver();
        }
    }
});