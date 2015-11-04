'use strict';

var $ENABLE_DEBUG, console, logger;
$ENABLE_DEBUG = false;

if (!console) {
    console = {
        log: function(msg) {
            var data;
            data = {
                "log": msg
            };
            return postMessage(JSON.stringify(data));
        }
    };
}
logger = {};
logger.log = function(msg) {
    if ($ENABLE_DEBUG) {
        return console.log(msg);
    }
};