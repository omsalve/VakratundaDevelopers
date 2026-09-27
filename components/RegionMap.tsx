"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import clsx from "clsx";
import FitImage from "@/components/FitImage";
import type { MapPlace } from "@/lib/mapPoints";
import {
  gsap,
  prefersReducedMotion,
  useIsomorphicLayoutEffect,
} from "@/lib/motion";
import {
  AREAS,
  PLACES,
  TERRAIN,
  decodeCoast,
  homeRect,
  project,
  regionRoads,
  type Point,
} from "@/lib/regionMap";
import styles from "./RegionMap.module.css";

/**
 * The region map — the ground the Projects section's photograph used to be,
 * drawn instead of photographed so that it can be entered.
 *
 * A COMPOUND COMPONENT, because the section that hosts it already owns the
 * picture's frame. ProjectsShowcase paints its plate through two clip-path
 * windows that slide together, so the map has to be paintable twice, and its
 * pins have to live beside those windows rather than inside either:
 *
 *   <RegionMap places active control>  state, and the camera
 *     <RegionMapCanvas />  × n         the drawing — once per window
 *     <RegionMapOverlay />             pins, place names, the open panel
 *   </RegionMap>
 *
 * THE CAMERA. The map is a drawing in kilometres (lib/regionMap.ts) and the
 * camera turns it into pixels: a scale, a pitch, and a point on the sheet
 * held at a point on the screen. At rest it looks straight down and frames
 * the whole region inside whatever the host leaves clear. Choosing a place —
 * its pin — flies the camera down on to it along a
 * van Wijk path (the optimal zoom-and-pan: it rises before a long crossing
 * and dives straight in on a short one), eased with the section's own
 * `power2.inOut`, the ease its two halves merge on and its frame opens on.
 *
 * THE ANGLE, AND THE DEPTH. The camera pitches back as it comes down — the
 * pitch is a function of the zoom, so it is level at rest, fully tilted at a
 * place, and levels out again mid-way through a long crossing. The roads are
 * drawn three times, stacked:
 *
 *   · the roads themselves, sharp, on the surface of the map;
 *   · a copy at 70%, a little way beneath, a little diffused;
 *   · a copy at 30%, further down, more diffused.
 *
 * Looking straight down, the three coincide and read as one road with a
 * glow. As the camera tilts, the copies drop away beneath the surface — the
 * stack is seen from the side — and they move at their own speeds as the
 * camera travels, which is the parallax. Once down, the pointer turns the
 * camera a few degrees, so the depth is there to be felt at rest as well.
 *
 * THE GROUND is real terrain, drawn as a game map: blue relief at low
 * strength, contour lines, a survey grid, and bronze wherever the eye should
 * catch — the shore, the lakes and rivers, every 250 m of height, and the
 * roads. It is baked once (see lib/regionMap.ts) and drawn as one textured
 * mesh on the GPU, whose hills rise as the camera tilts.
 *
 * WHY A CANVAS. The first version of this stacked SVG planes and moved them
 * with CSS. Moving them with transforms kept the flight on the compositor,
 * but Chrome never re-rasterises a layer under a perspective transform, so a
 * road seen from 2.6× closer was a magnified 1× bitmap — beaded along every
 * diagonal. Redrawing the SVG each frame was sharp but repainted three large
 * layers every frame, which dropped frames even on fast machines. Here every
 * frame projects about three thousand points through the camera and strokes
 * them at the device's own resolution: sharp at any zoom, and a few
 * milliseconds a frame. The two lower copies are drawn into buffers at a
 * half and a quarter of that resolution and scaled back up, which is the
 * diffusion — a blur that costs less than drawing sharply, rather than a
 * filter that costs more.
 *
 * WHAT THE HOST PROVIDES:
 *
 *   · A stage-sized box for each canvas and one for the overlay. The overlay
 *     is measured (never with getBoundingClientRect — the host scales it)
 *     and the camera is fitted into the SAFE FRAME inside it: the part of
 *     the stage clear of the host's own furniture, set by the custom
 *     properties `--map-safe-top/-right/-bottom/-left` on any ancestor.
 *   · `active` — whether the map is live. A parked map holds nothing open and
 *     its camera goes home.
 *
 * WHAT IT EXPOSES to a host timeline:
 *
 *   · `control.ignite(0…1)` — copper drawn out along the roads, one after
 *     another, as the map comes alive. The host scrubs it.
 *   · `[data-map-reveal]` — the place names and their marks.
 */

/* ============================================================================
   Tuning
   ========================================================================== */

/** Magnification of a focused place, against the resting frame. */
const FOCUS_ZOOM = 2.6;

/** How far the camera pitches back at a place, degrees. */
const PITCH = 42;

/** The camera's distance from the map, as a multiple of the stage height.
 *  Shorter is more dramatic perspective; this is a long lens. */
const LENS = 1.35;

/**
 * The two copies beneath the roads: how far below the surface each hangs at
 * full tilt (px), how visible it is, the resolution of the buffer it is drawn
 * into — which is what diffuses it — and its stroke, px.
 */
const DEEP = [
  { depth: 84, opacity: 0.3, res: 0.25, width: 3.4 },
  { depth: 40, opacity: 0.7, res: 0.5, width: 2 },
] as const;

/** The light the roads throw: a wide stroke in a quarter-size buffer. */
const BLOOM = { res: 0.25, width: 9, opacity: 0.22 };

/** How far the pointer turns the camera once it is down, degrees. */
const PARALLAX = { pitch: 3, yaw: 4.5 };

/**
 * Pins and names fade out as they leave the clear frame, over this many
 * pixels — rather than sliding on under the index or the rail, where a name
 * behind a line of the list is only clutter and a pin is out of reach.
 */
const EDGE_FADE = 44;

/**
 * Where a focused place is held in the safe frame. Left of centre, because
 * its panel opens to the right, and a little below middle, so more of the
 * tilted map recedes above it than falls away below. `PANEL_ROOM` keeps it
 * there on a narrow frame; it covers the panel's width plus its offset.
 */
const FOCUS_AT = { x: 0.36, y: 0.56 };
const PANEL_ROOM = 380;

