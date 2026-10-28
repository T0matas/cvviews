// Local dev server: serves /public and routes /api/* to the same handlers Vercel runs.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./public/", import.meta.url));
const port = Number(process.env.PORT) || 3000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".gz": "application/gzip",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const routes = {
  "/api/analyze": () => import("./api/analyze.js"),
  "/api/chat": () => import("./api/chat.js"),
  "/api/interview": () => import("./api/interview.js"),
  "/api/read": () => import("./api/read.js"),
  "/api/tempo": () => import("./api/tempo.js"),
  "/api/billing": () => import("./api/billing.js"),
};

// Old addresses, sent where they live now (the same redirects as vercel.json).
const redirects = {
  "/como-funciona": "/",
  "/entrevistas": "/#entrevistas",
  "/perguntas": "/#perguntas",
  "/privacy": "/privacidade",
  "/terms": "/termos",
  "/login": "/entrar",
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  if (redirects[pathname]) {
    res.writeHead(307, { Location: redirects[pathname] });
    return res.end();
  }
  if (routes[pathname]) {
    const { default: handler } = await routes[pathname]();
    return handler(req, res);
  }
  // Clean URLs, like on Vercel: /como-funciona serves como-funciona.html.
  const page = pathname === "/" ? "/index.html" : extname(pathname) ? pathname : `${pathname}.html`;
  const safe = normalize(page).replace(/^([/\\]*\.\.)+/, "");
  try {
    const file = await readFile(join(root, safe));
    // no-cache: the browser checks back every time, so an edit shows up on the next reload.
    res.writeHead(200, { "Content-Type": types[extname(safe)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(file);
  } catch {
    // Same as Vercel: unknown addresses get the site's own 404 page.
    const notFound = await readFile(join(root, "404.html")).catch(() => "Página não encontrada");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(notFound);
  }
}).listen(port, () => console.log(`CVviews running at http://localhost:${port}`));
