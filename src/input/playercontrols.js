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

        // ATK ///////////////////////////////////////////////////////////////////////////////////////////////////////
        var keyAttack = Keyboard.wasKeyPressed(KeyCode.SPACE);

        if (keyAttack) {
            p.attack();
        }

        // MOVE //////////////////////////////////////////////////////////////////////////////////////////////////////
        var keyMoveUp       = Keyboard.isKeyDown(KeyCode.W) || Keyboard.isKeyDown(KeyCode.UP);
        var keyMoveLeft     = Keyboard.isKeyDown(KeyCode.A) || Keyboard.isKeyDown(KeyCode.LEFT);
        var keyMoveRight    = Keyboard.isKeyDown(KeyCode.D) || Keyboard.isKeyDown(KeyCode.RIGHT);

        if (keyMoveUp && p.canMoveUp()) {
           var ladderMode = World.anyLadders(p.getRect());

            if (ladderMode) {
                p.velocityY = -p.movementSpeed;
            } else if (p.landed) {
                p.jump();
                AudioOut.playSfx('jump.wav', 0.75);
            }
        }

        if (keyMoveLeft) {
            p.facingLeft = true;
        } else if (keyMoveRight) {
            p.facingLeft = false;
        }

        if (keyMoveLeft && p.canMoveLeft()) {
            p.facingLeft = true;

            p.velocityX -= p.movementSpeed;

            if (p.velocityX <= -p.movementSpeed) {
                p.velocityX = -p.movementSpeed;
            }

            didChange = true;
        }
        else if (keyMoveRight && p.canMoveRight()) {
            p.facingLeft = false;

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