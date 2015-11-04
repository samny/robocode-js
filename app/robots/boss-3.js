'use strict';

importScripts('../BaseRobot.js');

class Boss3 extends BaseRobot {
    constructor() {
        super();
    }

    doSearch(){
        this.turn_turret_right(45);
        this.turn_right(15);
        this.move_forwards(25);
    }

    onIdle() {
        var myAngle, forward, tinyMove, tinyShoot, leftDist, rightDist;
        this.idleCount++;
        myAngle = this.me.angle % 360;
        if (this.myVarEnemy) {
            forward = false;
            tinyMove = Math.random() * 45;
            tinyShoot = Math.random() * 10;
            leftDist = myAngle + 360 - this.myVarEnemy[0].angle;
            if (leftDist > 360) {
                leftDist = leftDist - 360;
            }
            rightDist = this.myVarEnemy[0].angle - myAngle;
            if (rightDist < 0) {
                rightDist = 360 + rightDist;
            }
            if (leftDist !== rightDist) {
                if (Math.random() > 0.5) {
                    forward = true;
                }
                if (leftDist > rightDist) {
                    this.turn_turret_right(rightDist + 5 + tinyShoot);
                } else {
                    this.turn_turret_left(leftDist + 5 + tinyShoot);
                }
                if (forward) {
                    this.move_forwards(tinyMove);
                } else {
                    this.move_backwards(tinyMove);
                }
                this.shoot();
            } else {
                this.shoot();
            }
            this.myVarEnemy = undefined;
        } else {
            if (this.idleCount > 3) {
                this.doSearch();
                if (this.idleCount > 4) {
                    this.doSearch();
                    if (this.idleCount > 5) {
                        this.doSearch();
                    }
                }
                return;
            }
            this.turn_turret_left(30);
            this.turn_left(30);
            this.move_forwards(Math.random() * 50 + 10);
        }
    }

    onWallCollide() {
        this.move_opposide(10);
        this.turn_left(90);
        this.idleCount = 0;
    }

    onHit() {
        this.idleCount = 0;
        this.yell("No! I'm hit!");
    }

    onEnemySpot() {
        this.myVarEnemy = this.enemySpot;
        this.shoot();
        this.yell("Enemy spotted!");
        this.idleCount = 0;
    }
}

var tr = new Boss3("Boss 3");