/** The flight. Duration follows the length of the path, within bounds. */
const FLIGHT = { ease: "power2.inOut", pace: 1.15, min: 1.3, max: 2.3 };

/** The panel opens this far through the flight — as the camera settles, not
 *  after it has stopped, so the arrival and the answer are one beat. */
const PANEL_AT = 0.72;

/** The pointer target is the drawn ring, capped at the gap to the nearest
 *  pin so that no two targets overlap. */
const HIT_CEILING = 44;
const HIT_MIN = 14;

/** Past 2× the lines are already finer than the eye; the pixels are not. */
const DPR_MAX = 2;

/** The roads light one after another across this share of the ignition. */
const IGNITE_SPREAD = 0.4;

const INK = {
  copper: "#e98b52",
  lit: "#ffc9a1",
  coast: "rgba(226, 164, 102, 0.5)",
};

/**
 * How much the hills are exaggerated as the camera tilts. The region's
 * relief is gentle — the park's hills under 500 m, Matheran under 1,000 —
 * against a sheet sixty kilometres across, so at true scale it would not
 * read at all; at twice it reads as ground rather than as a picture of it.
 */
const RELIEF = 2.2;

/* ============================================================================
   The camera
   ========================================================================== */

interface View {
  /** The point on the sheet held at (ox, oy) on the screen, km. */
  cx: number;
  cy: number;
  /** Magnification against the resting frame. */
  z: number;
  ox: number;
  oy: number;
}

/** Everything one frame's projection needs, resolved once per frame. */
interface Lens {
  cx: number;
  cy: number;
  /** Pixels per km. */
  s: number;
  ox: number;
  oy: number;
  /** Cosine and sine of the pitch and the yaw. */
  pc: number;
  ps: number;
  yc: number;
  ys: number;
  /** Distance from the eye to the map, px. */
  d: number;
  /** How far the stack has parted, 0 at rest → 1 at a place. */
  sep: number;
  /** Pixels a kilometre of height lifts the ground — zero at rest. */
  rise: number;
  /** Nearest the eye a point may come before it is clipped, px. */
  near: number;
}

const DEG = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/**
 * The van Wijk–Nuij path between two views ("Smooth and efficient zooming
 * and panning", 2003), as d3 and every web map since have used it. Views are
 * [x, y, width of the visible sheet]; `length` is the path's length in its
 * own units, which is what a duration should follow.
 */
