'use strict';

importScripts('../BaseRobot.js');

class Boss2 extends BaseRobot {
    constructor() {
        super();
    }

    onIdle() {
        this.shoot();
        this.move_forwards(50);
        this.move_backwards(50);
        this.turn_turret_right(180);
        this.shoot();
    }

    onWallCollide() {
        this.move_opposide(10);
        this.turn_left(90);
        this.move_forwards(100);
    }

    onHit() {
        this.yell("Oops!");
        this.move_backwards(100);
        this.shoot();
    }

    onEnemySpot() {
        this.yell("Fire!");
        this.shoot();
    }
}

var tr = new Boss2("Boss 2");