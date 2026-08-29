"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const server_1 = require("react-dom/server");
const node_fs_1 = require("node:fs");
const IsoBerkeleyCampus_1 = require("./src/components/scene/environments/IsoBerkeleyCampus");
function writeScene(file, transform) {
    const scene = (0, react_1.createElement)("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1440 900",
        width: 1440,
        height: 900,
    }, [
        (0, react_1.createElement)("rect", { key: "bg", width: 1440, height: 900, fill: "#F4EFE4" }),
        (0, react_1.createElement)("g", { key: "campus", transform }, (0, react_1.createElement)(IsoBerkeleyCampus_1.BerkeleyCampus, { reduceMotion: true })),
    ]);
    (0, node_fs_1.writeFileSync)(file, (0, server_1.renderToStaticMarkup)(scene));
}
writeScene("scratch-berkeley.svg", "translate(220 96) scale(0.6)");
writeScene("scratch-berkeley-spine.svg", "translate(48 -248) scale(1.18)");
console.log("wrote scratch-berkeley.svg and scratch-berkeley-spine.svg");