function zoomPath(
  from: [number, number, number],
  to: [number, number, number],
) {
  const rho = Math.SQRT2;
  const rho2 = rho * rho;
  const rho4 = rho2 * rho2;
  const [ux0, uy0, w0] = from;
  const [ux1, uy1, w1] = to;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;

  if (d2 < 1e-9) {
    const S = Math.log(w1 / w0) / rho;
    return {
      length: Math.abs(S),
      at: (t: number): [number, number, number] => [
        ux0 + t * dx,
        uy0 + t * dy,
        w0 * Math.exp(rho * t * S),
      ],
    };
  }

  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho;
  const coshr0 = Math.cosh(r0);

  return {
    length: Math.abs(S),
    at: (t: number): [number, number, number] => {
      const s = t * S;
      const u =
        (w0 / (rho2 * d1)) *
        (coshr0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
      return [
        ux0 + u * dx,
        uy0 + u * dy,
        (w0 * coshr0) / Math.cosh(rho * s + r0),
      ];
    },
  };
}

/* ---- Projection ---------------------------------------------------------
   A point on the sheet — standing `h` km above the sea, on a plane `depth` px
   beneath the roads — is carried into camera space: scaled about the held
   point, lifted by its height (only as the camera tilts; a map seen straight
   down is flat), pitched about the screen's horizontal, turned about the
   vertical, and then divided by its distance from the eye. Written out
   long-hand into a shared buffer: this is the inner loop of every frame, and
   it allocates nothing. The terrain mesh runs the same arithmetic on the GPU,
   from the matrix `cameraMatrix` builds, so the two agree to the pixel. */

let cam = new Float64Array(3 * 1024);

function toCamera(
  L: Lens,
  pts: Point[],
  count: number,
  depth: number,
  heights?: ArrayLike<number>,
) {
  if (cam.length < count * 3) cam = new Float64Array(count * 6);
  const sink = -depth * L.sep;
  for (let i = 0; i < count; i++) {
    const u = (pts[i].x - L.cx) * L.s;
    const v = (pts[i].y - L.cy) * L.s;
    const w = sink + (heights ? heights[i] * L.rise : 0);
    const y1 = v * L.pc - w * L.ps;
    const z1 = v * L.ps + w * L.pc;
    cam[i * 3] = u * L.yc + z1 * L.ys;
    cam[i * 3 + 1] = y1;
    cam[i * 3 + 2] = -u * L.ys + z1 * L.yc;
  }
  return cam;
}

/** Trace an open line, clipped where it would pass behind the lens. */
function traceLine(
  ctx: CanvasRenderingContext2D,
  L: Lens,
  pts: Point[],
  count: number,
  depth: number,
  heights?: ArrayLike<number>,
) {
  const c = toCamera(L, pts, count, depth, heights);
  let pen = false;
  for (let i = 0; i < count; i++) {
    const z = c[i * 3 + 2];
    const inside = z < L.near;
    if (i > 0) {
      const pz = c[i * 3 - 1];
      if (inside !== pz < L.near) {
        const t = (L.near - pz) / (z - pz);
        const f = L.d / (L.d - L.near);
        const x = L.ox + lerp(c[i * 3 - 3], c[i * 3], t) * f;
        const y = L.oy + lerp(c[i * 3 - 2], c[i * 3 + 1], t) * f;
        if (pen) {
          ctx.lineTo(x, y);
          pen = false;
        } else {
          ctx.moveTo(x, y);
          pen = true;
        }
      }
    }
    if (inside) {
      const f = L.d / (L.d - z);
      const x = L.ox + c[i * 3] * f;
      const y = L.oy + c[i * 3 + 1] * f;
      if (pen) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      pen = true;
    }
  }
}

/**
 * The camera as a 4×4 matrix, for the terrain mesh: sheet (x, y, height) →
 * clip space, the same projection `toCamera` performs. Every step of it is
 * linear in the point until the divide, so the matrix is read off by running
 * the four basis vectors through it. Column-major, for WebGL.
 */
function cameraMatrix(L: Lens, w: number, h: number): Float32Array {
  const run = (x: number, y: number, hk: number, k: number) => {
    const u = L.s * x - k * L.s * L.cx;
    const v = L.s * y - k * L.s * L.cy;
    const lift = L.rise * hk;
    const y1 = v * L.pc - lift * L.ps;
    const z1 = v * L.ps + lift * L.pc;
    const x2 = u * L.yc + z1 * L.ys;
    const z2 = -u * L.ys + z1 * L.yc;
    const wc = k - z2 / L.d;
    return [
      (2 / w) * x2 + ((2 * L.ox) / w - 1) * wc,
      -(2 / h) * y1 + (1 - (2 * L.oy) / h) * wc,
      0,
      wc,
    ];
  };
  return new Float32Array([
    ...run(1, 0, 0, 0),
    ...run(0, 1, 0, 0),
    ...run(0, 0, 1, 0),
    ...run(0, 0, 0, 1),
  ]);
}

/** The first `fraction` of a road, by length, with its heights. */
function partOf(
  road: { points: Point[]; along: number[]; length: number },
  heights: ArrayLike<number> | undefined,
  fraction: number,
): { points: Point[]; heights: number[] } {
  const reach = road.length * fraction;
  const points: Point[] = [];
  const hs: number[] = [];
  for (let i = 0; i < road.points.length; i++) {
    if (road.along[i] <= reach) {
      points.push(road.points[i]);
      hs.push(heights ? heights[i] : 0);
      continue;
    }
    const a = road.points[i - 1];
    const b = road.points[i];
    const t = (reach - road.along[i - 1]) / (road.along[i] - road.along[i - 1]);
    points.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
    hs.push(heights ? lerp(heights[i - 1], heights[i], t) : 0);
    break;
  }
  return { points, heights: hs };
}

function buffer(): HTMLCanvasElement {
  return document.createElement("canvas");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ============================================================================
   The ground — one textured mesh, on the GPU
   ========================================================================== */

const TERRAIN_VS = `
attribute vec3 a_pos;
attribute vec2 a_uv;
uniform mat4 u_camera;
varying vec2 v_uv;
varying vec2 v_pos;
void main() {
  v_uv = a_uv;
  v_pos = a_pos.xy;
  gl_Position = u_camera * vec4(a_pos, 1.0);
}`;

/* The ground fades out over its last few kilometres, in sheet units, so
   wherever a wide screen or a tilted camera sees past the data it meets dark
   sea rather than the last row of pixels smeared outward. */
const TERRAIN_FS = `
precision mediump float;
varying vec2 v_uv;
varying vec2 v_pos;
uniform sampler2D u_ground;
uniform vec4 u_bounds;
uniform float u_fade;
void main() {
  vec2 inside = min(v_pos - u_bounds.xy, u_bounds.zw - v_pos);
  float edge = smoothstep(0.0, u_fade, min(inside.x, inside.y));
  gl_FragColor = vec4(texture2D(u_ground, v_uv).rgb * edge, edge);
}`;

/** Kilometres over which the ground fades out at the edge of its data. */
const TERRAIN_FADE = 6;

/**
 * The real ground: the baked terrain texture (colour, relief, water) on a
 * mesh of the region's elevation, drawn in one call. The mesh lies flat at
 * rest and its hills rise as the camera tilts — `rise` in the lens is zero
 * until then. The data runs well past anything the map frames at rest; past
 * its edge, where only a very wide screen or a steep tilt could look, the
 * ground fades into the sea (see TERRAIN_FS) over a skirt that carries the
 * mesh on for twenty-five kilometres.
 *
 * Everything here is optional. No WebGL, or files that fail to load, and the
 * map is drawn without its ground: the sea, the coast and the roads.
 */
class Terrain {
  readonly canvas = buffer();
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private count = 0;
  private uCamera: WebGLUniformLocation | null = null;
  private heights: Float32Array | null = null;
  coast: Point[][] = [];
  ready = false;

  /** Height of the ground at a point on the sheet, km. Zero until loaded. */
  heightAt(x: number, y: number): number {
    const hs = this.heights;
    if (!hs) return 0;
    const g = TERRAIN.grid;
    const fx = clamp((x - g.x0) / g.step, 0, g.cols - 1.001);
    const fy = clamp((y - g.y0) / g.step, 0, g.rows - 1.001);
    const i = Math.floor(fx);
    const j = Math.floor(fy);
    const tx = fx - i;
    const ty = fy - j;
    const at = (c: number, r: number) => hs[r * g.cols + c];
    return lerp(
      lerp(at(i, j), at(i + 1, j), tx),
      lerp(at(i, j + 1), at(i + 1, j + 1), tx),
      ty,
    );
  }

  get hasHeights() {
    return this.heights !== null;
  }

  async load(onChange: () => void) {
    // The coast is drawn by the canvas and needs no GPU; it goes first.
    fetch(TERRAIN.coast)
      .then((r) => r.json())
      .then((lines: number[][]) => {
        this.coast = decodeCoast(lines);
        onChange();
      })
      .catch(() => {});

    try {
      const [ground, relief] = await Promise.all([
        loadImage(TERRAIN.texture),
        loadImage(TERRAIN.heights),
      ]);
      this.heights = readHeights(relief);
      onChange();
      this.build(ground);
      onChange();
    } catch {
      // No ground; the rest of the map stands on its own.
    }
  }

  private build(ground: HTMLImageElement) {
    const gl = this.canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl || !this.heights) return;

    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, TERRAIN_VS));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, TERRAIN_FS));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // The mesh: one vertex per height sample, plus a ring of skirt.
    const g = TERRAIN.grid;
    const cols = g.cols + 2;
    const rows = g.rows + 2;
    const SKIRT = 25;
    const xs = (c: number) =>
      c === 0 ? TERRAIN.x0 - SKIRT : c === cols - 1 ? TERRAIN.x1 + SKIRT : g.x0 + (c - 1) * g.step;
    const ys = (r: number) =>
      r === 0 ? TERRAIN.y0 - SKIRT : r === rows - 1 ? TERRAIN.y1 + SKIRT : g.y0 + (r - 1) * g.step;
    const data = new Float32Array(cols * rows * 5);
    let o = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = xs(c);
        const y = ys(r);
        const edge = c === 0 || r === 0 || c === cols - 1 || r === rows - 1;
        data[o++] = x;
        data[o++] = y;
        data[o++] = edge ? 0 : this.heights[(r - 1) * g.cols + (c - 1)];
        data[o++] = clamp((x - TERRAIN.x0) / (TERRAIN.x1 - TERRAIN.x0), 0, 1);
        data[o++] = clamp((y - TERRAIN.y0) / (TERRAIN.y1 - TERRAIN.y0), 0, 1);
      }
    }
    // North to south: nearer rows are drawn later and cover the ones behind,
    // which is all the depth sorting a map seen from its southern edge needs.
    const index = new Uint16Array((cols - 1) * (rows - 1) * 6);
    o = 0;
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c;
        index[o++] = a;
        index[o++] = a + 1;
        index[o++] = a + cols;
        index[o++] = a + 1;
        index[o++] = a + cols + 1;
        index[o++] = a + cols;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    const aUv = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 20, 12);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, ground);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.gl = gl;
    this.program = program;
    this.count = index.length;
    this.uCamera = gl.getUniformLocation(program, "u_camera");
    gl.uniform4f(
      gl.getUniformLocation(program, "u_bounds"),
      TERRAIN.x0,
      TERRAIN.y0,
      TERRAIN.x1,
      TERRAIN.y1,
    );
    gl.uniform1f(gl.getUniformLocation(program, "u_fade"), TERRAIN_FADE);
    this.ready = true;

    this.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.ready = false;
    });
  }

  /** Draw the ground for this frame, at the target's device size. */
  render(L: Lens, cssW: number, cssH: number, pxW: number, pxH: number) {
    const gl = this.gl;
    if (!gl || !this.ready) return false;
    if (this.canvas.width !== pxW) this.canvas.width = pxW;
    if (this.canvas.height !== pxH) this.canvas.height = pxH;
    gl.viewport(0, 0, pxW, pxH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(this.uCamera, false, cameraMatrix(L, cssW, cssH));
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    return true;
  }
}

