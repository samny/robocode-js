import {degreesToRadians, radiansToDegrees, euclid_distance, in_rect} from './utils.js';
import {$SET_TIMEOUT, $BULLET_SPEED, $HP, $ROBOT_RADIUS, $MAX_BULLET, $BULLET_INTERVAL, $YELL_TIMEOUT, $SEQUENTIAL_EVENTS, $PARALLEL_EVENTS, $CANVAS_DEBUG} from './settings.js';
import {Battle} from './Battle.js';
import './log.js';

export class Robot {
    constructor(x, y, source) {
        var this$ = this;
        this.x = x;
        this.y = y;
        this.source = source;
        this.tank_angle = Math.random() * 360;
        this.turret_angle = Math.random() * 360;
        this.radar_angle = Math.random() * 360;
        this.bullet = [];
        this.events = {};
        this.status = {};
        this.hp = $HP;
        this.id = 0;
        this.isHit = false;
        this.enemySpot = [];
        this.me = {};
        this.yellTs = 0;
        this.isYell = false;
        this.yellMsg = undefined;
        this.bulletTs = 0;
        this.worker = new Worker(source);
        this.worker.onmessage = function(e) {
            return this$.receive(e.data);
        };
    }

    move(distance) {
        var newX, newY;
        newX = this.x + distance * Math.cos(degreesToRadians(this.tank_angle));
        newY = this.y + distance * Math.sin(degreesToRadians(this.tank_angle));
        if (in_rect(newX, newY, 15, 15, this.constructor.battlefieldWidth - 15, this.constructor.battlefieldHeight - 15)) {
            logger.log('not-wall-collide');
            this.status.wallCollide = false;
            this.x = newX;
            return this.y = newY;
        } else {
            logger.log('wall-collide');
            return this.status.wallCollide = true;
        }
    }

    turn(degrees) {
        this.tank_angle += degrees;
        this.tank_angle = this.tank_angle % 360;
        if (this.tank_angle < 0) {
            this.tank_angle = this.tank_angle + 360;
        }
    }

    turnTurret(degrees) {
        this.turret_angle += degrees;
        this.turret_angle = this.turret_angle % 360;
        if (this.turret_angle < 0) {
            this.turret_angle = this.turret_angle + 360;
        }
    }

    yell(msg) {
        this.isYell = true;
        this.yellTs = 0;
        this.yellMsg = msg;
    }

    receive(msg) {
        var event, i$, ref$, len$, ev, event_id;
        event = JSON.parse(msg);
        if (event.log !== undefined) {
            logger.log(event.log);
            return;
        }
        if (event.action === 'shoot') {
            if (this.bullet.length >= $MAX_BULLET || this.bulletTs < $BULLET_INTERVAL) {
                this.sendCallback(event['event_id']);
                return;
            }
            this.bulletTs = 0;
            this.bullet.push({
                x: this.x,
                y: this.y,
                direction: this.tank_angle + this.turret_angle
            });
            this.sendCallback(event['event_id']);
            return;
        }
        if (event.action === 'turn_turret_left') {
            for (i$ = 0, len$ = (ref$ = this.events).length; i$ < len$; ++i$) {
                ev = ref$[i$];
                if (ev.action === 'turn_turret_left') {
                    this.sendCallback(event['event_id']);
                    return;
                }
            }
        }
        if (event.action === 'turn_turret_right') {
            for (i$ = 0, len$ = (ref$ = this.events).length; i$ < len$; ++i$) {
                ev = ref$[i$];
                if (ev.action === 'turn_turret_right') {
                    this.sendCallback(event['event_id']);
                    return;
                }
            }
        }
        if (event.action === 'yell') {
            if (this.yellTs === 0) {
                this.yell(event.msg);
            }
            this.sendCallback(event['event_id']);
            return;
        }
        event['progress'] = 0;
        event_id = event['event_id'];
        logger.log('got event ' + event_id + ',' + event.action);
        return this.events[event_id] = event;
    }

    send(msg_obj) {
        return this.worker.postMessage(JSON.stringify(msg_obj));
    }

    getEnemyRobots() {
        var enemy, i$, ref$, len$, r;
        enemy = [];
        for (i$ = 0, len$ = (ref$ = Battle.robots).length; i$ < len$; ++i$) {
            r = ref$[i$];
            if (r.id !== this.id) {
                enemy.push(r);
            }
        }
        return enemy;
    }

    sendEnemySpot() {
        logger.log('send-enemy-spot');
        return this.send({
            'action': 'enemy-spot',
            'me': this.me,
            'enemy-spot': this.enemySpot,
            'status': this.status
        });
    }

    sendInterruption() {
        logger.log('send-interruption');
        return this.send({
            'action': 'interruption',
            'me': this.me,
            'status': this.status
        });
    }

    sendCallback(event_id) {
        return this.send({
            'action': 'callback',
            'me': this.me,
            'event_id': event_id,
            'status': this.status
        });
    }

