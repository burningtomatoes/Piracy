var Character = Entity.extend({
    doesFloat: true,
    affectedByGravity: true,

    isCharacter: true,
    hasHealthBar: true,

    hasWeapon: false,
    imgWeapon: null,
    weaponDamage: 0,

    randomSpeech: [
        "Arr!",
        "Bloody cold out here!",
        "Let's plunder some booty!",
        "What do you do with a drunken sailor!?",
        '"Leave her, Johnny, leave her!"',
        'I hate to sail on this rotten tub.',
        'Haul away your anchor!',
        "O, I got a sister, she's nine feet tall!",
        "Please tell me, what is this sailboat's name?",
        "Whiskey, Johnny!",
        "If ye growl too hard yer head they'll bust!",
        "Ranzo, Ranzo, weigh heigh!",
        "Timme, hey-rig-a-jig an' a ha-ha!",
        "When the wind blows, we're all together, boys!",
        "Why can't ye be so handy-o!",
        "Handy, me boys, so handy!",
        "Help me, Bob, I'm bully in the alley!",
        "O, my name was Captain Kidd!",
        "Oh, Nancy Dawson, Hi-oh!",
        "What will we do with a drunken sailor?",
        "Put 'em in the scuppers with a hose pipe on him!",
        "Put him in the brig until he's sober!",
        "Early in the morning!",
        "..."
    ],

    init: function () {
        this.renderer = new CharacterRenderer(
            this,
            chance.integer({ min: 1, max: 8 }),
            chance.integer({ min: 1, max: 6 })
        );

        this.equipWeapon('sword_basic', 5);
    },

    equipWeapon: function (id, damage) {
        this.imgWeapon = Game.images.load(id + '.png');
        this.weaponDamage = damage;
        this.hasWeapon = true;
    },

    drowning: false,

    damage: function (d) {
        if (!this.drowning && !this.dead) {
            if (d >= 1) {
                Particles.emit({
                    srcX: this.posX + (this.getWidth() / 2),
                    srcY: this.posY + (this.getHeight() / 2),
                    minAmount: 1,
                    maxAmount: d,
                    color: '#ff0000',
                    lifetime: 60
                });
            }
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

    attackCooldown: 0,
    isAttacking: false,
    attackingAnimation: 0,

    attackingEntity: null,

    getEnemyInRange: function () {
        var entities = World.entities.slice();

        var closestNumber = 9999;
        var closestEntity = null;

        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            if (entity === this || entity.dead || !entity.isCharacter || !this.canDamage(entity)) {
                continue;
            }

            var distanceX = Math.abs(this.posX - entity.posX);
            var distanceY = Math.abs(this.posY - entity.posY);

            if (distanceX <= 200 && distanceY <= 32) {
                var totDist = distanceX + distanceY;
                if (closestNumber > totDist) {
                    closestEntity = entity;
                    closestNumber = totDist;
                }
            }
        }

        return closestEntity;
    },

    attack: function () {
        if (this.attackCooldown > 0 || this.isAttacking || this.isKnockingBack) {
            return;
        }

        this.isAttacking = true;
        this.attackCooldown = 12;
        this.attackingAnimation = 0;

        var entities = World.getCharactersInRect(this.getAttackRect(), this);

        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            if (this.canDamage(entity)) {
                entity.damage(chance.integer({
                    min: this.weaponDamage - 5,
                    max: this.weaponDamage + 5
                }));
                entity.knockBack(this);
            }
        }
    },

    isKnockingBack: false,

    knockBack: function (source) {
        this.isKnockingBack = true;
        this.velocityX = source.facingLeft ? -3 : 3;
        if (this.landed) {
            this.velocityY = -1.5;
        }
        this.facingLeft = !source.facingLeft;
    },

    canDamage: function (entity) {
        if (entity.dead) {
            return false;
        }

        return (this.isFriendly() && entity.isEnemy()) || (this.isEnemy() && entity.isFriendly());
    },

    update: function () {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        if (this.isAttacking) {
            this.attackingAnimation += 4;

            if (this.attackingAnimation >= 40) {
                this.attackingAnimation = 0;
                this.isAttacking = false;
            }
        }

        if (this.isKnockingBack) {
            this.velocityX = MathHelper.lerp(this.velocityX, 0, 0.05);

            if (Math.abs(this.velocityX) <= 0.1) {
                this.isKnockingBack = false;
                this.velocityX = 0;
            }
        }

        if (this.drowning) {
            this.damage(2);
            this.renderer.scale *= 0.975;
            this.posY += 0.5;
            this.posX += World.CLOUD_SPEED * 5;

            if (this.alpha > 0) {
                this.alpha -= 0.025;
                this.alpha = MathHelper.clamp(this.alpha, 0, 1);
            }
        } else {
            this._super();

            if (this.isFloating()) {
                this.drowning = true;

                AudioOut.playSfx('splash.wav', 1);

                this.say('Help!');

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

        if (!this.isPlayer() && !this.dead) {
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

            if (World.inEncounter) {
                if (this.attackingEntity != null) {
                    if (this.attackingEntity.dead) {
                        this.say("See you in hell!");
                        this.attackingEntity = null;
                    } else {
                        this.facingLeft = (this.attackingEntity.posX < this.posX);

                        var blockedSideways = (this.facingLeft && !this.canMoveLeft()) || (!this.facingLeft && !this.canMoveRight());
                        var targetIsBelow = this.attackingEntity.posY > this.posY;
                        var targetIsAbove = this.attackingEntity.posY < this.posY;

                        if ((targetIsAbove || blockedSideways) && !this.jumped) {
                            this.jump();
                        }

                        var dist = Math.abs(this.posX - this.attackingEntity.posX);

                        if (dist <= 48) {
                            if (chance.bool({ likelihood: 25 }) && !this.jumped) {
                                this.jump();
                            } else {
                                this.attack();
                            }
                        }

                        if (!this.isKnockingBack) {
                            if (dist >= 32 || blockedSideways || targetIsBelow) {
                                if (this.facingLeft) {
                                    this.velocityX = -this.movementSpeed;
                                } else {
                                    this.velocityX = +this.movementSpeed;
                                }
                            }
                        }


                    }
                } else {
                    // Seek a target
                    this.attackingEntity = this.getEnemyInRange();
                }
            }

            if (this.aiTimer > 0) {
                this.aiTimer--;
            } else {
                // Random chance: turn around
                if (chance.bool()) {
                    this.facingLeft = !this.facingLeft;
                    this.attack();
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

                // Random speech, sometimes
                if (this.isFriendly() && chance.bool({ likelihood: 25 }) && this.sayTimer == 0 && this.landed && !World.inEncounter) {
                    this.say(chance.pick(this.randomSpeech));
                }

                // Delay our next thought a bit
                this.aiTimer = chance.integer({
                    min: 60,
                    max: 600
                });

                if (World.inEncounter) {
                    this.aiTimer /= 2;
                }
            }
        }
    },

    die: function () {
        this._super();

        this.say('Godverdomme!');

        if (this.drowning) {
            World.remove(this);
        } else {
            if (!this.isPlayer() && this.isEnemy()) {
                var coin = new Coin(chance.integer({ min: 1, max: 10 }), this.posX, this.posY);
                World.add(coin);
            }
        }

        if (this.isPlayer() && !Game.isGameOver) {
            Game.gameOver();
        }

        if (this.isEnemy() && this.boat.getCrewAlive() == 0) {
            World.endEncounter();
        }
    }
});