/** The height grid, from its PNG, in km. */
function readHeights(img: HTMLImageElement): Float32Array {
  const c = buffer();
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, c.width, c.height).data;
  const out = new Float32Array(c.width * c.height);
  const scale = TERRAIN.grid.maxMetres / 255 / 1000;
  for (let i = 0; i < out.length; i++) out[i] = px[i * 4] * scale;
  return out;
}

/**
 * Everything the map moves, and nothing React renders. The camera draws
 * straight to its canvases and writes a translate on each pin and name —
 * once per frame at most, on GSAP's ticker, and only when something changed.
 */
class Rig {
  private canvases = new Set<HTMLCanvasElement>();
  private anchors = new Map<HTMLElement, Point>();
  private box = { w: 0, h: 0 };
  private frame = { l: 0, t: 0, w: 0, h: 0 };
  private base = 0;
  private dpr = 1;
  private view: View = { cx: 0, cy: 0, z: 1, ox: 0, oy: 0 };
  private target: Point | null = null;
  private flight: gsap.core.Tween | null = null;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private tilting = false;
  private lit = 0;
  /** How far a name set left of its point reaches, px — measured once. */
  private leads = new WeakMap<HTMLElement, number>();
  private dirty = false;
  private running = false;
  private buffers: { deep: HTMLCanvasElement[]; bloom: HTMLCanvasElement } | null =
    null;
  private terrain: Terrain | null = null;
  /** Each road's ground height at each of its points, km. */
  private roadHeights = new Map<string, Float32Array>();

  /** Pixels per kilometre at rest. Zero until the stage is measured. */
  get scale() {
    return this.base;
  }

  start() {
    if (this.running) return;
    this.running = true;
    gsap.ticker.add(this.tick);
    this.dirty = true;
    if (!this.terrain) {
      const terrain = new Terrain();
      this.terrain = terrain;
      terrain.load(() => {
        if (terrain.hasHeights && this.roadHeights.size === 0) {
          for (const road of regionRoads()) {
            this.roadHeights.set(
              road.id,
              Float32Array.from(road.points, (p) => terrain.heightAt(p.x, p.y)),
            );
          }
        }
        this.dirty = true;
      });
    }
  }

  dispose() {
    this.running = false;
    this.flight?.kill();
    this.flight = null;
    gsap.ticker.remove(this.tick);
  }

  addCanvas(el: HTMLCanvasElement) {
    this.canvases.add(el);
    this.size();
    this.dirty = true;
    return () => {
      this.canvases.delete(el);
    };
  }

  addAnchor(el: HTMLElement, at: Point) {
    this.anchors.set(el, at);
    this.dirty = true;
    return () => {
      this.anchors.delete(el);
    };
  }

  /** How much of the copper is drawn along the roads, 0 → 1. */
  ignite(progress: number) {
    const next = clamp(progress, 0, 1);
    if (next === this.lit) return;
    this.lit = next;
    this.dirty = true;
  }

  /**
   * Fit the resting frame to the stage and re-seat the camera where it was
   * pointing, without a flight: a resize is not a move.
   */
  measure(layer: HTMLElement, safe: HTMLElement): boolean {
    const w = layer.clientWidth;
    const h = layer.clientHeight;
    const frame = {
      l: safe.offsetLeft,
      t: safe.offsetTop,
      w: safe.offsetWidth,
      h: safe.offsetHeight,
    };
    if (!w || !h || !frame.w || !frame.h) return false;

    const home = homeRect();
    this.box = { w, h };
    this.frame = frame;
    this.base = Math.min(frame.w / home.w, frame.h / home.h);
    this.dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    this.size();

    this.flight?.kill();
    this.flight = null;
    this.view = this.viewFor(this.target);
    this.dirty = true;
    return true;
  }

