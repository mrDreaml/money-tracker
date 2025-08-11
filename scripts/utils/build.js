import path from "node:path";
import { clearDirSync, copyDirSync, ROOT_DIR } from "./fsHelper.js";
import { compileHTML, deleteUnusedHTMLFiles } from "./compileHTML.js";

export const build = async (config) => {
  console.time("Build");
  const srcDir = path.join(ROOT_DIR, config.INPUT_DIR);
  const buildDir = path.join(ROOT_DIR, config.OUTPUT_DIR);
  const buildSrcDir = path.join(ROOT_DIR, config.OUTPUT_DIR, config.INPUT_DIR);
  const buildComponentsDir = path.join(buildSrcDir, config.COMPONENTS_DIR);
  const destPagesDir = path.join(buildDir, ...config.PAGES_DIR_PATH);

  clearDirSync(buildDir);
  copyDirSync(srcDir, buildSrcDir);

  console.time("Compile HTML");
  await compileHTML(
    config,
    buildDir,
    destPagesDir,
    buildSrcDir,
    buildComponentsDir
  );
  console.timeEnd("Compile HTML");

  await deleteUnusedHTMLFiles(buildComponentsDir);

  console.timeEnd("Build");
};
