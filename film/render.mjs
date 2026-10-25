// Turns film/filme.html into the videos on the home page, one frame at a time.
//
//   npm i --no-save playwright-core @ffmpeg-installer/ffmpeg     (Chrome must be installed)
//   node film/render.mjs                 both cuts, into public/video
//   node film/render.mjs wide            just the wide cut (or: tall)
//   node film/render.mjs stills wide 5 13.5 26   PNG stills at those seconds, into film/stills
//
// Each frame is drawn by the page's own renderAt(t), so nothing depends on how fast this machine is.
import { chromium } from "playwright-core";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filmDir = process.env.FILM_DIR || path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(filmDir, "..");
const videoDir = path.join(root, "public", "video");

const CUTS = {
  wide: { w: 1280, h: 720, scale: 1.5, file: "cvviews-filme", poster: 5.4 },
  tall: { w: 405, h: 720, scale: 720 / 405, file: "cvviews-filme-tall", poster: 5.4 },
};
const TYPES = { ".html": "text/html; charset=utf-8", ".woff2": "font/woff2" };

async function open(browser, cut) {
  const page = await browser.newPage({ viewport: { width: cut.w, height: cut.h }, deviceScaleFactor: cut.scale });
  await page.route("http://film.local/**", (route) => {
    const p = decodeURIComponent(new URL(route.request().url()).pathname);
    const file = p.startsWith("/fonts/") ? path.join(root, "public", p) : path.join(filmDir, path.basename(p));
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file) });
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://film.local/filme.html#render");
  await page.evaluate(() => window.filmReady);
  if (errors.length) throw new Error(errors.join("\n"));
  const cdp = await page.context().newCDPSession(page);
  const shot = async (t, format = "jpeg") => {
    await page.evaluate((t) => window.renderAt(t), t);
    // The clip's scale is what gives full resolution: without it the capture comes back at the stage's CSS size.
    const clip = { x: 0, y: 0, width: cut.w, height: cut.h, scale: cut.scale };
    const { data } = await cdp.send("Page.captureScreenshot", { format, quality: format === "jpeg" ? 94 : undefined, clip, optimizeForSpeed: true });
    return Buffer.from(data, "base64");
  };
  return { page, shot, film: await page.evaluate(() => window.FILM) };
}

async function render(browser, name) {
  const cut = CUTS[name];
  const { shot, film } = await open(browser, cut);
  const out = path.join(videoDir, `${cut.file}.mp4`);
  const enc = spawn(ffmpeg.path, [
    "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(film.fps), "-c:v", "mjpeg", "-i", "-",
    "-vf", "format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-tune", "animation",
    "-movflags", "+faststart", out,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.round(film.duration * film.fps);
  for (let i = 0; i < frames; i++) {
    const buf = await shot(i / film.fps);
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`${name}: ${i}/${frames}`);
  }
  enc.stdin.end();
  await new Promise((resolve, reject) => enc.on("close", (code) => (code ? reject(new Error(`ffmpeg ${code}`)) : resolve())));
  fs.writeFileSync(path.join(videoDir, `${cut.file}.jpg`), await shot(cut.poster));
  console.log(`${name}: ${out}`);
}

const [cmd, ...rest] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
try {
  if (cmd === "stills") {
    const [name, ...times] = rest;
    const { shot } = await open(browser, CUTS[name]);
    const dir = path.join(filmDir, "stills");
    fs.mkdirSync(dir, { recursive: true });
    for (const t of times) fs.writeFileSync(path.join(dir, `${name}-${t}.png`), await shot(+t, "png"));
    console.log(`stills in ${dir}`);
  } else {
    fs.mkdirSync(videoDir, { recursive: true });
    for (const name of cmd ? [cmd] : Object.keys(CUTS)) await render(browser, name);
  }
} finally {
  await browser.close();
}
