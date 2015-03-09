var PlayerControls = {
    update: function () {
        if (World.player == null) {
            return;
        }

        var p = World.player;

        if (p.dead) {
            return;
        }

        var didChange = false;

        // MOVE //////////////////////////////////////////////////////////////////////////////////////////////////////
        var keyMoveUp       = Keyboard.wasKeyPressed(KeyCode.W) || Keyboard.wasKeyPressed(KeyCode.UP);
        var keyMoveLeft     = Keyboard.isKeyDown(KeyCode.A) || Keyboard.isKeyDown(KeyCode.LEFT);
        var keyMoveRight    = Keyboard.isKeyDown(KeyCode.D) || Keyboard.isKeyDown(KeyCode.RIGHT);

        if (keyMoveUp && p.canMoveUp() && (p.landed || (p.jumped && !p.doubleJumped))) {
            p.velocityY -= p.jumpPower;

            if (p.velocityY <= -p.jumpPower) {
                p.velocityY = -p.jumpPower;
            }

            p.landed = false;

            if (p.jumped) {
                p.doubleJumped = true;
            }

            AudioOut.playSfx('jump.wav', 0.75);
            p.jumped = true;
        }

        if (keyMoveLeft && p.canMoveLeft()) {
            p.velocityX -= p.movementSpeed;

            if (p.velocityX <= -p.movementSpeed) {
                p.velocityX = -p.movementSpeed;
            }

            didChange = true;
        }
        else if (keyMoveRight && p.canMoveRight()) {
            p.velocityX += p.movementSpeed;

            if (p.velocityX >= p.movementSpeed) {
                p.velocityX = p.movementSpeed;
            }

            didChange = true;
        }
        else {
            if (p.velocityX != null) {
                p.velocityX = 0;
                didChange = true;
            }
        }
    }
};