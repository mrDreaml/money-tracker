import { watchDir } from "./fsHelper.js";
import { build } from "./build.js";
import { devServer } from "./devServer.js";

let isBuilding = false;

export const serve = async (CONFIG) => {
  console.log(`Watch: "${CONFIG.INPUT_DIR}"`);

  watchDir(CONFIG.INPUT_DIR, async () => {
    if (isBuilding) {
      return;
    }
    console.log("___\nReload");

    isBuilding = true;
    await build(CONFIG);
    isBuilding = false;
  });

  isBuilding = true;
  await build(CONFIG);
  isBuilding = false;
  devServer(CONFIG);
};
