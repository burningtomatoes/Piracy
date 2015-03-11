$(document).ready(function() {
    console.log('%cArrr, matey! - Piracy Simulator 2015', 'background: #222; color: #bada55');
    console.log('%cwww.burningtomato.com / hello@burningtomato.com', 'background: #ff0000; color: #fff');

    Game.init();
    Game.start(Settings.TitleMap);
});