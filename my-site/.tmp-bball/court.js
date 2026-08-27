"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distanceToHoop = distanceToHoop;
exports.isBehindArc = isBehindArc;
exports.shotValue = shotValue;
exports.clampToCourtX = clampToCourtX;
exports.clampToCourtY = clampToCourtY;
exports.arcPoints = arcPoints;
exports.threePointPoints = threePointPoints;
const constants_1 = require("./constants");
function distanceToHoop(x, y) {
    return Math.hypot(x - constants_1.HOOP_X, y - constants_1.HOOP_Y);
}
function isBehindArc(x, y) {
    if (Math.abs(x) >= constants_1.CORNER_X && y <= constants_1.CORNER_Y)
        return true;
    return distanceToHoop(x, y) >= constants_1.ARC_RADIUS;
}
function shotValue(x, y) {
    return isBehindArc(x, y) ? 2 : 1;
}
function clampToCourtX(x) {
    const limit = constants_1.COURT_HALF_WIDTH - constants_1.PLAYER_RADIUS;
    return Math.min(limit, Math.max(-limit, x));
}
function clampToCourtY(y) {
    return Math.min(constants_1.COURT_DEPTH - constants_1.PLAYER_RADIUS, Math.max(constants_1.PLAYER_RADIUS, y));
}
/** Points along a circle, in world coordinates, for rendering as a polyline. */
function arcPoints(cx, cy, radius, fromAngle, toAngle, steps = 40) {
    const points = [];
    for (let i = 0; i <= steps; i += 1) {
        const angle = fromAngle + ((toAngle - fromAngle) * i) / steps;
        points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
    return points;
}
/** The three point line: corner, sweep, corner. */
function threePointPoints(steps = 56) {
    const sweepStart = Math.atan2(constants_1.CORNER_Y - constants_1.HOOP_Y, -constants_1.CORNER_X);
    const sweepEnd = Math.atan2(constants_1.CORNER_Y - constants_1.HOOP_Y, constants_1.CORNER_X);
    return [
        [-constants_1.CORNER_X, 0],
        ...arcPoints(constants_1.HOOP_X, constants_1.HOOP_Y, constants_1.ARC_RADIUS, sweepStart, sweepEnd, steps),
        [constants_1.CORNER_X, 0],
    ];
}