    checkEnemySpot() {
        var isSpot, i$, ref$, len$, enemyRobot, myAngle, myRadians, enemyPositionRadians, distance, radiansDiff, max, min, enemyPositionDegrees;
        this.enemySpot = [];
        isSpot = false;
        for (i$ = 0, len$ = (ref$ = this.getEnemyRobots()).length; i$ < len$; ++i$) {
            enemyRobot = ref$[i$];
            myAngle = (this.tank_angle + this.turret_angle) % 360;
            if (myAngle < 0) {
                myAngle = 360 + myAngle;
            }
            myRadians = degreesToRadians(myAngle);
            enemyPositionRadians = Math.atan2(enemyRobot.y - this.y, enemyRobot.x - this.x);
            distance = euclid_distance(this.x, this.y, enemyRobot.x, enemyRobot.y);
            radiansDiff = Math.atan2($ROBOT_RADIUS, distance);
            if (myRadians > Math.PI) {
                myRadians -= 2 * Math.PI;
            }
            if (myRadians < -Math.PI) {
                myRadians += 2 * Math.PI;
            }
            max = enemyPositionRadians + radiansDiff;
            min = enemyPositionRadians - radiansDiff;
            if (myRadians >= min && myRadians <= max) {
                enemyPositionDegrees = radiansToDegrees(enemyPositionRadians);
                if (enemyPositionDegrees < 0) {
                    enemyPositionDegrees = 360 + enemyPositionDegrees;
                }
                this.enemySpot.push({
                    id: enemyRobot.id,
                    angle: enemyPositionDegrees,
                    distance: distance,
                    hp: enemyRobot.hp,
                    x: enemyRobot.x,
                    y: enemyRobot.y
                });
                isSpot = true;
            }
        }
        if (isSpot) {
            return true;
        }
        return false;
    }

    updateBullet() {
        var id, ref$, b, bullet_wall_collide, i$, ref1$, len$, enemy_robot, robot_hit;
        for (id in ref$ = this.bullet) {
            b = ref$[id];
            b.x += $BULLET_SPEED * Math.cos(degreesToRadians(b.direction));
            b.y += $BULLET_SPEED * Math.sin(degreesToRadians(b.direction));
            bullet_wall_collide = !in_rect(b.x, b.y, 2, 2, this.constructor.battlefieldWidth - 2, this.constructor.battlefieldHeight - 2);
            if (bullet_wall_collide) {
                b = null;
                this.bullet.splice(id, 1);
                continue;
            }
            for (i$ = 0, len$ = (ref1$ = this.getEnemyRobots()).length; i$ < len$; ++i$) {
                enemy_robot = ref1$[i$];
                robot_hit = euclid_distance(b.x, b.y, enemy_robot.x, enemy_robot.y) < 20;
                if (robot_hit) {
                    enemy_robot.hp -= 3;
                    enemy_robot.isHit = true;
                    Battle.explosions.push({
                        x: enemy_robot.x,
                        y: enemy_robot.y,
                        progress: 1
                    });
                    b = null;
                    this.bullet.splice(id, 1);
                    break;
                }
            }
        }
        return true;
    }

    update() {
        var has_sequential_event, isTurningTurret, event_id, ref$, event;
        this.me = {
            angle: (this.tank_angle + this.turret_angle) % 360,
            tank_angle: this.tank_angle,
            turret_angle: this.turret_angle,
            id: this.id,
            x: this.x,
            y: this.y,
            hp: this.hp
        };

        has_sequential_event = false;
        this.status = {};
        isTurningTurret = false;
        if (this.bulletTs === Number.MAX_VALUE) {
            this.bulletTs = 0;
        } else {
            this.bulletTs++;
        }
        if (this.bullet.length > 0) {
            this.updateBullet();
        }
        if (this.isHit) {
            this.events = {};
            this.status.isHit = true;
            this.isHit = false;
            this.sendInterruption();
            return;
        }
        if (this.checkEnemySpot()) {
            this.sendEnemySpot();
        }
        for (event_id in ref$ = this.events) {
            event = ref$[event_id];
            if ($SEQUENTIAL_EVENTS.indexOf(event.action) !== -1) {
                if (has_sequential_event) {
                    continue;
                }
                has_sequential_event = true;
            }
            logger.log('events[' + event_id + '] = {action=' + event.action + ',progress=' + event.progress + '}');
            if (event['amount'] <= event['progress']) {
                this.sendCallback(event['event_id']);
                delete this.events[event_id];
            } else {
                switch (event['action']) {
                    case 'move_forwards':
                        event['progress']++;
                        this.move(1);
                        if (this.status.wallCollide) {
                            this.actionToCollide = 1;
                            this.events = {};
                            this.sendInterruption();
                            break;
                        }
                        break;
                    case 'move_backwards':
                        event['progress']++;
                        this.move(-1);
                        if (this.status.wallCollide) {
                            this.actionToCollide = -1;
                            this.events = {};
                            this.sendInterruption();
                            break;
                        }
                        break;
                    case 'move_opposide':
                        event['progress']++;
                        this.move(-this.actionToCollide);
                        if (this.status.wallCollide) {
                            this.actionToCollide = -this.actionToCollide;
                            this.events = {};
                            this.sendInterruption();
                            break;
                        }
                        break;
                    case 'turn_left':
                        event['progress']++;
                        this.turn(-1);
                        break;
                    case 'turn_right':
                        event['progress']++;
                        this.turn(1);
                        break;
                    case 'turn_turret_left':
                        if (isTurningTurret) {
                            continue;
                        }
                        event['progress']++;
                        this.turnTurret(-1);
                        isTurningTurret = true;
                        break;
                    case 'turn_turret_right':
                        if (isTurningTurret) {
                            continue;
                        }
                        event['progress']++;
                        this.turnTurret(1);
                        isTurningTurret = true;
                }
            }
        }
    }
}

Robot.displayName = 'Robot';
Robot.battlefieldWidth = 0;
Robot.battlefieldHeight = 0;
Robot.setBattlefield = function(width, height) {
    Robot.battlefieldWidth = width;
    return Robot.battlefieldHeight = height;
};