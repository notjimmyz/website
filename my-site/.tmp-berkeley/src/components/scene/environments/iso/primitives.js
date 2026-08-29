"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsoBox = IsoBox;
exports.IsoSlab = IsoSlab;
exports.IsoGable = IsoGable;
exports.IsoCone = IsoCone;
exports.IsoTimber = IsoTimber;
exports.IsoWindows = IsoWindows;
exports.IsoFascia = IsoFascia;
exports.IsoTree = IsoTree;
exports.IsoCar = IsoCar;
exports.IsoPerson = IsoPerson;
exports.IsoLamp = IsoLamp;
exports.shade = shade;
const jsx_runtime_1 = require("react/jsx-runtime");
const project_1 = require("./project");
function IsoBox({ x, y, z = 0, w, d, h, top, left, right, }) {
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([
                    [x, y, z + h],
                    [x + w, y, z + h],
                    [x + w, y + d, z + h],
                    [x, y + d, z + h],
                ]), fill: top }), (0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([
                    [x, y + d, z + h],
                    [x + w, y + d, z + h],
                    [x + w, y + d, z],
                    [x, y + d, z],
                ]), fill: left }), (0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([
                    [x + w, y, z + h],
                    [x + w, y + d, z + h],
                    [x + w, y + d, z],
                    [x + w, y, z],
                ]), fill: right })] }));
}
function IsoSlab({ x, y, z = 0, w, d, h = 0.16, top, left, right, }) {
    return (0, jsx_runtime_1.jsx)(IsoBox, { x: x, y: y, z: z, w: w, d: d, h: h, top: top, left: left, right: right });
}
function IsoGable({ x, y, z, w, d, rise, left, right, }) {
    const mid = y + d / 2;
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([
                    [x, y, z],
                    [x + w, y, z],
                    [x + w, mid, z + rise],
                    [x, mid, z + rise],
                ]), fill: right }), (0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([
                    [x, y + d, z],
                    [x + w, y + d, z],
                    [x + w, mid, z + rise],
                    [x, mid, z + rise],
                ]), fill: left }), (0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([
                    [x + w, y, z],
                    [x + w, mid, z + rise],
                    [x + w, y + d, z],
                ]), fill: right })] }));
}
function IsoCone({ x, y, z, w, d, rise, left, right, }) {
    const peak = [x + w / 2, y + d / 2, z + rise];
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([peak, [x + w, y, z], [x + w, y + d, z]]), fill: right }), (0, jsx_runtime_1.jsx)("polygon", { points: (0, project_1.isoPoints)([peak, [x + w, y + d, z], [x, y + d, z]]), fill: left })] }));
}
function IsoTimber({ x, y, z = 0, w, d, h, fill = "#4A4038", }) {
    const p00 = (0, project_1.iso)(x, y + d, z + h);
    const p10 = (0, project_1.iso)(x + w, y + d, z + h);
    const p11 = (0, project_1.iso)(x + w, y + d, z);
    const p01 = (0, project_1.iso)(x, y + d, z);
    const strips = [
        [0.02, 0.98, 0.3, 0.36],
        [0.02, 0.98, 0.62, 0.68],
        [0.08, 0.14, 0.08, 0.92],
        [0.46, 0.54, 0.08, 0.92],
        [0.86, 0.92, 0.08, 0.92],
    ];
    return ((0, jsx_runtime_1.jsx)("g", { children: strips.map(([ua, ub, va, vb], index) => {
            const q0 = (0, project_1.bilerp)(p00, p10, p11, p01, ua, va);
            const q1 = (0, project_1.bilerp)(p00, p10, p11, p01, ub, va);
            const q2 = (0, project_1.bilerp)(p00, p10, p11, p01, ub, vb);
            const q3 = (0, project_1.bilerp)(p00, p10, p11, p01, ua, vb);
            return ((0, jsx_runtime_1.jsx)("polygon", { points: `${q0.x},${q0.y} ${q1.x},${q1.y} ${q2.x},${q2.y} ${q3.x},${q3.y}`, fill: fill }, index));
        }) }));
}
function IsoWindows({ face, x, y, z = 0, w, d, h, cols, rows, fill = "#D7E8F0", u0 = 0.12, u1 = 0.88, v0 = 0.1, v1 = 0.58, }) {
    const p00 = face === "left" ? (0, project_1.iso)(x, y + d, z + h) : (0, project_1.iso)(x + w, y, z + h);
    const p10 = face === "left" ? (0, project_1.iso)(x + w, y + d, z + h) : (0, project_1.iso)(x + w, y + d, z + h);
    const p11 = face === "left" ? (0, project_1.iso)(x + w, y + d, z) : (0, project_1.iso)(x + w, y + d, z);
    const p01 = face === "left" ? (0, project_1.iso)(x, y + d, z) : (0, project_1.iso)(x + w, y, z);
    const windows = [];
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const colSpan = (u1 - u0) / cols;
            const rowSpan = (v1 - v0) / rows;
            const ua = u0 + col * colSpan + colSpan * 0.16;
            const ub = u0 + col * colSpan + colSpan * 0.78;
            const va = v0 + row * rowSpan + rowSpan * 0.18;
            const vb = v0 + row * rowSpan + rowSpan * 0.82;
            const q0 = (0, project_1.bilerp)(p00, p10, p11, p01, ua, va);
            const q1 = (0, project_1.bilerp)(p00, p10, p11, p01, ub, va);
            const q2 = (0, project_1.bilerp)(p00, p10, p11, p01, ub, vb);
            const q3 = (0, project_1.bilerp)(p00, p10, p11, p01, ua, vb);
            windows.push((0, jsx_runtime_1.jsx)("polygon", { points: `${q0.x},${q0.y} ${q1.x},${q1.y} ${q2.x},${q2.y} ${q3.x},${q3.y}`, fill: fill }, `${face}-${row}-${col}`));
        }
    }
    return (0, jsx_runtime_1.jsx)("g", { children: windows });
}
function IsoFascia({ x, y, z = 0, w, d, h, fill, v0 = 0.68, }) {
    const p00 = (0, project_1.iso)(x, y + d, z + h);
    const p10 = (0, project_1.iso)(x + w, y + d, z + h);
    const p11 = (0, project_1.iso)(x + w, y + d, z);
    const p01 = (0, project_1.iso)(x, y + d, z);
    const a = (0, project_1.bilerp)(p00, p10, p11, p01, 0, v0);
    const b = (0, project_1.bilerp)(p00, p10, p11, p01, 1, v0);
    const c = (0, project_1.bilerp)(p00, p10, p11, p01, 1, 1);
    const e = (0, project_1.bilerp)(p00, p10, p11, p01, 0, 1);
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("polygon", { points: `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${e.x},${e.y}`, fill: fill }), (0, jsx_runtime_1.jsx)("polygon", { points: [
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.08, 0.74),
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.36, 0.74),
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.36, 0.96),
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.08, 0.96),
                ]
                    .map((point) => `${point.x},${point.y}`)
                    .join(" "), fill: "#D7E8F0" }), (0, jsx_runtime_1.jsx)("polygon", { points: [
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.78, 0.76),
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.9, 0.76),
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.9, 1),
                    (0, project_1.bilerp)(p00, p10, p11, p01, 0.78, 1),
                ]
                    .map((point) => `${point.x},${point.y}`)
                    .join(" "), fill: "#3A322C" })] }));
}
function IsoTree({ x, y, z = 0, canopy = "#8FCB8A", canopyDark = "#6FA86C", delay = "0s", reduceMotion = false, }) {
    const base = (0, project_1.iso)(x, y, z);
    const top = (0, project_1.iso)(x, y, z + 1.15);
    return ((0, jsx_runtime_1.jsxs)("g", { className: "iso-hover", style: { pointerEvents: "auto" }, children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: base.x, cy: base.y + 6, rx: "16", ry: "7", fill: "#C8BEB0", opacity: "0.35" }), (0, jsx_runtime_1.jsx)("rect", { x: base.x - 3, y: top.y + 10, width: "6", height: base.y - top.y - 6, fill: "#B08968" }), (0, jsx_runtime_1.jsxs)("g", { className: reduceMotion ? undefined : "iso-sway", style: { animationDelay: delay }, children: [(0, jsx_runtime_1.jsx)("circle", { cx: top.x, cy: top.y, r: "16", fill: canopy }), (0, jsx_runtime_1.jsx)("circle", { cx: top.x - 5, cy: top.y + 4, r: "10", fill: canopyDark, opacity: "0.45" })] })] }));
}
function IsoCar({ x, y, z = 0.18, color, cabin = "#F4F0E8", along = "x", }) {
    const w = along === "x" ? 0.78 : 0.42;
    const d = along === "x" ? 0.4 : 0.72;
    const left = shade(color, -18);
    const right = shade(color, -8);
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)(IsoBox, { x: x, y: y, z: z, w: w, d: d, h: 0.2, top: color, left: left, right: right }), (0, jsx_runtime_1.jsx)(IsoBox, { x: along === "x" ? x + 0.18 : x + 0.06, y: along === "x" ? y + 0.06 : y + 0.16, z: z + 0.2, w: along === "x" ? 0.38 : 0.3, d: along === "x" ? 0.28 : 0.36, h: 0.16, top: cabin, left: shade(cabin, -14), right: shade(cabin, -8) })] }));
}
function IsoPerson({ x, y, z = 0.16, fill, reduceMotion = false, delay = "0s", }) {
    const feet = (0, project_1.iso)(x, y, z);
    const head = (0, project_1.iso)(x, y, z + 0.72);
    return ((0, jsx_runtime_1.jsxs)("g", { className: reduceMotion ? undefined : "iso-bob", style: { animationDelay: delay }, children: [(0, jsx_runtime_1.jsx)("rect", { x: feet.x - 4, y: head.y + 8, width: "8", height: feet.y - head.y - 10, rx: "3", fill: fill }), (0, jsx_runtime_1.jsx)("circle", { cx: head.x, cy: head.y + 4, r: "5", fill: "#5C5048" })] }));
}
function IsoLamp({ x, y, z = 0.16 }) {
    return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)(IsoBox, { x: x, y: y, z: z, w: 0.08, d: 0.08, h: 1.35, top: "#6A645C", left: "#4E4A44", right: "#5C5852" }), (0, jsx_runtime_1.jsx)("circle", { cx: (0, project_1.iso)(x, y, z + 1.42).x, cy: (0, project_1.iso)(x, y, z + 1.42).y, r: "5", fill: "#E7A8C0" }), (0, jsx_runtime_1.jsx)("circle", { cx: (0, project_1.iso)(x + 0.12, y, z + 1.38).x, cy: (0, project_1.iso)(x + 0.12, y, z + 1.38).y, r: "4", fill: "#C9A8D4" })] }));
}
function shade(hex, amount) {
    const value = hex.replace("#", "");
    const num = Number.parseInt(value, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