  private size() {
    const { w, h } = this.box;
    if (!w || !h) return;
    for (const canvas of this.canvases) {
      const cw = Math.round(canvas.clientWidth * this.dpr);
      const ch = Math.round(canvas.clientHeight * this.dpr);
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
    }
    if (!this.buffers) {
      this.buffers = { deep: DEEP.map(buffer), bloom: buffer() };
    }
    const fit = (canvas: HTMLCanvasElement, res: number) => {
      canvas.width = Math.max(1, Math.ceil(w * this.dpr * res));
      canvas.height = Math.max(1, Math.ceil(h * this.dpr * res));
    };
    DEEP.forEach((layer, i) => fit(this.buffers!.deep[i], layer.res));
    fit(this.buffers.bloom, BLOOM.res);
  }

  private viewFor(target: Point | null): View {
    const f = this.frame;
    if (!target) {
      const home = homeRect();
      return {
        cx: home.x + home.w / 2,
        cy: home.y + home.h / 2,
        z: 1,
        ox: f.l + f.w / 2,
        oy: f.t + f.h / 2,
      };
    }
    return {
      cx: target.x,
      cy: target.y,
      z: FOCUS_ZOOM,
      ox: f.l + clamp(f.w * FOCUS_AT.x, 0, Math.max(0, f.w - PANEL_ROOM)),
      oy: f.t + f.h * FOCUS_AT.y,
    };
  }

  /**
   * Take the camera to a place, or home with `null`. `onProgress` hears the
   * eased progress, 0 → 1, every frame of the flight.
   */
  fly(target: Point | null, onProgress?: (t: number) => void) {
    this.target = target;
    if (!this.base) return;

    const from = { ...this.view };
    const to = this.viewFor(target);
    const width = this.box.w;
    const path = zoomPath(
      [from.cx, from.cy, width / (this.base * from.z)],
      [to.cx, to.cy, width / (this.base * to.z)],
    );

    this.flight?.kill();
    const still =
      path.length < 1e-3 &&
      Math.abs(from.ox - to.ox) < 0.5 &&
      Math.abs(from.oy - to.oy) < 0.5;

    const state = { t: 0 };
    this.flight = gsap.to(state, {
      t: 1,
      duration:
        still || prefersReducedMotion()
          ? 0
          : clamp(path.length * FLIGHT.pace, FLIGHT.min, FLIGHT.max),
      ease: FLIGHT.ease,
      onUpdate: () => {
        const [cx, cy, visible] = path.at(state.t);
        this.view = {
          cx,
          cy,
          z: width / (this.base * visible),
          ox: lerp(from.ox, to.ox, state.t),
          oy: lerp(from.oy, to.oy, state.t),
        };
        this.dirty = true;
        onProgress?.(state.t);
      },
      onComplete: () => {
        this.flight = null;
      },
    });
  }

  /** Turn the camera toward the pointer, -1…1 on each axis. Eased on the
   *  ticker, and only for as long as the camera is catching up. */
  turn(x: number, y: number) {
    this.pointer.tx = x;
    this.pointer.ty = y;
    this.tilting = true;
  }

  private tick = () => {
    if (this.tilting) {
      const p = this.pointer;
      p.x += (p.tx - p.x) * 0.07;
      p.y += (p.ty - p.y) * 0.07;
      if (Math.abs(p.tx - p.x) < 1e-3 && Math.abs(p.ty - p.y) < 1e-3) {
        p.x = p.tx;
        p.y = p.ty;
        this.tilting = false;
      }
      this.dirty = true;
    }
    if (this.dirty) this.draw();
  };

  private lens(): Lens {
    const { cx, cy, z, ox, oy } = this.view;
    const sep = smooth(clamp((z - 1) / (FOCUS_ZOOM - 1), 0, 1));
    const pitch = (PITCH + this.pointer.y * PARALLAX.pitch) * sep * DEG;
    const yaw = this.pointer.x * PARALLAX.yaw * sep * DEG;
    const d = LENS * this.box.h;
    const s = this.base * z;
    return {
      cx,
      cy,
      s,
      ox,
      oy,
      pc: Math.cos(pitch),
      ps: Math.sin(pitch),
      yc: Math.cos(yaw),
      ys: Math.sin(yaw),
      d,
      sep,
      rise: s * RELIEF * sep,
      near: d * 0.8,
    };
  }

  private draw() {
    this.dirty = false;
    if (!this.base || !this.buffers) return;

    let primary: HTMLCanvasElement | null = null;
    for (const canvas of this.canvases) {
      if (canvas.width > 1 && canvas.height > 1) {
        primary = canvas;
        break;
      }
    }

    const L = this.lens();
    if (primary) this.paint(primary, L);
    this.place(L);
  }

