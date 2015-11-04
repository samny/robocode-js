'use strict';

importScripts('../BaseRobot.js');

class Boss0 extends BaseRobot {
    constructor() {
        super();
    }

    onIdle() {
        this.turn_turret_right(45);
    }

    onWallCollide() {
    }

    onHit() {
        this.yell("Oops!");
    }

    onEnemySpot() {
        this.yell("Fire!");
        this.shoot();
    }


}
var tr = new Boss0("Boss 0");

