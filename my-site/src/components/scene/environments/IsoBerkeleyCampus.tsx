import { iso, isoPoints, TILE_H, TILE_W } from "./iso/project";
import {
  IsoBox,
  IsoFascia,
  IsoGable,
  IsoLamp,
  IsoPerson,
  IsoSlab,
  IsoTree,
  IsoWindows,
} from "./iso/primitives";

const STONE = { top: "#EFE4D0", left: "#C8B49A", right: "#D8C8B0" };
const TILE = { top: "#C47868", left: "#A45C52", right: "#B46A5E" };
const BRICK = { top: "#E09A8C", left: "#C06E64", right: "#D28276" };
const MODERN = { top: "#E6E2DA", left: "#B4B0A8", right: "#CAC6BE" };
const SLATE = { top: "#8A6C70", left: "#5C464C", right: "#72585E" };
const GRASS = { top: "#C5E09A", left: "#8FB872", right: "#A4CC84" };
const GRASS_STRIPE = "#8FBF72";
const COURT = { top: "#6FCF8A", left: "#4EAE6C", right: "#5EBE7A" };
const PATH = { top: "#E8DFD0", left: "#C8BFB0", right: "#D8CFC0" };
const PLAZA = { top: "#E8DCC4", left: "#C8BCA4", right: "#D8CCB4" };
const ROAD = { top: "#D2CEC8", left: "#B4AFA8", right: "#C2BDB6" };
const WATER = { top: "#B4D6D2", left: "#84B4B0", right: "#9CC8C4" };
const TRACK = { top: "#E29484", left: "#C47468", right: "#D48478" };
const DIRT = { top: "#D8C49A", left: "#B8A47A", right: "#C8B48A" };
const WINDOW = "#4A423A";

/** North–south Sather Road. x east, y south. */
const SPINE_X = 29.4;
const SPINE_W = 7.4;
const SPINE_MID = SPINE_X + SPINE_W / 2;
const GATE_Y = 10.4;
const GATE_INNER = 3.35;
const DOE_Y = -4.55;
const DOE_D = 5.05;
const DOE_SOUTH = DOE_Y + DOE_D;

type Kind = "classic" | "modern" | "brick";
type Roof = "tile" | "flat" | "gable";
type Wing = { x: number; y: number; w: number; d: number; h?: number };

type HallSpec = {
  name: string;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  kind?: Kind;
  roof?: Roof;
  wings?: Wing[];
  label?: boolean;
  lx?: number;
  ly?: number;
  lz?: number;
  size?: number;
};

