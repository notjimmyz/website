// Grabs the prerendered court SVG and writes full-frame plus zoomed crops.
const fs = require("fs");
const { execFileSync } = require("child_process");

const html = fs.readFileSync(`${__dirname}/preview.html`, "utf8");
const match = html.match(/<svg[\s\S]*?<\/svg>/);
if (!match) {
  console.error("no svg in preview html");
  process.exit(1);
}

let svg = match[0];
if (!svg.includes("xmlns")) {
  svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
}

if (/NaN|Infinity/.test(svg)) {
  console.error("svg contains NaN or Infinity");
  process.exit(1);
}

const shots = [
  { name: "full", viewBox: "0 0 1440 900", w: 1440, h: 900 },
  { name: "hoop", viewBox: "480 110 520 340", w: 1300, h: 850 },
  { name: "key", viewBox: "460 330 620 380", w: 1300, h: 797 },
  { name: "near", viewBox: "0 600 1440 300", w: 1440, h: 300 },
];

for (const shot of shots) {
  const framed = svg
    .replace(/viewBox="[^"]*"/, `viewBox="${shot.viewBox}"`)
    .replace(/width="[^"]*"/, `width="${shot.w}"`)
    .replace(/height="[^"]*"/, `height="${shot.h}"`);

  const file = `${__dirname}/${shot.name}.svg`;
  fs.writeFileSync(file, framed);
  execFileSync("rsvg-convert", [
    "-w",
    String(shot.w),
    "-h",
    String(shot.h),
    file,
    "-o",
    `${__dirname}/${shot.name}.png`,
  ]);
  console.log(`wrote ${shot.name}.png (${shot.w}x${shot.h})`);
}
