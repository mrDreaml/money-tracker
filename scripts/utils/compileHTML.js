import fs from "node:fs";
import path from "node:path";
import {
  getAllFilePathsInDirSync,
  fsAsyncErrorHandler,
  pathToPosix,
} from "./fsHelper.js";
import { JSDOM } from "jsdom";

const addTemplate = (document, currentNode, options) => {
  const { buildComponentsDir, buildDir } = options;
  const allElements =
    currentNode.tagName === "TEMPLATE"
      ? currentNode.content?.querySelectorAll("*")
      : currentNode.querySelectorAll("*");
  Array.from(allElements).forEach((el) => {
    const { tagName } = el;
    if (!tagName.includes("-")) {
      return;
    }

    const customeElementName = el.tagName.toLowerCase();
    try {
      let htmlFile;
      getAllFilePathsInDirSync(
        path.join(buildComponentsDir, customeElementName)
      ).forEach((filePath) => {
        if (filePath.endsWith(".html")) {
          htmlFile = filePath;
        } else if (filePath.endsWith(".js")) {
          const scriptEl = document.createElement("script");
          scriptEl.setAttribute("type", "module");
          scriptEl.setAttribute(
            "src",
            pathToPosix(filePath.replace(pathToPosix(buildDir), ""))
          );
          document.body.appendChild(scriptEl);
        } else if (filePath.endsWith(".css")) {
          const linkEl = document.createElement("link");
          linkEl.setAttribute("rel", "stylesheet");
          linkEl.setAttribute(
            "href",
            pathToPosix(filePath.replace(pathToPosix(buildDir), ""))
          );
          document.head.appendChild(linkEl);
        }
      });

      if (htmlFile) {
        el.innerHTML = fs.readFileSync(htmlFile, "utf-8").concat(el.innerHTML);
      }
      addTemplate(document, el, options);
    } catch (e) {
      console.warn(e);
    }
  });
};

export const compileHTML = (
  config,
  buildDir,
  buildPagesDir,
  buildSrcDir,
  buildComponentsDir
) => {
  const htmlPageFilesPath = getAllFilePathsInDirSync(
    buildPagesDir,
    (filePath) => filePath.endsWith("index.html")
  );

  const promises = htmlPageFilesPath.map((pageFilePath) => {
    let pageContent = fs.readFileSync(pageFilePath, "utf-8");

    const domRoot = new JSDOM(pageContent, {
      parsingMode: "html",
      includeNodeLocations: true,
    });
    const { document } = domRoot.window;

    addTemplate(document, document.body, { buildComponentsDir, buildDir });

    return new Promise((res, rej) =>
      fs.writeFile(
        pageFilePath,
        domRoot.serialize(),
        "utf-8",
        fsAsyncErrorHandler(res, rej)
      )
    );
  });

  return Promise.all(promises);
};

export const deleteUnusedHTMLFiles = (buildSrcDir) =>
  getAllFilePathsInDirSync(buildSrcDir, (filePath) =>
    filePath.endsWith(".html")
  ).map(
    (filePath) =>
      new Promise((res, rej) =>
        fs.unlink(filePath, fsAsyncErrorHandler(res, rej))
      )
  );
