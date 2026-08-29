import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { BerkeleyCampus } from "./src/components/scene/environments/IsoBerkeleyCampus";

function writeScene(file: string, transform: string) {
  const scene = h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1440 900",
      width: 1440,
      height: 900,
    },
    [
      h("rect", { key: "bg", width: 1440, height: 900, fill: "#F4EFE4" }),
      h("g", { key: "campus", transform }, h(BerkeleyCampus, { reduceMotion: true })),
    ],
  );

  writeFileSync(file, renderToStaticMarkup(scene));
}

writeScene("scratch-berkeley.svg", "translate(220 96) scale(0.6)");
writeScene("scratch-berkeley-spine.svg", "translate(48 -248) scale(1.18)");
console.log("wrote scratch-berkeley.svg and scratch-berkeley-spine.svg");
