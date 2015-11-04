import {Battle} from './Battle.js';

window.triggerDebug = function() {
    if (Battle.enableDivDebug) {
        Battle.enableDivDebug = false;
        document.getElementById('debug').innerHTML = '';
    } else {
        Battle.enableDivDebug = true;
    }
    return true;
};

ASSETS_BASE = ASSETS_BASE || 'img/';
ROBOTS = ROBOTS || [];

var canvas = document.getElementById('arena');
var battle = new Battle(
    canvas.getContext('2d'),
    canvas.getAttribute('width'),
    canvas.getAttribute('height'),
    window.ROBOTS
);

battle.run();
