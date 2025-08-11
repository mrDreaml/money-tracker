import { build } from "./utils/build.js";
import { serve } from "./utils/serve.js";
import { createNewComponent } from "./utils/newComponent/newComponent.js";

const COMMANDS = {
  BUILD: "build",
  SERVE: "serve",
  NEW_COMPONENT: "new-component",
};

const processArgs = process.argv.slice(2);
const [command] = processArgs;

const BASE_CONFIG = {
  INPUT_DIR: "src",
  OUTPUT_DIR: "build",
  COMPONENTS_DIR: "components",
  COMPONENTS_FILES_TO_IMPORT_EXTENSIONS: "js|css|html",
  ALLOWED_MINIFY_FILES: /(.js|.css)$/,
  PAGES_DIR_PATH: ["src", "pages"],
};

switch (command) {
  case COMMANDS.BUILD: {
    const CONFIG = BASE_CONFIG;
    build(CONFIG);
    break;
  }
  case COMMANDS.SERVE: {
    const CONFIG = {
      ...BASE_CONFIG,
      DEV_SERVER: {
        PORT: 3000,
      },
    };

    serve(CONFIG);
    break;
  }
  case COMMANDS.NEW_COMPONENT: {
    const [_, componentName, templateName] = processArgs;
    createNewComponent(BASE_CONFIG, componentName, templateName);
    break;
  }

  default: {
    if (!command) {
      console.error(
        "To run script use (node scripts/index.js build) or (node scripts/index.js serve)"
      );
    }
    console.error(`Command ${command} not supported`);
  }
}
