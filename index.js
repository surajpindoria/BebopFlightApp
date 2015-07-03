// Trying to create a replacement flight control app for the Parrot Bebop drone
// Based on example app using Cylon.js to communicate with drone

var cylon = require("cylon");
var bebop = require("node-bebop");

var drone = bebop.createClient();

// Sensitivity controls for left/right sticks
var stickSensitivity = 0.2;
var maxSpeed = 0.5;

drone.connect(function() {
    cylon.start();
});

cylon.robot({
    connections: {
        joystick: { adaptor: "joystick" }
    },
    devices: {
        controller: { driver: "dualshock-3", connection: "joystick" }
    },
    work: function() {
        var that = this,
        rightStick = { x: 0.0, y: 0.0 },
        leftStick = { x: 0.0, y: 0.0 };

        // functions for each button press
        that.controller.on("square:press", function() {
            drone.takeOff();
        });

        that.controller.on("triangle:press", function() {
            drone.stop();
        });

        that.controller.on("x:press", function() {
            drone.land();
        });

        that.controller.on("right_x:move", function(data) {
            rightStick.x = data;
        });

        that.controller.on("right_y:move", function(data) {
            rightStick.y = data;
        });

        that.controller.on("left_x:move", function(data) {
            leftStick.x = data;
        });

        that.controller.on("left_y:move", function(data) {
            leftStick.y = data;
        });

        // set drone controls for the left stick
        setInterval(function() {
            var pair = leftStick;
            var curPos = 0;

            // move drone forward/backward
            if (pair.y < -(stickSensitivity)) {
                curPos = pair.y + stickSensitivity;

                drone.forward(validatePitch(curPos <= -(maxSpeed) ? -(maxSpeed) : curPos));
            } else if (pair.y > stickSensitivity) {
                curPos = pair.y - stickSensitivity;

                drone.backward(validatePitch(curPos >= maxSpeed ? maxSpeed : curPos));
            }

            // move drone left/right
            if (pair.x < -(stickSensitivity)) {
                curPos = pair.x + stickSensitivity;

                drone.left(validatePitch(curPos <= -(maxSpeed) ? -(maxSpeed) : curPos));
            } else if (pair.x > stickSensitivity) {
                curPos = pair.x - stickSensitivity;

                drone.right(validatePitch(curPos >= maxSpeed ? maxSpeed : curPos));
            }
        }, 0);

        // set drone controls for the right stick
        setInterval(function() {
            var pair = rightStick;
            var curPos = 0;

            // move dronw up/down
            if (pair.y < -(stickSensitivity)) {
                curPos = pair.y + stickSensitivity;

                drone.up(validatePitch(curPos <= -(maxSpeed) ? -(maxSpeed) : curPos));
            } else if (pair.y > stickSensitivity) {
                curPos = pair.y - stickSensitivity;

                drone.down(validatePitch(curPos <= maxSpeed ? maxSpeed : curPos));
            }

            // move drone clockwise/counterclockwise
            if (pair.x < -(stickSensitivity)) {
                curPos = pair.x + stickSensitivity;

                drone.counterClockwise(validatePitch(curPos >= -(maxSpeed) ? -(maxSpeed) : curPos));
            } else if (pair.x > stickSensitivity) {
                curPos = pair.x - stickSensitivity;

                drone.clockwise(validatePitch(curPos <= maxSpeed ? maxSpeed : curPos));
            }
        }, 0);

        setInterval(function() {
            drone.stop();
        }, 10);
    }
});

function validatePitch(data) {
    var value = Math.abs(data);
    if (value > 0.0) {
        if (value <= 1.0) {
            return Math.round(value * 100);
        } else {
            return 100;
        }
    } else {
        return 0;
    }
}
