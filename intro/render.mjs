// Turns intro/intro.html into intro/cvviews-introducao.mp4, one frame at a time.
//
//   npm i --no-save playwright-core @ffmpeg-installer/ffmpeg     (Chrome must be installed)
//   node intro/render.mjs                    the video (1920×1080, 30 fps)
//   node intro/render.mjs stills 1.5 15 30   PNG stills at those seconds, into intro/stills
//
// The page draws each frame itself with renderAt(t), so nothing depends on how fast this machine is.
// It uses the site's own stylesheet and fonts from public/, served here as they are on the site.
import { chromium } from "playwright-core";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const introDir = process.env.INTRO_DIR || path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(introDir, "..");
const STAGE = { w: 1280, h: 720, scale: 1.5 };
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json" };

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: STAGE.w, height: STAGE.h }, deviceScaleFactor: STAGE.scale });
  await page.route("http://intro.local/**", (route) => {
    const p = decodeURIComponent(new URL(route.request().url()).pathname);
    const file = p.startsWith("/intro/") ? path.join(introDir, p.slice(7))
      : p === "/intro.html" ? path.join(introDir, "intro.html")
      : path.join(root, "public", p);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file) });
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://intro.local/intro.html#render");
  await page.evaluate(() => window.filmReady);
  if (errors.length) throw new Error(errors.join("\n"));
  const cdp = await page.context().newCDPSession(page);
  const clip = { x: 0, y: 0, width: STAGE.w, height: STAGE.h, scale: STAGE.scale };
  const shot = async (t, format = "jpeg") => {
    await page.evaluate((t) => window.renderAt(t), t);
    const { data } = await cdp.send("Page.captureScreenshot", { format, quality: format === "jpeg" ? 94 : undefined, clip, optimizeForSpeed: true });
    return Buffer.from(data, "base64");
  };
  return { shot, film: await page.evaluate(() => window.FILM), errors };
}

const [cmd, ...rest] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
try {
  const { shot, film, errors } = await open(browser);
  if (cmd === "stills") {
    const dir = path.join(introDir, "stills");
    fs.mkdirSync(dir, { recursive: true });
    for (const t of rest) fs.writeFileSync(path.join(dir, `${t}.png`), await shot(+t, "png"));
    console.log(`stills in ${dir}`, errors.length ? errors : "");
  } else {
    const out = path.join(introDir, "cvviews-introducao.mp4");
    const enc = spawn(ffmpeg.path, [
      "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(film.fps), "-c:v", "mjpeg", "-i", "-",
      "-vf", "format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-movflags", "+faststart", out,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const frames = Math.round(film.duration * film.fps);
    for (let i = 0; i < frames; i++) {
      const buf = await shot(i / film.fps);
      if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once("drain", r));
      if (i % 300 === 0) console.log(`${i}/${frames}`);
    }
    enc.stdin.end();
    await new Promise((resolve, reject) => enc.on("close", (code) => (code ? reject(new Error(`ffmpeg ${code}`)) : resolve())));
    fs.writeFileSync(path.join(introDir, "cvviews-introducao.jpg"), await shot(1.6));
    console.log("wrote", out, errors.length ? errors : "");
  }
} finally {
  await browser.close();
}
