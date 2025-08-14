import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const PORT = 3000;
const HOST = "192.168.0.109";

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

const devServer = async () => {
  const BUILD_DIR = path.join(process.cwd(), "src");

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Убираем trailing slash (кроме корня)
    if (pathname !== "/" && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // 1. Пытаемся найти страницу в /pages
    const pageHtmlAssetsPath = path.join(BUILD_DIR, "pages", pathname);
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

  server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
};

devServer();