const HALLS: HallSpec[] = [
  // Northwest agriculture courtyard
  { name: "University House", x: 6.2, y: -29.8, w: 3.6, d: 2.5, h: 2.4, kind: "classic", roof: "gable" },
  { name: "Wellman Hall", x: 11.6, y: -29.8, w: 3.5, d: 2.4, h: 2.7, kind: "classic", roof: "tile" },
  { name: "Hilgard Hall", x: 6.2, y: -25.9, w: 3.6, d: 2.4, h: 2.65, kind: "classic", roof: "tile" },
  { name: "Giannini Hall", x: 11.6, y: -25.9, w: 3.4, d: 2.3, h: 2.55, kind: "classic", roof: "gable" },
  { name: "Mulford Hall", x: 6.2, y: -22.1, w: 3.6, d: 2.3, h: 2.5, kind: "classic", roof: "tile" },
  { name: "Genetics", x: 11.6, y: -22.1, w: 3.4, d: 2.2, h: 2.45, kind: "modern", roof: "flat" },
  { name: "Koshland Hall", x: 6.2, y: -18.4, w: 3.7, d: 2.5, h: 3.05, kind: "modern", roof: "flat" },
  { name: "Morgan Hall", x: 11.6, y: -18.4, w: 3.4, d: 2.3, h: 2.4, kind: "classic", roof: "tile" },
  { name: "Natural Resources", x: 16.4, y: -22.0, w: 2.6, d: 2.0, h: 2.15, kind: "modern", roof: "flat", size: 7.5 },

  // West biosciences — Li Ka Shing is on Oxford, not by the stadium
  { name: "Barker Hall", x: 6.2, y: -14.5, w: 3.6, d: 2.4, h: 2.85, kind: "modern", roof: "flat" },
  { name: "Energy Biosciences", x: 11.6, y: -14.5, w: 3.3, d: 2.3, h: 2.45, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Li Ka Shing", x: 6.2, y: -10.6, w: 4.2, d: 2.7, h: 3.15, kind: "modern", roof: "flat" },
  { name: "Haviland Hall", x: 16.8, y: -20.4, w: 2.9, d: 2.3, h: 2.45, kind: "classic", roof: "gable" },
  {
    name: "VLSB",
    x: 6.2,
    y: -6.4,
    w: 9.6,
    d: 3.5,
    h: 3.45,
    kind: "classic",
    roof: "tile",
    wings: [
      { x: 6.2, y: -2.7, w: 3.6, d: 2.9, h: 3.2 },
      { x: 12.2, y: -2.7, w: 3.6, d: 2.9, h: 3.2 },
    ],
  },
  { name: "Weill Hall", x: 6.2, y: 0.5, w: 4.4, d: 2.3, h: 2.55, kind: "modern", roof: "flat" },

  // Engineering along Hearst — a long strip, not stacked on the glade
  { name: "Soda Hall", x: 18.6, y: -30.7, w: 3.5, d: 2.4, h: 3.55, kind: "modern", roof: "flat" },
  { name: "Cory Hall", x: 23.5, y: -30.8, w: 3.7, d: 2.5, h: 3.25, kind: "modern", roof: "flat" },
  { name: "Sutardja Dai", x: 28.6, y: -30.7, w: 3.4, d: 2.4, h: 3.4, kind: "modern", roof: "flat" },
  { name: "Jacobs Hall", x: 33.4, y: -30.7, w: 3.3, d: 2.4, h: 2.95, kind: "modern", roof: "flat" },
  { name: "Hesse Hall", x: 38.1, y: -30.6, w: 2.7, d: 2.1, h: 2.35, kind: "classic", roof: "gable" },
  { name: "Hearst Mining", x: 42.2, y: -30.7, w: 4.4, d: 2.6, h: 3.2, kind: "classic", roof: "gable" },
  { name: "North Gate Hall", x: 48.2, y: -30.5, w: 2.7, d: 2.1, h: 2.25, kind: "classic", roof: "gable", size: 7.5 },
  { name: "Donner Lab", x: 52.3, y: -30.6, w: 2.6, d: 2.0, h: 2.55, kind: "modern", roof: "flat" },
  { name: "Goldman School", x: 47.8, y: -33.8, w: 3.1, d: 1.9, h: 2.65, kind: "brick", roof: "gable", size: 7.5 },
  { name: "Bechtel Center", x: 18.7, y: -26.8, w: 3.4, d: 2.3, h: 2.45, kind: "modern", roof: "flat" },
  { name: "Davis Hall", x: 23.5, y: -26.9, w: 3.6, d: 2.3, h: 3.15, kind: "modern", roof: "flat" },
  { name: "McLaughlin Hall", x: 28.5, y: -26.7, w: 3.1, d: 2.2, h: 2.7, kind: "classic", roof: "tile" },
  { name: "O'Brien Hall", x: 33.0, y: -26.8, w: 3.0, d: 2.2, h: 2.55, kind: "classic", roof: "tile" },
  { name: "Etcheverry Hall", x: 38.0, y: -26.9, w: 3.4, d: 2.3, h: 3.35, kind: "modern", roof: "flat" },
  { name: "McCone Hall", x: 42.8, y: -26.6, w: 3.6, d: 2.4, h: 3.05, kind: "modern", roof: "flat" },
  { name: "Blum Hall", x: 48.2, y: -26.6, w: 2.7, d: 2.1, h: 2.55, kind: "modern", roof: "flat" },

  // Mining Circle science
  { name: "Pimentel Hall", x: 38.6, y: -22.4, w: 3.1, d: 2.3, h: 2.45, kind: "modern", roof: "flat" },
  { name: "Campbell Hall", x: 43.2, y: -22.2, w: 3.3, d: 2.4, h: 2.85, kind: "modern", roof: "flat" },
  { name: "Birge Hall", x: 46.4, y: -14.6, w: 3.1, d: 2.4, h: 2.65, kind: "classic", roof: "tile" },
  { name: "Stanley Hall", x: 53.4, y: -17.8, w: 3.7, d: 2.5, h: 3.55, kind: "modern", roof: "flat" },

  // Glade and Doe — path runs into the south face; glade is north
  { name: "Moffitt Library", x: 16.6, y: -16.6, w: 6.0, d: 2.7, h: 2.35, kind: "modern", roof: "flat" },
  { name: "Evans Hall", x: 41.2, y: -16.8, w: 3.7, d: 2.6, h: 5.45, kind: "modern", roof: "flat" },
  { name: "California Hall", x: 19.8, y: -3.0, w: 5.6, d: 2.2, h: 2.55, kind: "classic", roof: "gable" },
  {
    name: "Doe Library",
    x: 27.8,
    y: DOE_Y,
    w: 10.6,
    d: DOE_D,
    h: 3.45,
    kind: "classic",
    roof: "gable",
    wings: [{ x: 30.0, y: DOE_Y, w: 6.2, d: 1.75, h: 3.95 }],
  },
  { name: "Bancroft Library", x: 38.5, y: DOE_Y + 0.15, w: 3.6, d: 4.7, h: 2.85, kind: "classic", roof: "tile", size: 7.5 },
  { name: "East Asian Library", x: 38.8, y: -10.2, w: 3.2, d: 2.6, h: 2.95, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Durant Hall", x: 24.8, y: 0.62, w: 4.4, d: 1.75, h: 2.45, kind: "classic", roof: "gable" },
  { name: "South Hall", x: 43.5, y: 3.15, w: 2.5, d: 2.15, h: 2.35, kind: "brick", roof: "gable" },

  // Physics and chemistry east of the Campanile
  { name: "Physics North", x: 46.2, y: -10.8, w: 3.5, d: 2.5, h: 3.15, kind: "classic", roof: "tile" },
  { name: "Physics South", x: 46.2, y: -7.0, w: 3.5, d: 2.4, h: 3.05, kind: "classic", roof: "tile" },
  { name: "Latimer Hall", x: 51.6, y: -10.8, w: 3.4, d: 2.5, h: 3.05, kind: "classic", roof: "tile" },
  { name: "Tan Hall", x: 56.6, y: -10.9, w: 2.9, d: 2.3, h: 2.7, kind: "modern", roof: "flat" },
  { name: "Gilman Hall", x: 46.8, y: -3.0, w: 3.1, d: 2.3, h: 2.75, kind: "classic", roof: "gable" },
  { name: "Hildebrand Hall", x: 51.8, y: -3.2, w: 3.2, d: 2.4, h: 2.9, kind: "classic", roof: "tile" },
  { name: "Lewis Hall", x: 56.8, y: -3.4, w: 2.8, d: 2.2, h: 2.5, kind: "classic", roof: "tile" },
  { name: "Giauque Hall", x: 51.6, y: 0.5, w: 2.4, d: 1.7, h: 2.15, kind: "classic", roof: "tile", size: 7.5 },
  { name: "Faculty Club", x: 47.2, y: 0.55, w: 3.1, d: 2.2, h: 2.25, kind: "classic", roof: "gable" },
  { name: "Senior Hall", x: 40.6, y: 0.42, w: 1.9, d: 1.55, h: 1.65, kind: "brick", roof: "gable", size: 7.5 },
  { name: "Women's Faculty Club", x: 57.0, y: 0.4, w: 2.5, d: 2.0, h: 2.15, kind: "classic", roof: "gable", size: 7.5 },

  // West of Sather Road
  {
    name: "Dwinelle Hall",
    x: 16.4,
    y: 2.4,
    w: 12.4,
    d: 2.65,
    h: 3.15,
    kind: "classic",
    roof: "tile",
    wings: [
      { x: 16.4, y: 5.2, w: 3.5, d: 4.55, h: 2.95 },
      { x: 25.2, y: 5.2, w: 3.8, d: 4.35, h: 2.95 },
    ],
  },
  { name: "Dwinelle Annex", x: 16.2, y: 10.1, w: 2.7, d: 1.7, h: 1.85, kind: "classic", roof: "gable", size: 7.5 },
  { name: "Barrows Hall", x: 19.4, y: 10.0, w: 3.2, d: 1.9, h: 3.55, kind: "modern", roof: "flat" },
  { name: "Social Sciences", x: 50.2, y: -6.45, w: 2.45, d: 2.1, h: 4.15, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Wheeler Hall", x: 37.3, y: 2.4, w: 5.7, d: 3.85, h: 3.25, kind: "classic", roof: "gable" },
  { name: "Stephens Hall", x: 43.4, y: -0.15, w: 3.2, d: 2.5, h: 2.65, kind: "classic", roof: "tile" },
  { name: "Philosophy Hall", x: 43.6, y: 6.55, w: 2.5, d: 2.05, h: 2.35, kind: "classic", roof: "tile", size: 7.5 },
  { name: "Moses Hall", x: 46.6, y: 2.2, w: 2.45, d: 2.0, h: 2.35, kind: "classic", roof: "gable" },
  { name: "Anthony Hall", x: 37.4, y: 6.8, w: 2.2, d: 1.7, h: 2.15, kind: "classic", roof: "tile" },
  { name: "Old Art Gallery", x: 40.6, y: 7.15, w: 2.0, d: 1.5, h: 1.85, kind: "classic", roof: "tile", size: 7.5 },

  // Music and gym
  { name: "Hertz Hall", x: 44.0, y: 8.7, w: 2.5, d: 2.25, h: 2.35, kind: "classic", roof: "tile" },
  { name: "Morrison Hall", x: 48.2, y: 7.8, w: 2.7, d: 2.0, h: 2.25, kind: "classic", roof: "tile", size: 7.5 },
  { name: "Hargrove Music", x: 52.4, y: 7.8, w: 2.7, d: 2.0, h: 2.15, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Hearst Gym", x: 48.4, y: 3.5, w: 5.4, d: 3.5, h: 2.15, kind: "classic", roof: "tile" },
  { name: "Woo Hon Fai", x: 55.2, y: 3.5, w: 2.6, d: 2.3, h: 2.45, kind: "modern", roof: "flat", size: 7.5 },

  // Sproul
  { name: "Sproul Hall", x: 37.3, y: 11.5, w: 5.3, d: 4.9, h: 4.45, kind: "classic", roof: "tile" },
  { name: "Alumni House", x: 14.8, y: 12.35, w: 2.9, d: 2.2, h: 2.15, kind: "classic", roof: "gable" },
  { name: "Zellerbach Hall", x: 17.2, y: 16.4, w: 4.7, d: 3.3, h: 2.75, kind: "modern", roof: "flat" },
  { name: "Zellerbach Playhouse", x: 17.2, y: 20.6, w: 2.9, d: 1.9, h: 1.95, kind: "modern", roof: "flat", size: 7.5 },
  { name: "MLK Student Union", x: 23.0, y: 16.5, w: 4.1, d: 3.0, h: 2.45, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Eshleman Hall", x: 28.2, y: 18.65, w: 3.5, d: 2.7, h: 2.85, kind: "modern", roof: "flat" },
  { name: "Cesar Chavez", x: 22.2, y: 12.05, w: 6.8, d: 3.4, h: 2.35, kind: "modern", roof: "flat" },
  { name: "A&E", x: 37.3, y: 9.15, w: 2.9, d: 1.85, h: 1.95, kind: "modern", roof: "flat", size: 7.5 },

  // Southwest athletics
  { name: "Rec Sports", x: 6.2, y: 4.2, w: 4.0, d: 2.3, h: 2.25, kind: "modern", roof: "flat" },
  { name: "Haas Pavilion", x: 6.2, y: 8.8, w: 5.8, d: 3.5, h: 2.65, kind: "modern", roof: "flat" },
  { name: "Kleeberger", x: 14.0, y: 18.8, w: 2.3, d: 1.7, h: 1.85, kind: "modern", roof: "flat", size: 7.5 },

  // Southeast schools
  { name: "Kroeber Hall", x: 38.6, y: 16.85, w: 2.8, d: 2.5, h: 2.55, kind: "classic", roof: "tile" },
  { name: "Anthropology", x: 38.4, y: 20.2, w: 3.0, d: 2.2, h: 2.45, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Bauer Wurster", x: 42.8, y: 16.3, w: 4.1, d: 3.2, h: 4.05, kind: "modern", roof: "flat" },
  { name: "Minor Hall", x: 44.4, y: 11.6, w: 2.7, d: 2.1, h: 2.45, kind: "classic", roof: "tile" },
  { name: "Minor Addition", x: 44.4, y: 14.1, w: 2.7, d: 1.9, h: 2.25, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Hearst Field Annex", x: 49.0, y: 14.0, w: 3.1, d: 1.9, h: 1.65, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Berkeley Law", x: 50.6, y: 16.8, w: 4.5, d: 3.2, h: 3.15, kind: "modern", roof: "flat" },
  { name: "Simon Hall", x: 57.6, y: 15.8, w: 3.3, d: 2.6, h: 2.75, kind: "modern", roof: "flat" },
  { name: "Cheit Hall", x: 52.6, y: 10.8, w: 3.4, d: 2.4, h: 2.65, kind: "modern", roof: "flat" },
  { name: "Chou Hall", x: 57.6, y: 8.2, w: 3.0, d: 2.3, h: 2.85, kind: "modern", roof: "flat" },
  { name: "Haas School", x: 57.4, y: 11.2, w: 5.1, d: 3.5, h: 3.05, kind: "modern", roof: "flat" },
  { name: "Calvin Lab", x: 66.6, y: 12.2, w: 2.6, d: 2.1, h: 2.35, kind: "modern", roof: "flat", size: 7.5 },
  { name: "International House", x: 63.4, y: 8.0, w: 3.6, d: 2.7, h: 2.85, kind: "brick", roof: "gable", size: 7.5 },

  // East housing — a chain up the hill, not one box
  { name: "Bowles Hall", x: 64.6, y: -25.4, w: 3.1, d: 2.4, h: 3.15, kind: "brick", roof: "gable" },
  { name: "Stern Hall", x: 68.0, y: -21.6, w: 3.2, d: 2.3, h: 2.75, kind: "brick", roof: "gable" },
  { name: "Foothill", x: 71.4, y: -26.2, w: 3.4, d: 2.5, h: 2.55, kind: "modern", roof: "flat" },
  { name: "Foothill Court", x: 74.4, y: -23.4, w: 2.9, d: 2.2, h: 2.35, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Foothill Dining", x: 71.6, y: -22.8, w: 2.8, d: 2.1, h: 2.15, kind: "modern", roof: "flat", size: 7.5 },
  { name: "Simpson Center", x: 73.6, y: -10.6, w: 3.2, d: 2.4, h: 2.45, kind: "modern", roof: "flat", size: 7.5 },
];

const FILLERS: HallSpec[] = [
  { name: "eng-a", x: 21.2, y: -23.6, w: 2.2, d: 1.7, h: 1.85, kind: "modern", roof: "flat", label: false },
  { name: "eng-b", x: 26.4, y: -23.5, w: 2.3, d: 1.7, h: 1.95, kind: "modern", roof: "flat", label: false },
  { name: "eng-c", x: 31.6, y: -23.6, w: 2.1, d: 1.6, h: 1.75, kind: "classic", roof: "tile", label: false },
  { name: "eng-d", x: 36.4, y: -23.4, w: 2.0, d: 1.6, h: 1.85, kind: "modern", roof: "flat", label: false },
  { name: "chem-a", x: 54.0, y: -14.2, w: 2.2, d: 1.8, h: 2.05, kind: "modern", roof: "flat", label: false },
  { name: "chem-b", x: 58.6, y: -7.4, w: 2.0, d: 1.7, h: 1.95, kind: "classic", roof: "tile", label: false },
  { name: "annex-a", x: 49.2, y: 17.2, w: 1.9, d: 1.5, h: 1.55, kind: "modern", roof: "flat", label: false },
  { name: "annex-b", x: 52.8, y: 21.2, w: 2.1, d: 1.6, h: 1.65, kind: "modern", roof: "flat", label: false },
  { name: "annex-c", x: 33.4, y: 20.6, w: 2.2, d: 1.6, h: 1.75, kind: "modern", roof: "flat", label: false },
  { name: "west-a", x: 12.0, y: -10.8, w: 2.4, d: 1.8, h: 2.05, kind: "modern", roof: "flat", label: false },
  { name: "west-b", x: 16.6, y: -7.2, w: 2.1, d: 1.7, h: 1.85, kind: "classic", roof: "gable", label: false },
  { name: "heat-plant", x: 13.2, y: 7.6, w: 2.4, d: 1.8, h: 1.65, kind: "brick", roof: "flat", label: false },
  { name: "park-a", x: 18.8, y: -28.4, w: 3.4, d: 1.4, h: 0.85, kind: "modern", roof: "flat", label: false },
  { name: "park-b", x: 48.8, y: -24.2, w: 3.2, d: 1.5, h: 0.9, kind: "modern", roof: "flat", label: false },
  { name: "opt-a", x: 47.4, y: 12.8, w: 2.0, d: 1.6, h: 1.85, kind: "classic", roof: "tile", label: false },
  { name: "law-a", x: 55.6, y: 20.4, w: 2.3, d: 1.7, h: 1.95, kind: "modern", roof: "flat", label: false },
  { name: "ag-a", x: 16.4, y: -18.6, w: 2.0, d: 1.6, h: 1.75, kind: "classic", roof: "tile", label: false },
  { name: "ag-b", x: 16.6, y: -25.8, w: 2.1, d: 1.7, h: 1.85, kind: "classic", roof: "gable", label: false },
];

export function BerkeleyCampus({ reduceMotion }: { reduceMotion: boolean }) {
  const halls = [...HALLS, ...FILLERS].sort((a, b) => a.x + a.y - (b.x + b.y));

  return (
    <g data-landmark="uc-berkeley">
      <CampusGround />
      <Hills reduceMotion={reduceMotion} />
      <GreekTheatre />
      <MemorialStadium />
      <MaxwellField />
      <GoldmanField />
      <EdwardsTrack />
      <EvansDiamond />
      <SpiekerPool />
      <HellmanTennis />
      <FoundersRock />
      {halls.map((hall) => (
        <Hall key={hall.name} {...hall} />
      ))}
      <Campanile />
      <SatherGate />
      <LudwigsFountain />
      <Trees reduceMotion={reduceMotion} />
      <Life reduceMotion={reduceMotion} />
      <Labels />
    </g>
  );
}

function CampusGround() {
  return (
    <g data-layer="ground">
      <IsoSlab x={5.4} y={-34.2} w={50.0} d={18.4} h={0.08} {...GRASS} />
      <IsoSlab x={18.4} y={-16.4} w={28.0} d={22.0} h={0.08} {...GRASS} />
      <IsoSlab x={5.6} y={-16.0} w={16.0} d={30.4} h={0.08} {...GRASS} />
      <IsoSlab x={28.0} y={5.4} w={32.0} d={18.6} h={0.08} {...GRASS} />
      <IsoSlab x={54.0} y={-28.0} w={24.0} d={38.0} h={0.08} {...GRASS} />
      <IsoSlab x={4.2} y={-34.4} w={1.15} d={62.4} h={0.14} {...ROAD} />
      <IsoSlab x={5.2} y={-32.15} w={52.4} d={0.9} h={0.14} {...ROAD} />
      <IsoSlab x={5.2} y={26.35} w={52.0} d={0.9} h={0.14} {...ROAD} />
      <IsoSlab x={75.4} y={-22.0} w={1.1} d={34.0} h={0.14} {...ROAD} />
      <NamedLawn x={22.0} y={-16.5} w={19.2} d={11.6} stripes={16} />
      <NamedLawn x={44.6} y={-1.55} w={3.1} d={2.3} stripes={4} />
      <NamedLawn x={54.6} y={5.2} w={3.0} d={1.8} stripes={3} />
      <NamedLawn x={20.1} y={5.25} w={4.9} d={4.15} stripes={5} />
      <IsoDisc x={42.4} y={-23.6} z={0.12} r={1.85} fill={PLAZA.top} />
      <IsoDisc x={10.4} y={-0.4} z={0.12} r={2.55} fill={GRASS.top} />
      <Spine />
      <Paths />
      <Creek />
    </g>
  );
}

function Spine() {
  const plazaX = SPINE_X - 1.6;
  const plazaW = SPINE_W + 10.2;
  const roadD = GATE_Y - DOE_SOUTH;
  const pinchX = SPINE_MID - GATE_INNER / 2;

  return (
    <g data-layer="sather-spine">
      <IsoSlab x={plazaX} y={GATE_Y + 0.62} w={plazaW} d={7.35} h={0.16} {...PLAZA} />
      <IsoSlab x={pinchX} y={GATE_Y} w={GATE_INNER} d={0.72} h={0.18} {...PLAZA} />
      <IsoSlab x={SPINE_X} y={DOE_SOUTH + 0.62} w={SPINE_W} d={roadD - 0.62} h={0.16} {...PLAZA} />
      <IsoSlab x={SPINE_X - 1.4} y={DOE_SOUTH} w={SPINE_W + 2.8} d={0.78} h={0.17} {...PLAZA} />
      <IsoSlab x={20.6} y={DOE_SOUTH + 0.1} w={26.8} d={0.58} h={0.15} {...PATH} />
      <IsoSlab x={40.8} y={-8.7} w={4.8} d={4.5} h={0.13} {...PLAZA} />
    </g>
  );
}

function Paths() {
  const slabs = [
    { x: 10.2, y: -8.4, w: 0.42, d: 10.6 },
    { x: 14.6, y: 2.2, w: 3.4, d: 0.4 },
    { x: 8.4, y: 6.6, w: 9.4, d: 0.38 },
    { x: 18.6, y: 15.2, w: 0.42, d: 6.4 },
    { x: 48.4, y: 6.2, w: 10.6, d: 0.38 },
    { x: 62.2, y: -20.4, w: 0.4, d: 16.4 },
  ] as const;

  return (
    <g data-layer="paths">
      {slabs.map((slab) => (
        <IsoSlab key={`${slab.x}-${slab.y}`} {...slab} h={0.12} {...PATH} />
      ))}
    </g>
  );
}

function Creek() {
  const bands = [
    { x: 6.2, y: -5.4, w: 5.4, d: 0.48 },
    { x: 10.4, y: -3.2, w: 6.2, d: 0.46 },
    { x: 14.8, y: -0.6, w: 5.4, d: 0.46 },
    { x: 9.6, y: 6.4, w: 6.0, d: 0.44 },
    { x: 6.2, y: 8.0, w: 4.0, d: 0.42 },
    { x: 52.6, y: -6.2, w: 6.4, d: 0.48 },
    { x: 58.4, y: -8.6, w: 5.2, d: 0.5 },
    { x: 46.8, y: 4.4, w: 5.6, d: 0.46 },
  ] as const;

  return (
    <g data-landmark="strawberry-creek">
      {bands.map((band) => (
        <IsoSlab key={`${band.x}-${band.y}`} {...band} h={0.11} {...WATER} />
      ))}
    </g>
  );
}

function Hills({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="hills">
      <IsoSlab x={68.4} y={-28.4} w={12.4} d={22.0} h={0.7} {...GRASS} />
      <IsoSlab x={71.2} y={-26.0} w={9.2} d={16.4} h={1.35} top="#B5D389" left="#88B078" right="#9EC48A" />
      {[
        [70.0, -26.8],
        [73.2, -24.4],
        [76.0, -22.0],
        [71.4, -20.2],
        [75.6, -18.4],
        [72.8, -15.6],
        [76.4, -13.4],
        [73.6, -11.2],
        [77.0, -9.0],
        [74.2, -6.6],
      ].map(([x, y], index) => (
        <IsoTree
          key={`${x}-${y}`}
          x={x}
          y={y}
          canopy={index % 2 === 0 ? "#7EBE7A" : "#6FA86C"}
          delay={`${(index % 5) * 0.2}s`}
          reduceMotion={reduceMotion}
        />
      ))}
    </g>
  );
}

function GreekTheatre() {
  const cx = 62.0;
  const cy = -18.6;

  return (
    <g data-landmark="greek-theatre">
      <IsoDisc x={cx} y={cy} z={0.14} r={2.65} fill={STONE.top} />
      <IsoDisc x={cx} y={cy} z={0.18} r={1.9} fill={PLAZA.top} />
      <IsoDisc x={cx} y={cy} z={0.22} r={1.1} fill={GRASS.top} />
      <IsoBox x={cx - 1.2} y={cy + 1.55} z={0.16} w={2.4} d={0.5} h={0.65} {...STONE} />
    </g>
  );
}

function MemorialStadium() {
  const cx = 72.0;
  const cy = -3.2;
  const stretch = 3.55;
  const outer = 3.35;
  const inner = 2.05;

  return (
    <g data-landmark="memorial-stadium">
      <IsoDisc x={cx} y={cy - stretch} z={0.14} r={outer} fill={STONE.top} />
      <IsoDisc x={cx} y={cy + stretch} z={0.14} r={outer} fill={STONE.top} />
      <IsoSlab x={cx - outer} y={cy - stretch} w={outer * 2} d={stretch * 2} h={0.14} {...STONE} />
      <IsoDisc x={cx} y={cy - stretch} z={0.2} r={inner} fill={GRASS.top} />
      <IsoDisc x={cx} y={cy + stretch} z={0.2} r={inner} fill={GRASS.top} />
      <IsoSlab x={cx - inner} y={cy - stretch} z={0.06} w={inner * 2} d={stretch * 2} h={0.16} {...GRASS} />
      <IsoBox x={cx - 1.65} y={cy - stretch - 0.32} z={0.16} w={3.3} d={0.5} h={1.05} {...STONE} />
    </g>
  );
}

function MaxwellField() {
  return (
    <g data-landmark="maxwell-field">
      <NamedLawn x={69.4} y={5.6} w={5.2} d={3.6} stripes={6} />
    </g>
  );
}

function GoldmanField() {
  return (
    <g data-landmark="goldman-field">
      <NamedLawn x={6.2} y={21.0} w={4.0} d={3.4} stripes={5} />
    </g>
  );
}

function EdwardsTrack() {
  const cx = 13.4;
  const cy = 21.6;
  const stretch = 1.85;
  const outer = 2.15;
  const inner = 1.2;

  return (
    <g data-landmark="edwards-track">
      <IsoDisc x={cx} y={cy - stretch} z={0.14} r={outer} fill={TRACK.top} />
      <IsoDisc x={cx} y={cy + stretch} z={0.14} r={outer} fill={TRACK.top} />
      <IsoSlab x={cx - outer} y={cy - stretch} w={outer * 2} d={stretch * 2} h={0.14} {...TRACK} />
      <IsoDisc x={cx} y={cy - stretch} z={0.18} r={inner} fill={GRASS.top} />
      <IsoDisc x={cx} y={cy + stretch} z={0.18} r={inner} fill={GRASS.top} />
      <IsoSlab x={cx - inner} y={cy - stretch} z={0.04} w={inner * 2} d={stretch * 2} h={0.15} {...GRASS} />
    </g>
  );
}

function EvansDiamond() {
  return (
    <g data-landmark="evans-diamond">
      <IsoSlab x={18.6} y={20.8} w={3.2} d={2.8} h={0.12} {...DIRT} />
      <NamedLawn x={19.0} y={21.1} w={2.3} d={2.0} stripes={3} />
    </g>
  );
}

function SpiekerPool() {
  return (
    <g data-landmark="spieker-pool">
      <IsoSlab x={6.3} y={6.7} w={3.8} d={1.5} h={0.12} {...WATER} />
    </g>
  );
}

function HellmanTennis() {
  return (
    <g data-landmark="hellman-tennis">
      <Court x={6.4} y={13.4} w={1.7} d={3.2} />
      <Court x={8.3} y={13.4} w={1.7} d={3.2} />
      <Court x={10.2} y={13.4} w={1.7} d={3.2} />
    </g>
  );
}

function FoundersRock() {
  return (
    <g data-landmark="founders-rock">
      <IsoBox x={50.4} y={-31.4} z={0.16} w={0.9} d={0.75} h={0.55} {...STONE} />
      <IsoBox x={50.7} y={-31.2} z={0.7} w={0.48} d={0.4} h={0.28} {...STONE} />
    </g>
  );
}

function Campanile() {
  const x = 42.35;
  const y = -7.62;
  const w = 1.08;
  const d = 1.08;
  const shaft = 11.2;

  return (
    <g data-landmark="sather-tower" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x - 0.16} y={y - 0.16} z={0.16} w={w + 0.32} d={d + 0.32} h={0.28} {...STONE} />
      <IsoBox x={x} y={y} z={0.44} w={w} d={d} h={shaft} {...STONE} />
      <IsoWindows face="left" x={x} y={y} z={0.44} w={w} d={d} h={shaft} cols={1} rows={8} fill={WINDOW} v0={0.06} v1={0.92} />
      <IsoWindows face="right" x={x} y={y} z={0.44} w={w} d={d} h={shaft} cols={1} rows={8} fill={WINDOW} v0={0.06} v1={0.92} />
      <IsoBox x={x - 0.14} y={y - 0.14} z={0.44 + shaft} w={w + 0.28} d={d + 0.28} h={0.85} {...STONE} />
      <IsoWindows
        face="left"
        x={x - 0.14}
        y={y - 0.14}
        z={0.44 + shaft}
        w={w + 0.28}
        d={d + 0.28}
        h={0.85}
        cols={2}
        rows={1}
        fill={WINDOW}
        v0={0.22}
        v1={0.78}
      />
      <IsoGable
        x={x - 0.14}
        y={y - 0.14}
        z={1.29 + shaft}
        w={w + 0.28}
        d={d + 0.28}
        rise={1.15}
        left={TILE.left}
        right={TILE.right}
      />
      <IsoBox
        x={x + w * 0.42}
        y={y + d * 0.42}
        z={2.4 + shaft}
        w={0.16}
        d={0.16}
        h={0.7}
        top={TILE.top}
        left={TILE.left}
        right={TILE.right}
      />
    </g>
  );
}

function SatherGate() {
  const z = 0.2;
  const post = 0.44;
  const depth = 0.62;
  const height = 4.55;
  const span = GATE_INNER + 1.05;
  const x = SPINE_MID - span / 2;
  const y = GATE_Y - 0.12;
  const gap = (span - post * 4) / 3;
  const posts = [0, 1, 2, 3].map((index) => x + index * (post + gap));

  return (
    <g data-landmark="sather-gate" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x - 0.35} y={y - 0.08} z={z} w={span + 0.7} d={depth + 0.18} h={0.22} {...STONE} />
      {posts.map((px) => (
        <IsoBox key={px} x={px} y={y} z={z + 0.22} w={post} d={depth} h={height} {...STONE} />
      ))}
      <IsoBox x={x - 0.22} y={y - 0.1} z={z + 0.22 + height} w={span + 0.44} d={depth + 0.2} h={0.55} {...STONE} />
      <IsoBox x={x - 0.28} y={y - 0.12} z={z + 0.77 + height} w={span + 0.56} d={depth + 0.24} h={0.28} top="#7E8F6A" left="#5E6E52" right="#6E7E5E" />
      <IsoGable
        x={x - 0.28}
        y={y - 0.12}
        z={z + 1.05 + height}
        w={span + 0.56}
        d={depth + 0.24}
        rise={0.72}
        left="#5E6E52"
        right="#6E7E5E"
      />
    </g>
  );
}

function LudwigsFountain() {
  return (
    <g data-landmark="ludwigs-fountain">
      <IsoDisc x={SPINE_MID} y={14.45} z={0.22} r={0.78} fill={STONE.top} />
      <IsoDisc x={SPINE_MID} y={14.45} z={0.34} r={0.52} fill={WATER.top} />
    </g>
  );
}

function Hall({
  name,
  x,
  y,
  w,
  d,
  h,
  kind = "classic",
  roof = "tile",
  wings = [],
}: HallSpec) {
  return (
    <g className="iso-hover" style={{ pointerEvents: "auto" }} data-landmark={name}>
      <HallBox x={x} y={y} w={w} d={d} h={h} kind={kind} roof={roof} />
      {wings.map((wing, index) => (
        <HallBox
          key={`${name}-wing-${index}`}
          x={wing.x}
          y={wing.y}
          w={wing.w}
          d={wing.d}
          h={wing.h ?? h * 0.92}
          kind={kind}
          roof={roof}
        />
      ))}
    </g>
  );
}

function HallBox({
  x,
  y,
  w,
  d,
  h,
  kind,
  roof,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  kind: Kind;
  roof: Roof;
}) {
  const wall = kind === "brick" ? BRICK : kind === "modern" ? MODERN : STONE;
  const glass = kind === "modern" ? "#D7E8F0" : WINDOW;
  const rows = Math.max(2, Math.round(h - 0.35));
  const cols = Math.max(2, Math.round(w + 0.15));

  return (
    <g>
      <IsoBox x={x} y={y} z={0.16} w={w} d={d} h={h} {...wall} />
      <IsoWindows face="left" x={x} y={y} z={0.16} w={w} d={d} h={h} cols={cols} rows={rows} fill={glass} />
      <IsoWindows face="right" x={x} y={y} z={0.16} w={w} d={d} h={h} cols={1} rows={Math.max(2, rows - 1)} fill={glass} />
      {kind === "classic" ? <IsoFascia x={x} y={y} z={0.16} w={w} d={d} h={h} fill="#D8C49A" /> : null}
      {roof === "flat" ? (
        <>
          <IsoBox x={x + 0.1} y={y + 0.1} z={0.16 + h} w={w - 0.2} d={d - 0.2} h={0.1} top="#E8ECF0" left="#C4C8CC" right="#D4D8DC" />
          <IsoBox x={x + w * 0.38} y={y + d * 0.32} z={0.26 + h} w={0.38} d={0.28} h={0.24} {...SLATE} />
        </>
      ) : roof === "gable" ? (
        <IsoGable x={x} y={y} z={0.16 + h} w={w} d={d} rise={0.68} left={TILE.left} right={TILE.right} />
      ) : (
        <>
          <IsoBox x={x - 0.05} y={y - 0.05} z={0.16 + h} w={w + 0.1} d={d + 0.1} h={0.16} {...TILE} />
          <IsoBox x={x + w * 0.42} y={y + d * 0.38} z={0.32 + h} w={0.24} d={0.24} h={0.36} {...TILE} />
        </>
      )}
    </g>
  );
}

function Labels() {
  const places = [
    { name: "Sather Tower", x: 42.4, y: -7.1, z: 13.4, size: 12 },
    { name: "Sather Gate", x: SPINE_MID, y: GATE_Y + 0.2, z: 5.6, size: 11 },
    { name: "Memorial Glade", x: 31.8, y: -10.6, z: 0.4, size: 11 },
    { name: "Sproul Plaza", x: SPINE_MID, y: 14.15, z: 0.42, size: 11 },
    { name: "Lower Sproul", x: 30.6, y: 19.35, z: 0.4, size: 10 },
    { name: "Ishi Court", x: 22.55, y: 7.15, z: 0.4, size: 9 },
    { name: "The Crescent", x: 10.4, y: -0.2, z: 0.4, size: 10 },
    { name: "Eucalyptus Grove", x: 14.6, y: 1.4, z: 0.4, size: 9 },
    { name: "Faculty Glade", x: 45.4, y: -0.4, z: 0.4, size: 9 },
    { name: "Mining Circle", x: 42.4, y: -23.4, z: 0.4, size: 9 },
    { name: "Strawberry Creek", x: 11.6, y: 4.6, z: 0.4, size: 9 },
    { name: "Greek Theatre", x: 62.0, y: -18.2, z: 1.2, size: 10 },
    { name: "Memorial Stadium", x: 72.0, y: -2.8, z: 1.4, size: 11 },
    { name: "Maxwell Field", x: 72.0, y: 7.4, z: 0.4, size: 9 },
    { name: "Edwards Track", x: 13.4, y: 21.8, z: 0.4, size: 9 },
    { name: "Goldman Field", x: 8.2, y: 22.6, z: 0.4, size: 9 },
    { name: "Evans Diamond", x: 20.2, y: 22.2, z: 0.4, size: 8 },
    { name: "Hellman Tennis", x: 9.2, y: 16.8, z: 0.4, size: 8 },
    { name: "Spieker Pool", x: 8.2, y: 7.4, z: 0.4, size: 8 },
    { name: "Founders' Rock", x: 50.9, y: -31.0, z: 1.1, size: 8 },
    { name: "Observatory Hill", x: 27.2, y: -13.6, z: 0.4, size: 8 },
    { name: "Campanile Way", x: 38.6, y: DOE_SOUTH + 0.35, z: 0.4, size: 8 },
    { name: "Sather Road", x: SPINE_MID, y: 5.55, z: 0.4, size: 9 },
    { name: "Campanile Esplanade", x: 42.8, y: -6.4, z: 0.4, size: 8 },
    { name: "Hearst Avenue", x: 36.0, y: -32.0, z: 0.4, size: 10 },
    { name: "Oxford Street", x: 4.6, y: -2.0, z: 0.4, size: 10 },
    { name: "Bancroft Way", x: 32.0, y: 26.8, z: 0.4, size: 10 },
    { name: "Gayley Road", x: 76.0, y: -4.0, z: 0.4, size: 10 },
    { name: "Piedmont Avenue", x: 75.2, y: 10.4, z: 0.4, size: 9 },
    { name: "Cyclotron Road", x: 58.4, y: -28.6, z: 0.4, size: 8 },
    { name: "Tightwad Hill", x: 77.4, y: -12.4, z: 1.6, size: 8 },
  ] as const;

  return (
    <g data-layer="labels">
      {HALLS.filter((hall) => hall.label !== false).map((hall) => (
        <PlaceName
          key={hall.name}
          x={hall.x + hall.w / 2 + (hall.lx ?? 0)}
          y={hall.y + hall.d * 0.55 + (hall.ly ?? 0)}
          z={hall.h + 0.7 + (hall.lz ?? 0)}
          size={hall.size ?? 8}
        >
          {hall.name}
        </PlaceName>
      ))}
      {places.map((place) => (
        <PlaceName key={place.name} x={place.x} y={place.y} z={place.z} size={place.size}>
          {place.name}
        </PlaceName>
      ))}
    </g>
  );
}

function PlaceName({
  x,
  y,
  z = 0,
  size = 9.5,
  children,
}: {
  x: number;
  y: number;
  z?: number;
  size?: number;
  children: string;
}) {
  const point = iso(x, y, z);

  return (
    <text
      x={point.x}
      y={point.y}
      textAnchor="middle"
      fill="#5C5048"
      stroke="#F4EFE4"
      strokeWidth={3}
      paintOrder="stroke"
      fontFamily="var(--font-display), ui-serif, Georgia, serif"
      fontSize={size}
      fontWeight="500"
      letterSpacing="0.03em"
      style={{ pointerEvents: "none" }}
    >
      {children}
    </text>
  );
}

function Court({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  return (
    <g>
      <IsoSlab x={x} y={y} w={w} d={d} h={0.14} {...COURT} />
      <polygon
        points={isoPoints([
          [x + 0.12, y + 0.12, 0.16],
          [x + w - 0.12, y + 0.12, 0.16],
          [x + w - 0.12, y + d - 0.12, 0.16],
          [x + 0.12, y + d - 0.12, 0.16],
        ])}
        fill="none"
        stroke="#F4F0E8"
        strokeWidth="1.2"
      />
    </g>
  );
}

function NamedLawn({
  x,
  y,
  w,
  d,
  stripes,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  stripes: number;
}) {
  return (
    <g>
      <IsoSlab x={x} y={y} z={0.02} w={w} d={d} h={0.12} {...GRASS} />
      {Array.from({ length: stripes }, (_, index) => {
        if (index % 2 !== 0) return null;
        const u0 = x + (index / stripes) * w;
        const u1 = x + ((index + 1) / stripes) * w;
        return (
          <polygon
            key={index}
            points={isoPoints([
              [u0, y, 0.15],
              [u1, y, 0.15],
              [u1, y + d, 0.15],
              [u0, y + d, 0.15],
            ])}
            fill={GRASS_STRIPE}
            opacity="0.5"
          />
        );
      })}
    </g>
  );
}

function grove(
  originX: number,
  originY: number,
  count: number,
  stepX: number,
  stepY: number,
  stagger: number,
) {
  return Array.from({ length: count }, (_, index) => ({
    x: originX + (index % 5) * stepX + (index % 2 === 0 ? 0 : stagger),
    y: originY + Math.floor(index / 5) * stepY,
    canopy: index % 2 === 0 ? "#8FCB8A" : index % 3 === 0 ? "#7EBE7A" : "#A4D49A",
  }));
}

function Trees({ reduceMotion }: { reduceMotion: boolean }) {
  const eucalyptus = grove(12.8, -1.6, 12, 1.4, 1.65, 0.5);
  const glade = grove(23.2, -15.6, 10, 1.7, 0, 0.18).map((tree, index) => ({
    ...tree,
    y: -15.55 + (index % 2) * 0.3,
  }));
  const ishi = grove(20.6, 6.15, 4, 1.35, 1.4, 0.2);
  const creek = grove(8.6, 5.2, 8, 1.55, 1.05, 0.35);
  const faculty = grove(44.2, -1.35, 6, 1.35, 1.15, 0.3);
  const observatory = grove(26.4, -14.2, 6, 1.45, 1.2, 0.35);
  const oxford = Array.from({ length: 10 }, (_, index) => ({
    x: 5.7,
    y: -28.4 + index * 3.2,
    canopy: index % 2 === 0 ? "#8FCB8A" : "#7EBE7A",
  }));
  const bancroft = Array.from({ length: 12 }, (_, index) => ({
    x: 12.4 + index * 3.4,
    y: 25.4,
    canopy: index % 2 === 0 ? "#A4D49A" : "#8FCB8A",
  }));
  const hearst = Array.from({ length: 10 }, (_, index) => ({
    x: 18.8 + index * 3.6,
    y: -31.6,
    canopy: index % 2 === 0 ? "#7EBE7A" : "#8FCB8A",
  }));
  const sproul = [
    { x: 29.6, y: 12.2, canopy: "#8FCB8A" },
    { x: 36.0, y: 16.8, canopy: "#A4D49A" },
    { x: 28.8, y: 16.4, canopy: "#7EBE7A" },
  ];

  const trees = [
    ...eucalyptus,
    ...glade,
    ...ishi,
    ...creek,
    ...faculty,
    ...observatory,
    ...oxford,
    ...bancroft,
    ...hearst,
    ...sproul,
  ];

  return (
    <g data-layer="trees">
      {trees.map((tree, index) => (
        <IsoTree
          key={`${tree.x}-${tree.y}-${index}`}
          x={tree.x}
          y={tree.y}
          canopy={tree.canopy}
          delay={`${(index % 6) * 0.16}s`}
          reduceMotion={reduceMotion}
        />
      ))}
    </g>
  );
}

function Life({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="life">
      <IsoLamp x={SPINE_X + 0.35} y={8.2} />
      <IsoLamp x={SPINE_X + SPINE_W - 0.55} y={8.2} />
      <IsoLamp x={SPINE_X + 0.35} y={4.2} />
      <IsoLamp x={SPINE_X + SPINE_W - 0.55} y={4.2} />
      <IsoLamp x={SPINE_X + 0.2} y={12.6} />
      <IsoLamp x={SPINE_X + SPINE_W + 0.15} y={12.8} />
      <IsoLamp x={27.4} y={-14.6} />
      <IsoLamp x={35.2} y={-14.4} />
      <IsoPerson x={SPINE_MID - 0.8} y={13.2} fill="#5C5048" reduceMotion={reduceMotion} delay="0s" />
      <IsoPerson x={SPINE_MID + 1.1} y={14.0} fill="#3F5C8A" reduceMotion={reduceMotion} delay="0.4s" />
      <IsoPerson x={SPINE_MID + 0.2} y={8.4} fill="#C45C5C" reduceMotion={reduceMotion} delay="0.9s" />
      <IsoPerson x={29.6} y={-10.2} fill="#6B5340" reduceMotion={reduceMotion} delay="0.2s" />
      <IsoPerson x={26.4} y={-8.8} fill="#3F5C8A" reduceMotion={reduceMotion} delay="1.1s" />
    </g>
  );
}

function IsoDisc({
  x,
  y,
  z,
  r,
  fill,
}: {
  x: number;
  y: number;
  z: number;
  r: number;
  fill: string;
}) {
  const center = iso(x, y, z);
  return (
    <ellipse
      cx={center.x}
      cy={center.y}
      rx={r * TILE_W * Math.SQRT2}
      ry={r * TILE_H * Math.SQRT2}
      fill={fill}
    />
  );
}