  private paint(canvas: HTMLCanvasElement, L: Lens) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const roads = regionRoads();
    const dpr = this.dpr;
    const grow = 1 + 0.3 * L.sep;
    const terrain = this.terrain;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // The ground: rendered on the GPU, laid in as one picture.
    if (terrain?.render(L, this.box.w, this.box.h, canvas.width, canvas.height)) {
      ctx.drawImage(terrain.canvas, 0, 0);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // The shoreline, sharp at any distance, at sea level.
    if (terrain && terrain.coast.length) {
      ctx.beginPath();
      for (const line of terrain.coast) traceLine(ctx, L, line, line.length, 0);
      ctx.strokeStyle = INK.coast;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // The roads, in a small buffer, laid back over the canvas.
    const layer = (
      target: HTMLCanvasElement,
      res: number,
      width: number,
      depth: number,
      alpha: number,
      mode: GlobalCompositeOperation,
    ) => {
      const b = target.getContext("2d");
      if (!b) return;
      b.setTransform(1, 0, 0, 1, 0, 0);
      b.clearRect(0, 0, target.width, target.height);
      b.setTransform(dpr * res, 0, 0, dpr * res, 0, 0);
      b.lineCap = "round";
      b.lineJoin = "round";
      b.strokeStyle = INK.copper;
      b.lineWidth = width * grow;
      b.beginPath();
      for (const road of roads) {
        traceLine(b, L, road.points, road.points.length, depth, this.roadHeights.get(road.id));
      }
      b.stroke();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = mode;
      ctx.drawImage(target, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // The two copies beneath, deepest first.
    DEEP.forEach((deep, i) =>
      layer(this.buffers!.deep[i], deep.res, deep.width, deep.depth, deep.opacity, "source-over"),
    );

    // The glow the surface roads throw.
    layer(this.buffers!.bloom, BLOOM.res, BLOOM.width, 0, BLOOM.opacity, "lighter");

    // The roads themselves, at rest…
    ctx.strokeStyle = INK.copper;
    ctx.globalAlpha = 0.78;
    ctx.lineWidth = 1.4 * grow;
    ctx.beginPath();
    for (const road of roads) {
      traceLine(ctx, L, road.points, road.points.length, 0, this.roadHeights.get(road.id));
    }
    ctx.stroke();

    // …and the copper drawn along them as the map comes alive: each road in
    // turn, out of the city, on the section's own in-out ease.
    if (this.lit > 0) {
      ctx.strokeStyle = INK.lit;
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.5 * grow;
      ctx.beginPath();
      roads.forEach((road, i) => {
        const start = (i / Math.max(1, roads.length - 1)) * IGNITE_SPREAD;
        const t = easeInOut(clamp((this.lit - start) / (1 - IGNITE_SPREAD), 0, 1));
        if (t <= 0) return;
        const heights = this.roadHeights.get(road.id);
        if (t >= 1) {
          traceLine(ctx, L, road.points, road.points.length, 0, heights);
        } else {
          const part = partOf(road, heights, t);
          traceLine(ctx, L, part.points, part.points.length, 0, part.heights);
        }
      });
      ctx.stroke();
    }

    // The tilted map fades into the distance rather than running out at the
    // top edge of the screen.
    if (L.sep > 0.01) {
      const reach = this.box.h * 0.42;
      const fog = ctx.createLinearGradient(0, 0, 0, reach);
      fog.addColorStop(0, `rgba(0, 0, 0, ${0.94 * L.sep})`);
      fog.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, this.box.w, reach);
      ctx.globalCompositeOperation = "source-over";
    }

    // Every other window onto the map is the same picture.
    for (const other of this.canvases) {
      if (other === canvas) continue;
      if (other.width !== canvas.width || other.height !== canvas.height) continue;
      const o = other.getContext("2d");
      if (!o) continue;
      o.setTransform(1, 0, 0, 1, 0, 0);
      o.clearRect(0, 0, other.width, other.height);
      o.drawImage(canvas, 0, 0);
    }
  }

  /** Every pin and name to its projected point on the ground. */
  private place(L: Lens) {
    const f = this.frame;
    const reach = EDGE_FADE / 2;
    for (const [el, at] of this.anchors) {
      const u = (at.x - L.cx) * L.s;
      const v = (at.y - L.cy) * L.s;
      const w = (this.terrain?.heightAt(at.x, at.y) ?? 0) * L.rise;
      const y1 = v * L.pc - w * L.ps;
      const z1 = v * L.ps + w * L.pc;
      const x2 = u * L.yc + z1 * L.ys;
      const z2 = -u * L.ys + z1 * L.yc;
      const behind = z2 >= L.near;
      const k = L.d / (L.d - Math.min(z2, L.near));
      const x = L.ox + x2 * k;
      const y = L.oy + y1 * k;

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

      // A name set to the left of its point reaches that much further toward
      // the rail, and is faded by where its first letter is, not its point.
      let lead = this.leads.get(el);
      if (lead === undefined) {
        const text = el.dataset.side === "left" ? el.lastElementChild : null;
        // A pin leads by its halo, so it is gone before it reaches the rail.
        lead = text instanceof HTMLElement ? text.offsetWidth + 18 : 28;
        this.leads.set(el, lead);
      }

      // Faded across a band just outside the clear frame on three sides (the
      // foot is open: the map runs on under the link, which covers nothing).
      const fade = behind
        ? 0
        : Math.min(
            clamp((x - lead - (f.l - reach - EDGE_FADE)) / EDGE_FADE, 0, 1),
            clamp((f.l + f.w + reach + EDGE_FADE - x) / EDGE_FADE, 0, 1),
            clamp((y - (f.t - reach - EDGE_FADE)) / EDGE_FADE, 0, 1),
            clamp((this.box.h - y) / EDGE_FADE, 0, 1),
          );
      el.style.opacity = fade < 1 ? fade.toFixed(3) : "";
      // Gone is hidden, not merely transparent: a hidden pin cannot take
      // focus, and a focused element outside an overflow:hidden stage would
      // scroll the stage to reach it.
      el.style.visibility = fade <= 0.01 ? "hidden" : "";
    }
  }
}


/* ============================================================================
   State
   ========================================================================== */

/** What a host timeline can drive. */
export interface RegionMapControl {
  /** Copper drawn out along the roads as the map comes alive, 0 → 1. */
  ignite: (progress: number) => void;
}

interface MapState {
  rig: Rig;
  places: MapPlace[];
  active: boolean;
  label: string;
  /** The place the camera is on, or null at rest. */
  focusId: string | null;
  /** The place under the pointer or keyboard — a pin or its index line. */
  hoverId: string | null;
  /** The place whose panel is showing. Trails `focusId` by most of a flight. */
  panelId: string | null;
  /** Places whose photographs have been asked for — see PlacePanel. */
  revealed: ReadonlySet<string>;
  /** Pixels per km at rest, for sizing pointer targets. */
  scale: number;
  select: (id: string | null) => void;
  toggle: (id: string) => void;
  hover: (id: string | null) => void;
  measured: (scale: number) => void;
}

const MapContext = createContext<MapState | null>(null);

function useMap(): MapState {
  const state = useContext(MapContext);
  if (!state) throw new Error("RegionMap parts must be rendered inside <RegionMap>.");
  return state;
}

export function RegionMap({
  places,
  active,
  label = "Projects on the map",
  control,
  children,
}: {
  places: MapPlace[];
  /** False parks the map: nothing open, camera at rest. */
  active: boolean;
  /** Names the group of pins for assistive technology. */
  label?: string;
  /** Handed the map's timeline-facing controls. */
  control?: Ref<RegionMapControl>;
  children: ReactNode;
}) {
  const [rig] = useState(() => new Rig());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [scale, setScale] = useState(0);

  useImperativeHandle(
    control,
    () => ({ ignite: (progress: number) => rig.ignite(progress) }),
    [rig],
  );

  useEffect(() => {
    rig.start();
    return () => rig.dispose();
  }, [rig]);

  /* A parked map holds nothing open. Reset while rendering — the sanctioned
     way to derive state from a changed prop — so a map that has just gone
     inert is never painted with a panel on it, not even for a frame. */
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) {
      setFocusId(null);
      setPanelId(null);
      setHoverId(null);
    }
  }

