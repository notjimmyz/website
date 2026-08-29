"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORIGIN_Y = exports.ORIGIN_X = exports.TILE_H = exports.TILE_W = void 0;
exports.iso = iso;
exports.isoPoints = isoPoints;
exports.lerp = lerp;
exports.bilerp = bilerp;
exports.TILE_W = 12;
exports.TILE_H = 6;
exports.ORIGIN_X = 214;
exports.ORIGIN_Y = 392;
function iso(x, y, z = 0) {
    return {
        x: exports.ORIGIN_X + (x - y) * exports.TILE_W,
        y: exports.ORIGIN_Y + (x + y) * exports.TILE_H - z * exports.TILE_H * 2,
    };
}
function isoPoints(corners) {
    return corners
        .map(([x, y, z]) => {
        const point = iso(x, y, z);
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
        .join(" ");
}
function lerp(a, b, t) {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    };
}
function bilerp(p00, p10, p11, p01, u, v) {
    return lerp(lerp(p00, p10, u), lerp(p01, p11, u), v);
}
