var PlayerControls = {
    frameCountdown: 0,
    needsUpdate: false,

    FRAMES_PER_UPDATE: 5,

    update: function () {
        var player = Session.getEntity();

        if (player == null) {
            return;
        }

        var keyLeft = Keyboard.isKeyDown(KeyCode.LEFT) || Keyboard.isKeyDown(KeyCode.A);
        var keyRight = Keyboard.isKeyDown(KeyCode.RIGHT) || Keyboard.isKeyDown(KeyCode.D);
        var keyForward = Keyboard.isKeyDown(KeyCode.UP) || Keyboard.isKeyDown(KeyCode.W);
        var keyBackward = Keyboard.isKeyDown(KeyCode.DOWN) || Keyboard.isKeyDown(KeyCode.S);
        var keyAttack = Keyboard.wasKeyPressed(KeyCode.SPACE);

        if (!Chat.isActive) {
            if (keyLeft) {
                player.rotation -= player.speedRotate;
                this.needsUpdate = true;
            }
            if (keyRight) {
                player.rotation += player.speedRotate;
                this.needsUpdate = true;
            }
        }

        if (player.rotation < 0) {
            player.rotation += 360;
        }

        if (player.rotation > 360) {
            player.rotation -= 360;
        }

        player.targetPosX = player.posX;
        player.targetPosY = player.posY;
        player.targetRotation = player.rotation;

        if (keyForward && !Chat.isActive) {
            if (!player.moving && player.canMoveInCurrentDirection()) {
                player.moving = true;
                this.needsUpdate = true;
                this.frameCountdown = 0; // force sync b/c of state change
            }
        } else {
            if (player.moving) {
                player.moving = false;
                this.needsUpdate = true;
                this.frameCountdown = 0; // force sync b/c of state change
            }
        }

        if (keyAttack && player.weapon != null && player.attackAnimation <= 0) {
            player.doAttack();

            Net.sendData({
                op: Opcodes.CLIENT_ATTACK,
                i: player.id
            });
        }

        if (this.frameCountdown > 0) {
            // Do not send an update in this frame, only every 2 frames max
            this.frameCountdown--;
        } else if (this.needsUpdate) {
            // Need to send an update, something changed in our state in this or the last frame
            Net.sendData({
                op: Opcodes.CLIENT_MOVE_UPDATE,
                i: player.id,
                x: Math.round(player.posX),
                y: Math.round(player.posY),
                r: player.rotation,
                m: player.moving ? 1 : 0
            });

            this.needsUpdate = false;
            this.frameCountdown = this.FRAMES_PER_UPDATE;
        }
    }
};