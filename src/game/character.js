var Character = Entity.extend({
    doesFloat: true,
    affectedByGravity: true,

    init: function () {
        this.renderer = new CharacterRenderer
        (
            chance.integer({ min: 1, max: 6 }),
            chance.integer({ min: 1, max: 6 })
        )
    }
});