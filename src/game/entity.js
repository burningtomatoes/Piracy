var Entity = Class.extend({
    isCharacter: false,
    isZombie: false,
    isPlayer: false,

    name: '???',

    causesCollision: true,
    receivesCollision: false,

    id: 0,
    remoteUid: 0,

    posX: 32,
    targetPosX: 32,
    posY: 32,
    targetPosY: 32,

    width: 24,
    height: 40,

    widthHead: 21,
    heightHead: 23,

    rotation: 0,
    targetRotation: 0,

    moving: false,
    running: false,

    speedWalking: 2,
    speedRunning: 4,
    speedRotate: 5,

    imgHead: null,
    imgBody: null,

    headBobTimer: 0,
    headBob: 0,

    weapon: null,
    weaponImg: null,

    attackAnimation: 0,

    init: function () {
        this.rotation = 270;

        this.setLook('1', '1');
    },

    setWeapon: function (id) {
        if (id == null) {
            this.weapon = null;
            this.weaponImg = null;
            return;
        }

        this.weapon = window.weapons[id];
        this.weaponImg = Game.images.load('wp_' + this.weapon.id + '.png');
    },

    setLook: function (head, body) {
        this.imgHead = Game.images.load('head_' + head + '.png');
        this.imgBody = Game.images.load('body_' + body + '.png');
    },

    update: function () {
        if (this.rotation < 0) {
            this.rotation += 360;
        }

        if (this.rotation > 360) {
            this.rotation -= 360;
        }

        if (!this.isLocalPlayer()) {
            if (this.rotation != this.targetRotation) {
                this.rotation = MathHelper.lerpAngle(this.rotation, this.targetRotation, 0.2);
            }

            if (this.posX != this.targetPosX) {
                this.posX = MathHelper.lerp(this.posX, this.targetPosX, 0.2);
            }

            if (this.posY != this.targetPosY) {
                this.posY = MathHelper.lerp(this.posY, this.targetPosY, 0.2);
            }
        }

        if (this.moving) {
            if (this.isLocalPlayer() && !this.canMoveInCurrentDirection()) {
                this.moving = false;
                PlayerControls.needsUpdate = true;
            } else {
                var mvSpeed = this.running ? this.speedRunning : this.speedWalking;

                var xChange = mvSpeed * Math.cos(this.targetRotation * Math.PI / 180);
                var yChange = mvSpeed * Math.sin(this.targetRotation * Math.PI / 180);

                this.posX += xChange;
                this.targetPosX += xChange;
                this.posY += yChange;
                this.targetPosY += yChange;
            }
        }

        if (this.moving) {
            if (this.headBobTimer > 0) {
                this.headBobTimer--;
            }

            if (this.headBobTimer <= 0) {
                this.headBob = (this.headBob == 1 ? -1 : 1);
                this.headBobTimer = 15;
            }
        } else {
            this.headBob = 0;
        }

        if (this.damageFlash > 0) {
            this.damageFlash--;
        }
    },

    draw: function (ctx) {
        if (this.damageFlash > 0) {
            if (this.isLocalPlayer()) {
                var grd = ctx.createRadialGradient(Canvas.canvas.width / 2, Canvas.canvas.height / 2, Canvas.canvas.height / 4, Canvas.canvas.width / 2, Canvas.canvas.height / 2, Canvas.canvas.height / 2);
                grd.addColorStop(0, "rgba(0, 0, 0, 0)");
                grd.addColorStop(1, "rgba(255, 0, 0, 0.2)");
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
            }

            return;
        }

        var destX = Camera.translateX(this.posX);
        var destY = Camera.translateY(this.posY);

        ctx.save();

        // Step 0: Translate to our on screen position
        ctx.translate(Camera.translateX(this.posX), Camera.translateY(this.posY));

        // Step 1: Translate to our center point and rotate to our desired rotation
        var centerX = this.width / 2;
        var centerY = this.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation * Math.PI / 180);

        // Step 2: De-translate
        ctx.translate(-centerX, -centerY);

        // Step 3: Draw entity
        if (this.weapon != null && this.weaponImg != null) {
            ctx.drawImage(this.weaponImg, 0, 0, this.weaponImg.width, this.weaponImg.height, 19, 3 + this.attackAnimation, this.weaponImg.width, this.weaponImg.height);
        }

        if (this.imgBody == null) {
            ctx.beginPath();
            ctx.rect(0, 0, this.width, this.height);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.closePath();
        } else {
            ctx.drawImage(this.imgBody, 0, 0, this.width, this.height, 0, Math.round(this.headBob / 2), this.width, this.height);
        }

        if (this.imgHead != null) {
            ctx.drawImage(this.imgHead, 0, 0, this.widthHead, this.heightHead, 6, Math.round((this.height / 2) - (this.heightHead / 2) - (this.headBob / 2)), this.widthHead, this.heightHead);
        }

        ctx.restore();

        if (Settings.drawCollisions) {
            var r = this.getRect();

            // Debug boundary
            ctx.beginPath();
            ctx.rect(Camera.translateX(r.left), Camera.translateY(r.top), r.width, r.height);
            ctx.strokeStyle = "#FFCCAA";
            ctx.stroke();
            ctx.closePath();

            // Debug projected pos
            var mvSpeed = this.speedWalking;
            var projectedX = this.posX + (mvSpeed * Math.cos(this.targetRotation * Math.PI / 180));
            var projectedY = this.posY + (mvSpeed * Math.sin(this.targetRotation * Math.PI / 180));
            var r = this.getRect(projectedX, projectedY);

            ctx.beginPath();
            ctx.rect(Camera.translateX(r.left), Camera.translateY(r.top), r.width, r.height);
            ctx.strokeStyle = "#AACCFF";
            ctx.stroke();
            ctx.closePath();
        }

        if (this.attackAnimation > 0) {
            this.attackAnimation--;
        }
    },

    drawName: function (ctx) {
        ctx.font="8px Pixelmix";

        var destX = Camera.translateX(this.posX);
        var destY = Camera.translateY(this.posY);

        destX += (this.width / 2) - (ctx.measureText(this.name).width / 2);
        destY -= 5;

        ctx.fillStyle = '#000';
        ctx.fillText(this.name, destX + 1, destY + 1);
        ctx.fillStyle = this.getNameColor();
        ctx.fillText(this.name, destX, destY);
    },

    getNameColor: function () {
        if (this.isLocalPlayer()) {
            return '#fff';
        }

        return 'yellow';
    },

    isLocalPlayer: function () {
        return this.isPlayer && Session.userId == this.remoteUid;
    },

    getRect: function (overrideX, overrideY) {
        var x = this.posX;
        var y = this.posY;

        if (overrideX != null) {
            x = overrideX;
        }

        if (overrideY != null) {
            y = overrideY;
        }

        var w = 32;
        var h = 32;

        var margin = 6;

        var rect = {
            left: x,
            top: y + 6,
            height: h - margin,
            width: w - margin
        };
        rect.bottom = rect.top + rect.height;
        rect.right = rect.left + rect.width;
        return rect;
    },

    doAttack: function () {
        if (!this.weapon.firearm) {
           this.attackAnimation = 10;
        }
    },

    canMoveInCurrentDirection: function () {
        var mvSpeed = this.speedWalking;
        var projectedX = this.posX + (mvSpeed * Math.cos(this.targetRotation * Math.PI / 180));
        var projectedY = this.posY + (mvSpeed * Math.sin(this.targetRotation * Math.PI / 180));

        if (projectedX < 0 || projectedY < 0 || projectedX > this.map.widthPx || projectedY > this.map.heightPx) {
            return false;
        }

        var projectedRect = this.getRect(projectedX, projectedY);

        if (this.map.isRectBlocked(projectedRect, this)) {
            return false;
        }

        return true;
    },

    applyDamage: function (dmg) {
        this.lastDamage = dmg;
        this.damageFlash = 6;
        this.healthCurrent -= dmg;
    }
});