'use strict';

importScripts('../BaseRobot.js');

class MyRobot extends BaseRobot {

    constructor() {
        super();
        console.log('Awesome');
        this.displayName = 'MyRobot';
    }

    onIdle() {
        this.move_forwards(150);
        this.turn_turret_left(10);
        this.turn_right(90);
    }

    onWallCollide() {
        this.move_opposide(10);
        this.turn_left(90);
    }

    onHit() {
        this.yell('Ouch!');
    }

    onEnemySpot() {
        this.yell('Fire!');
        this.shoot();
    }
}

var ts = new MyRobot('MyRobot');