  const select = useCallback(
    (id: string | null) => {
      // A different place closes the panel at once; the camera then flies
      // and the new one opens as it lands. The same place is a no-op.
      if (id === focusId) return;
      setFocusId(id);
      setPanelId(null);
      if (id) {
        setRevealed((current) =>
          current.has(id) ? current : new Set(current).add(id),
        );
      }
    },
    [focusId],
  );

  /** A pin is a switch: the place it is on, or home again. */
  const toggle = useCallback(
    (id: string) => select(id === focusId ? null : id),
    [focusId, select],
  );

  /* The flight. Runs on every change of place; the panel opens from inside
     it, as the camera settles. */
  useEffect(() => {
    const place = focusId
      ? (places.find((entry) => entry.id === focusId) ?? null)
      : null;
    let opened = false;
    rig.fly(place ? { x: place.x, y: place.y } : null, (t) => {
      if (place && !opened && t >= PANEL_AT) {
        opened = true;
        setPanelId(place.id);
      }
    });
  }, [focusId, places, rig]);

  /* The two ways home that are not a control: Escape, and a press anywhere
     that is not part of the map's own interface (`[data-map-ui]`). Bound
     only while the camera is down. */
  useEffect(() => {
    if (!focusId) return;

    const home = () => {
      setFocusId(null);
      setPanelId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") home();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.("[data-map-ui]")) home();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [focusId]);

  /* The parallax at rest: while the camera is down and there is a mouse to
     follow, it turns a few degrees toward it, and the copies beneath the
     roads slide against them. */
  useEffect(() => {
    if (!focusId || prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) =>
      rig.turn(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      rig.turn(0, 0);
    };
  }, [focusId, rig]);

  const measured = useCallback((next: number) => setScale(next), []);

  const value = useMemo<MapState>(
    () => ({
      rig,
      places,
      active,
      label,
      focusId,
      hoverId,
      panelId,
      revealed,
      scale,
      select,
      toggle,
      hover: setHoverId,
      measured,
    }),
    [rig, places, active, label, focusId, hoverId, panelId, revealed, scale, select, toggle, measured],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

/* ============================================================================
   The drawing
   ========================================================================== */

/**
 * One window onto the map. Paint it inside a positioned, stage-sized box, as
 * many times as the host has windows; the camera draws the first and copies
 * the picture into the rest. Decorative — every fact on it is in the overlay
 * and the index.
 */
export function RegionMapCanvas({ className }: { className?: string }) {
  const { rig } = useMap();
  const canvas = useRef<HTMLCanvasElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = canvas.current;
    if (!el) return;
    return rig.addCanvas(el);
  }, [rig]);

  return (
    <div className={clsx(styles.planes, className)} aria-hidden="true">
      <canvas ref={canvas} className={styles.canvas} />
      <div className={styles.vignette} />
    </div>
  );
}

/* ============================================================================
   The overlay — names, pins, and the panel
   ========================================================================== */

/** Pin a DOM node to a point on the sheet; the camera keeps it there. */
function useAnchor<T extends HTMLElement>(at: Point) {
  const { rig } = useMap();
  const ref = useRef<T>(null);
  const { x, y } = at;
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return rig.addAnchor(el, { x, y });
  }, [rig, x, y]);
  return ref;
}

const pad = (n: number) => String(n).padStart(2, "0");

const countLabel = (n: number) =>
  `${pad(n)} ${n === 1 ? "Project" : "Projects"}`;

/** The whole fact at the trigger, so the panel can stay out of the
 *  accessibility tree. */
function spokenLabel(place: MapPlace): string {
  return [
    place.name,
    countLabel(place.projects.length),
    ...place.projects.map((p) => `${p.name}, ${p.status}`),
  ].join(". ");
}

export function RegionMapOverlay({ className }: { className?: string }) {
  const {
    rig,
    places,
    active,
    label,
    focusId,
    hoverId,
    panelId,
    scale,
    measured,
    select,
  } = useMap();
  const layer = useRef<HTMLDivElement>(null);
  const safe = useRef<HTMLDivElement>(null);

  /* The camera is fitted to this box. ResizeObserver reports once on
     observe, after layout and before paint, so the first frame is placed. */
  useIsomorphicLayoutEffect(() => {
    const layerEl = layer.current;
    const safeEl = safe.current;
    if (!layerEl || !safeEl || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (rig.measure(layerEl, safeEl)) measured(rig.scale);
    });
    observer.observe(layerEl);
    return () => observer.disconnect();
  }, [rig, measured]);

  /* Each pin's target, capped at the distance to its nearest neighbour as
     drawn at rest — the most crowded the map ever is. */
  const hits = useMemo(() => {
    const out = new Map<string, number>();
    for (const place of places) {
      let nearest = Infinity;
      for (const other of places) {
        if (other === place) continue;
        nearest = Math.min(
          nearest,
          Math.hypot(other.x - place.x, other.y - place.y) * scale,
        );
      }
      out.set(
        place.id,
        scale ? clamp(nearest, HIT_MIN, HIT_CEILING) : HIT_CEILING,
      );
    }
    return out;
  }, [places, scale]);

  const pinned = useMemo(() => new Set(places.map((p) => p.id)), [places]);
  const lit = hoverId ?? focusId;

