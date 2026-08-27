"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyInput = emptyInput;
function emptyInput() {
    return {
        moveX: 0,
        moveY: 0,
        sprint: false,
        shootHeld: false,
        shootPressed: false,
        shootReleased: false,
        actionPressed: false,
        startPressed: false,
    };
}
