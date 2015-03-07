/**
 * Helper class for syncing entities on the map.
 */
var Sync = {
    /**
     * Binds all sync opcodes to this class so we can handle it.
     */
    init: function () {
        Router.register(Opcodes.ENTITY_ADD, this.handleEntityAdd.bind(this));
        Router.register(Opcodes.ENTITY_LIST, this.handleEntityList.bind(this));
        Router.register(Opcodes.ENTITY_REMOVE, this.handleEntityRemove.bind(this));
        Router.register(Opcodes.SERVER_MOVE_UPDATE, this.handleEntityMove.bind(this));
        //Router.register(Opcodes.ENTITY_TELEPORT, this.handleEntityTeleport.bind(this));
        Router.register(Opcodes.SERVER_ATTACK, this.handleEntityAttack.bind(this));
        Router.register(Opcodes.DAMAGE_ENTITY, this.handleEntityDamage.bind(this));
    },

    /**
     * Reads and applies an entity damage event from the server.
     *
     * @param data Remote payload
     */
    handleEntityDamage: function (data) {
        if (Game.map == null || Game.loading) {
            return;
        }

        var entity = Game.map.getEntityById(data.i);

        if (entity == null) {
            return;
        }

        entity.applyDamage(data.d);
        entity.healthCurrent = data.c;
        entity.healthMax = data.m;

        if (entity.isLocalPlayer()) {
            Hud.updateHud();
        }
    },

    /**
     * Reads and applies an attack event from the server.
     *
     * @param data Remote payload
     */
    handleEntityAttack: function (data) {
        if (Game.map == null || Game.loading) {
            return;
        }

        var entity = Game.map.getEntityById(data.i);

        if (entity == null || entity.isLocalPlayer()) {
            return;
        }

        entity.doAttack();
    },

    /**
     * Reads and applies a movement update from the server.
     *
     * @param data Remote payload
     */
    handleEntityMove: function (data) {
        if (Game.map == null || Game.loading) {
            return;
        }

        var entity = Game.map.getEntityById(data.i);

        if (entity == null || entity.isLocalPlayer()) {
            return;
        }

        entity.targetPosX = data.x;
        entity.targetPosY = data.y;
        entity.moving = data.m;
        entity.targetRotation = data.r;
    },

    /**
     * Creates, or updates, an entity based on data received from the server.
     *
     * @param e The entity to mutate. Set to NULL to create a brand new entity.
     * @param remoteData The remote description / state of the entity.
     */
    configureEntity: function (e, remoteData) {
        var isNew = false;

        if (e == null) {
            e = new Entity();
            isNew = true;
        }

        e.id = remoteData.id;
        e.remoteUid = remoteData.uid;
        e.isPlayer = remoteData.ip == 1;
        e.isCharacter = e.isPlayer;
        e.causesCollision = true;
        e.receivesCollision = true;
        e.posX = remoteData.pX;
        e.posY = remoteData.pY;
        e.targetPosX = e.posX;
        e.targetPosY = e.posY;
        e.rotation = remoteData.pR;
        e.targetRotation = e.rotation;
        e.name = remoteData.nm;
        e.healthCurrent = remoteData.hc;
        e.healthMax = remoteData.hm;
        e.moving = remoteData.mv == 1;
        e.setWeapon(remoteData.wp);

        e.setLook(remoteData.oh, remoteData.ob);

        if (isNew) {
            Game.map.add(e);
        }

        if (e.isLocalPlayer()) {
            Hud.updateHud();
        }
    },

    /**
     * Adds one new entity to the map.
     *
     * @param data Remote payload
     */
    handleEntityAdd: function (data) {
        if (Game.map == null || Game.loading) {
            return;
        }

        this.configureEntity(null, data.e);
    },

    /**
     * Removes one entity from the map based on ID.
     *
     * @param data Remote payload
     */
    handleEntityRemove: function (data) {
        if (Game.map == null || Game.loading) {
            return;
        }

        var entity = Game.map.getEntityById(data.i);

        if (entity != null) {
            Game.map.remove(entity);
        }
    },

    /**
     * Resets the entire map and configures ALL entities.
     *
     * @param data Remote payload
     */
    handleEntityList: function (data) {
        if (Game.map == null) {
            return;
        }

        Game.map.clear();

        for (var i = 0; i < data.e.length; i++) {
            this.configureEntity(null, data.e[i]);
        }

        Game.onMapNetworkLoaded();
    }
};