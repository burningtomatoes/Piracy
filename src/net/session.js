var Session = {
    authed: false,
    username: null,
    userId: null,

    setStateObject: function (state) {
        if (state == null) {
            this.authed = false;
            this.username = null;
            this.userId = null;
            return;
        }

        this.authed = true;
        this.username = state.username;
        this.userId = state.id;

        console.info('[Session] User authenticated as ' + this.username + ' (#' + this.userId + ')');
    },

    isLoggedIn: function () {
        return this.authed && this.userId != null && this.userId >= 0;
    },

    getEntity: function () {
        return Game.map == null ? null : Game.map.getEntityByUid(this.userId);
    }
};