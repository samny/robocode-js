import {degreesToRadians, radiansToDegrees, euclid_distance, in_rect} from './utils.js';
import {$SET_TIMEOUT, $BULLET_SPEED, $HP, $ROBOT_RADIUS, $MAX_BULLET, $BULLET_INTERVAL, $YELL_TIMEOUT, $SEQUENTIAL_EVENTS, $PARALLEL_EVENTS, $CANVAS_DEBUG} from './settings.js';
import {AssetsLoader} from './AssetsLoader.js';
import {Robot} from './Robot.js';

export class Battle {
    constructor(ctx, width, height, sources) {
        var robotAppearPosY, robotAppearPosXInc, robotAppearPosX, id, i$, len$, source, r;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.constructor.explosions = [];
        Robot.setBattlefield(this.width, this.height);
        robotAppearPosY = this.height / 2;
        robotAppearPosXInc = this.width / 3;
        robotAppearPosX = robotAppearPosXInc;
        id = 0;
        for (i$ = 0, len$ = sources.length; i$ < len$; ++i$) {
            source = sources[i$];
            r = new Robot(robotAppearPosX, robotAppearPosY, source);
            r.id = id;
            this.constructor.robots.push(r);
            id++;
            robotAppearPosX += robotAppearPosXInc;
            if (id >= 2) {
                robotAppearPosX = Math.random() * (this.width - 100 + 20);
            }
        }



        this.assets = new AssetsLoader({
            'body': 'body.png',
            'body-red': 'body-red.png',
            'turret': 'turret.png',
            'radar': 'radar.png',
            'explosion1-1': 'explosion/explosion1-1.png',
            'explosion1-2': 'explosion/explosion1-2.png',
            'explosion1-3': 'explosion/explosion1-3.png',
            'explosion1-4': 'explosion/explosion1-4.png',
            'explosion1-5': 'explosion/explosion1-5.png',
            'explosion1-6': 'explosion/explosion1-6.png',
            'explosion1-7': 'explosion/explosion1-7.png',
            'explosion1-8': 'explosion/explosion1-8.png',
            'explosion1-9': 'explosion/explosion1-9.png',
            'explosion1-10': 'explosion/explosion1-10.png',
            'explosion1-11': 'explosion/explosion1-11.png',
            'explosion1-12': 'explosion/explosion1-12.png',
            'explosion1-13': 'explosion/explosion1-13.png',
            'explosion1-14': 'explosion/explosion1-14.png',
            'explosion1-15': 'explosion/explosion1-15.png',
            'explosion1-16': 'explosion/explosion1-16.png',
            'explosion1-17': 'explosion/explosion1-17.png'
        }, ASSETS_BASE);
    }

    run() {

        this.send_all({
            'action': 'run'
        });
        return this._loop();
    }

    _loop() {
        var this$ = this;
        this._update();
        this._draw();
        if (this.constructor.enableDivDebug) {
            this._updateDebug();
        }
        return setTimeout(function() {
            return this$._loop();
        }, $SET_TIMEOUT);
    }

    send_all(msg_obj) {
        var i$, ref$, len$, robot, results$ = [];
        for (i$ = 0, len$ = (ref$ = this.constructor.robots).length; i$ < len$; ++i$) {
            robot = ref$[i$];
            results$.push(robot.send(msg_obj));
        }
        return results$;
    }

    _update() {
        var i$, ref$, len$, robot;
        for (i$ = 0, len$ = (ref$ = this.constructor.robots).length; i$ < len$; ++i$) {
            robot = ref$[i$];
            if (robot) {
                robot.update();
            }
        }
    }


    _updateDebug() {
        var text, i$, ref$, len$, robot, ev, me, bullet, enemySpot;
        text = '';
        for (i$ = 0, len$ = (ref$ = this.constructor.robots).length; i$ < len$; ++i$) {
            robot = ref$[i$];
            ev = JSON.stringify(robot.events, null, '\t');
            me = JSON.stringify(robot.me, null, '\t');
            bullet = JSON.stringify(robot.bullet, null, '\t');
            enemySpot = JSON.stringify(robot.enemySpot, null, '\t');
            text += (robot.id + ':\n') + ('me:\n' + me + '\n') + ('events:\n' + ev + '\nbullet:\n' + bullet + '\nenemy-spot:' + enemySpot + '\n');
        }
        document.getElementById('debug').innerHTML = text;
    }

    _draw() {
        var id, ref$, robot, body, textX, textY, text, i$, ref1$, len$, b, i, explosion;
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (id in ref$ = this.constructor.robots) {
            robot = ref$[id];
            body = 'body';

            if (robot.id === 0) {
                body = 'body-red';
            }
            if (robot.hp <= 0) {
                Battle.explosions.push({
                    x: robot.x,
                    y: robot.y,
                    progress: 1
                });
                robot = {};
                delete this.constructor.robots[id];
                this.constructor.robots.splice(id, 1);
                continue;
            }
            this.ctx.save();
            this.ctx.translate(robot.x, robot.y);
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            textX = 20;
            textY = 20;
            if (this.width - robot.x < 100) {
                textX = -textX;
                this.ctx.textAlign = 'right';
            }
            if (this.height - robot.y < 100) {
                textY = -textY;
            }
            text = robot.hp + '/' + $HP;
            if (robot.isYell && robot.yellTs < $YELL_TIMEOUT) {
                this.ctx.font = '17px Verdana';
                text = robot.yellMsg;
                robot.yellTs++;
            } else {
                robot.yellTs = 0;
                robot.isYell = false;
            }
            if ($CANVAS_DEBUG) {
                text += ' turret_angle' + robot.turret_angle;
            }
            this.ctx.fillText(text, textX, textY);
            this.ctx.rotate(degreesToRadians(robot.tank_angle));
            this.ctx.drawImage(this.assets.get(body), -(38 / 2), -(36 / 2), 38, 36);
            this.ctx.rotate(degreesToRadians(robot.turret_angle));
            this.ctx.drawImage(this.assets.get('turret'), -(54 / 2), -(20 / 2), 54, 20);
            this.ctx.rotate(degreesToRadians(robot.radar_angle));
            this.ctx.drawImage(this.assets.get('radar'), -(16 / 2), -(22 / 2), 16, 22);
            this.ctx.restore();
            if (robot.bullet.length > 0) {
                for (i$ = 0, len$ = (ref1$ = robot.bullet).length; i$ < len$; ++i$) {
                    b = ref1$[i$];
                    this.ctx.save();
                    this.ctx.translate(b.x, b.y);
                    this.ctx.rotate(degreesToRadians(b.direction));
                    this.ctx.fillRect(-3, -3, 6, 6);
                    this.ctx.restore();
                }
            }
        }
        for (i$ = 0, len$ = (ref$ = this.constructor.explosions).length; i$ < len$; ++i$) {
            i = ref$[i$];
            explosion = this.constructor.explosions.pop();
            if (explosion.progress <= 17) {
                this.ctx.drawImage(this.assets.get('explosion1-' + parseInt(explosion.progress)), explosion.x - 64, explosion.y - 64, 128, 128);
                explosion.progress += 1;
                this.constructor.explosions.unshift(explosion);
            }
        }
    }


}

Battle.displayName = 'Battle';
Battle.robots = [];
Battle.explosions = [];
Battle.enableDivDebug = false;
