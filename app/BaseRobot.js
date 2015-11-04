/* Worker */

importScripts('../log.js');

class BaseRobot {
    constructor(name) {
        this.displayName = 'BaseRobot';
        this.me = {
            id: 0,
            x: 0,
            y: 0,
            hp: 0
        };
        this.enemySpot = [];

        this.name = name != null ? name : 'base-robot';
        this.event_counter = 0;
        this.callbacks = {};

        var this$ = this;
        self.onmessage = function(e) {
            return this$.receive(e.data);
        };
    }

    move_forwards(distance, callback) {
        callback == null && (callback = null);
        this.send({
            'action': 'move_forwards',
            'amount': distance
        }, callback);
    }


    move_backwards(distance, callback) {
        callback == null && (callback = null);
        this.send({
            'action': 'move_backwards',
            'amount': distance
        }, callback);
    }


    move_opposide(distance, callback) {
        callback == null && (callback = null);
        this.send({
            'action': 'move_opposide',
            'amount': distance
        }, callback);
    }


    turn_left(angle, callback) {
        callback == null && (callback = null);
        this.send({
            'action': 'turn_left',
            'amount': angle
        }, callback);
    }


    turn_right(angle, callback) {
        callback == null && (callback = null);
        this.send({
            'action': 'turn_right',
            'amount': angle
        }, callback);
    }


    turn_turret_left(angle, callback) {
        callback == null && (callback = null);
        this.send({
            'action': 'turn_turret_left',
            'amount': angle
        });
    }


    turn_turret_right(angle, callback) {
        callback == null && (callback = null);
        this.send({
            'action': 'turn_turret_right',
            'amount': angle
        });
    }


    shoot() {
        this.send({
            'action': 'shoot'
        });
    }


    yell(msg) {
        this.send({
            'action': 'yell',
            'msg': msg
        });
    }


    receive(msg) {
        var msg_obj;
        msg_obj = JSON.parse(msg);
        if (msg_obj.me) {
            this.me = msg_obj.me;
        }
        switch (msg_obj['action']) {
            case 'run':
                this._run();
                break;
            case 'callback':
                logger.log('callback');
                logger.log(this.event_counter);
                if (typeof this.callbacks[msg_obj['event_id']] === 'function') {
                    this.callbacks[msg_obj['event_id']]();
                }
                this.event_counter--;
                if (this.event_counter === 0) {
                    this._run();
                }
                break;
            case 'interruption':
                logger.log('interruption');
                logger.log(this.event_counter);
                this.event_counter = 0;
                if (msg_obj['status'].wallCollide) {
                    this.onWallCollide();
                }
                if (msg_obj['status'].isHit) {
                    this.onHit();
                }
                console.log('onhit-and-run');
                this._run();
                break;
            case 'enemy-spot':
                logger.log('enemy-spot');
                this.enemySpot = msg_obj['enemy-spot'];
                this.onEnemySpot();
        }
    }


    _run() {
        var this$ = this;
        logger.log(this.event_counter);
        console.log('run');
        setTimeout(function() {
            return this$.onIdle();
        }, 0);
    }


    onIdle() {
        throw 'You need to implement the onIdle() method';
    }


    onWallCollide() {
        throw 'You need to implement the onWallCollide() method';
    }


    onHit() {
    }


    onEnemySpot() {
    }


    send(msg_obj, callback) {
        var event_id;
        logger.log('send' + ' ' + msg_obj.action);
        event_id = this.event_counter++;
        this.callbacks[event_id] = callback;
        msg_obj['event_id'] = event_id;
        postMessage(JSON.stringify(msg_obj));
    }

}