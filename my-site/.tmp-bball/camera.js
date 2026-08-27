"use strict";
// Fixed broadcast camera: high behind half court, looking down at the rim, so
// pushing "up" on the keys drives toward the hoop. Vertical structures keep
// their true perspective, which is what sells the 2K-style read of the floor.
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERTICAL = exports.SIN_PITCH = exports.COS_PITCH = exports.FOCAL = exports.CAM_PITCH = exports.CAM_HEIGHT = exports.CAM_Y = exports.SCREEN_CY = exports.SCREEN_CX = exports.SCREEN_H = exports.SCREEN_W = void 0;
exports.project = project;
exports.projectPolygon = projectPolygon;
exports.projectPath = projectPath;
exports.groundEllipse = groundEllipse;
exports.screenPan = screenPan;
exports.SCREEN_W = 1440;
exports.SCREEN_H = 900;
exports.SCREEN_CX = 720;
exports.SCREEN_CY = 493;
exports.CAM_Y = 130;
exports.CAM_HEIGHT = 52;
exports.CAM_PITCH = (24 * Math.PI) / 180;
exports.FOCAL = 2910;
exports.COS_PITCH = Math.cos(exports.CAM_PITCH);
exports.SIN_PITCH = Math.sin(exports.CAM_PITCH);
function project(x, y, z = 0) {
    const across = x;
    const dy = exports.CAM_Y - y;
    const dz = z - exports.CAM_HEIGHT;
    const depth = dy * exports.COS_PITCH - dz * exports.SIN_PITCH;
    const up = dy * exports.SIN_PITCH + dz * exports.COS_PITCH;
    const k = exports.FOCAL / Math.max(depth, 4);
    return {
        x: exports.SCREEN_CX + across * k,
        y: exports.SCREEN_CY - up * k,
        k,
        depth,
    };
}
function projectPolygon(points) {
    return points
        .map(([x, y, z]) => {
        const p = project(x, y, z ?? 0);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
        .join(" ");
}
function projectPath(points) {
    return points
        .map(([x, y, z], index) => {
        const p = project(x, y, z ?? 0);
        return `${index === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
        .join(" ");
}
/** A circle painted flat on the floor reads as an ellipse squashed by the pitch. */
function groundEllipse(radius, k) {
    return { rx: radius * k, ry: radius * k * exports.SIN_PITCH };
}
/**
 * Sprite art is drawn with vertical measurements pre-multiplied by this factor,
 * so a single uniform scale by `k` gives the correct foreshortening.
 */
exports.VERTICAL = exports.COS_PITCH;
function screenPan(ballX) {
    return Math.max(-70, Math.min(70, -ballX * 4.2));
}
