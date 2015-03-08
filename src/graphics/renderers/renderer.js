var Renderer = Class.extend({
    entity: null,

    init: function (entity) {
        this.entity = entity;
    },

    getMap: function () {
        return this.entity.map;
    },

    rect: function (x, y) {
        return this.entity.getRect(x, y);
    },

    update: function () {
        // (Optionally, for animations, etc) To be implemented by children
    },

    draw: function (ctx, posX, posY) {
        // To be implemented by children
    }
});