  return (
    <div
      ref={layer}
      className={clsx(styles.layer, className)}
      data-active={active ? "true" : "false"}
      data-engaged={focusId || hoverId ? "true" : "false"}
      role="group"
      aria-label={label}
    >
      <div ref={safe} className={styles.safe} aria-hidden="true" />

      {AREAS.map((area) => (
        <AreaName
          key={area.key}
          name={area.name}
          at={project(PLACES[area.place])}
          side={area.side}
          city={area.city}
          lit={lit === area.place}
          marked={!pinned.has(area.place)}
          // A name set below or beside its pin, on the side the panel opens
          // to, steps aside while the panel is up — the panel names it.
          covered={panelId === area.place && area.side !== "left"}
        />
      ))}

      {places.map((place, index) => (
        <PlacePin
          key={place.id}
          place={place}
          index={index}
          hit={hits.get(place.id) ?? HIT_CEILING}
        />
      ))}

      {/* The way home, while the camera is down — Escape and a click off the
          map do the same, but a map should not rely on the visitor knowing
          that. Focus goes back to the pin it came from, not to the page. */}
      <button
        type="button"
        className={styles.back}
        data-shown={focusId ? "true" : "false"}
        data-map-ui=""
        tabIndex={focusId ? 0 : -1}
        aria-hidden={focusId ? undefined : true}
        onClick={() => {
          const from = focusId;
          select(null);
          layer.current
            ?.querySelector<HTMLButtonElement>(`[data-place="${from}"] button`)
            ?.focus({ preventScroll: true });
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        All locations
      </button>

      {/* The licence the ground is drawn under asks for this, wherever the
          map is shown. */}
      <p className={styles.credit} data-map-ui="">
        Map data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </p>
    </div>
  );
}

function AreaName({
  name,
  at,
  side,
  city,
  lit,
  marked,
  covered,
}: {
  name: string;
  at: Point;
  side: "left" | "right" | "below";
  city?: boolean;
  lit: boolean;
  marked: boolean;
  covered: boolean;
}) {
  const ref = useAnchor<HTMLDivElement>(at);
  return (
    <div
      ref={ref}
      className={styles.anchor}
      data-side={side}
      data-covered={covered ? "true" : "false"}
      aria-hidden="true"
    >
      {marked && <span className={styles.mark} data-map-reveal="" />}
      <span className={styles.place}>
        <span
          className={clsx(styles.name, city && styles.cityName)}
          data-lit={lit ? "true" : "false"}
          data-map-reveal=""
        >
          {name}
        </span>
      </span>
    </div>
  );
}

function PlacePin({
  place,
  index,
  hit,
}: {
  place: MapPlace;
  index: number;
  hit: number;
}) {
  const { focusId, hoverId, panelId, revealed, toggle, hover } = useMap();
  const ref = useAnchor<HTMLDivElement>(place);

  const state =
    focusId === place.id
      ? "focus"
      : hoverId === place.id
        ? "lit"
        : focusId
          ? "dim"
          : "idle";
  const open = panelId === place.id;

  return (
    <div
      ref={ref}
      className={styles.anchor}
      data-state={state}
      data-open={open ? "true" : "false"}
      data-place={place.id}
      data-map-ui=""
      style={{ "--i": index, "--pin-hit": `${hit}px` } as CSSProperties}
    >
      <button
        type="button"
        className={styles.pin}
        data-multi={place.projects.length > 1 ? "true" : "false"}
        aria-expanded={open}
        onClick={() => toggle(place.id)}
        onPointerEnter={() => hover(place.id)}
        onPointerLeave={() => hover(null)}
        onFocus={() => hover(place.id)}
        onBlur={() => hover(null)}
      >
        <span className={styles.halo} aria-hidden="true" />
        <span className={styles.beacon} aria-hidden="true" />
        <span className={styles.ring} aria-hidden="true" />
        <span className={styles.core} aria-hidden="true" />
        <span className="u-visually-hidden">{spokenLabel(place)}</span>
      </button>

      {/* The name, on hover — the sheet only prints the six places it is
          labelled with, so a pin anywhere else is named when asked. */}
      <span className={styles.tip} aria-hidden="true">
        {place.name}
        <span className={clsx(styles.tipCount, "u-numeral")}>
          {pad(place.projects.length)}
        </span>
      </span>

      <div className={styles.slot} aria-hidden="true">
        <PlacePanel place={place} reveal={revealed.has(place.id)} />
      </div>
    </div>
  );
}

/**
 * What is at a place. One project gets its name, its line and its
 * photograph; several get the place's name, a strip of their photographs,
 * and the list. The files are only fetched once the place has been chosen —
 * every panel is mounted, and a strip that loaded eagerly would pull the
 * whole portfolio down for panels nobody opens.
 */
function PlacePanel({ place, reveal }: { place: MapPlace; reveal: boolean }) {
  const single = place.projects.length === 1 ? place.projects[0] : null;
  const shots = place.projects.filter((p) => Boolean(p.image.src)).slice(0, 3);

  return (
    <div className={styles.panel}>
      <p className={styles.eyebrow}>
        {place.name}
        <span className={styles.eyebrowRule} aria-hidden="true" />
        {single ? single.status : countLabel(place.projects.length)}
      </p>
      <p className={styles.title}>{single ? single.name : place.name}</p>
      {single?.blurb && <p className={styles.description}>{single.blurb}</p>}

      {shots.length > 0 && (
        <ul className={styles.media} data-count={shots.length}>
          {shots.map((shot) => (
            <li
              key={shot.id}
              className={styles.mediaItem}
              style={
                {
                  "--ratio": shot.image.width / shot.image.height || 1,
                } as CSSProperties
              }
            >
              {reveal && (
                <FitImage
                  src={shot.image.src}
                  alt={shot.image.alt}
                  width={shot.image.width}
                  height={shot.image.height}
                  sizes={single ? "20rem" : "7rem"}
                  quality={82}
                  loading="lazy"
                  className={styles.mediaImage}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {!single && (
        <ul className={styles.items}>
          {place.projects.map((p) => (
            <li key={p.id} className={styles.item}>
              <span>{p.name}</span>
              <span className={styles.itemNote}>{p.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RegionMap;
