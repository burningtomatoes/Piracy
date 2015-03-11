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

    aiTimer: 0,
    aiMoving: false,
    aiMovingTime: 0,

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

        if (!this.isPlayer()) {
            // Basic ""AI"" movement stuff (lol jk just random movement)
            if (!this.landed) {
                this.aiMoving = false;
            }

            if (this.aiMoving && this.aiMovingTime > 0) {
                this.aiMovingTime--;

                this.velocityX = this.facingLeft ? -this.movementSpeed : this.movementSpeed;
            } else {
                this.velocityX = 0;
            }

            if (this.aiTimer > 0) {
                this.aiTimer--;
            } else {
                // Random chance: turn around
                if (chance.bool()) {
                    this.facingLeft = !this.facingLeft;
                }

                // Random chance: start or stop walking
                if (chance.bool()) {
                    this.aiMoving = chance.bool();

                    if (this.aiMoving) {
                        this.aiMovingTime = chance.integer({
                            min: 60,
                            max: 600
                        });
                    }
                }

                // Delay our next thought a bit
                this.aiTimer = chance.integer({
                    min: 60,
                    max: 600
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