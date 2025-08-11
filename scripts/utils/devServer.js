import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { ROOT_DIR } from "./fsHelper.js";

const getContentType = (ext) => {
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

const sendFile = (res, filePath) => {
  const stream = fs.createReadStream(filePath);
  const ext = path.extname(filePath);
  const contentType = getContentType(ext);
  res.writeHead(200, {
    "Content-Type": contentType,
    // 'Cache-Control': 'public, max-age=604800, immutable',
  });
  stream.pipe(res);
  stream.on("error", (err) => {
    console.error("Error reading file:", err);
    res.writeHead(500);
    res.end("Server Error");
  });
};

// TODO: add to config main page
export const devServer = async (CONFIG) => {
  const BUILD_DIR = path.join(ROOT_DIR, CONFIG.OUTPUT_DIR);

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Убираем trailing slash (кроме корня)
    if (pathname !== "/" && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // 1. Пытаемся найти страницу в /pages
    const pageHtmlAssetsPath = path.join(
      BUILD_DIR,
      ...CONFIG.PAGES_DIR_PATH,
      pathname
    );
    const pageHtmlPath = path.join(pageHtmlAssetsPath, "index.html");

    if (fs.existsSync(pageHtmlPath)) {
      sendFile(res, pageHtmlPath);
      return;
    }

    const srcPath = path.join(BUILD_DIR, pathname);

    if (fs.existsSync(srcPath)) {
      // Проверяем, что это файл, а не директория
      if (fs.statSync(srcPath).isFile()) {
        sendFile(res, srcPath);
        return;
      }
    }

    // 3. Если файл не найден — 404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  });

  server.listen(CONFIG.DEV_SERVER.PORT, "192.168.0.109", () => {
    console.log(`Server running on http://localhost:${CONFIG.DEV_SERVER.PORT}`);
  });
};
