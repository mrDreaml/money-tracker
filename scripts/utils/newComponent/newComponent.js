import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "../fsHelper.js";
import { CUSTOM_COMPONENT_NAME_REGEXP } from "../../constants/customComponent.js";
import { getAllFilePathsInDirSync, pathToPosix } from "../fsHelper.js";

const { dirname } = import.meta;

export const createNewComponent = (
  config,
  componentName,
  templateName = "regular"
) => {
  if (!CUSTOM_COMPONENT_NAME_REGEXP.test(componentName)) {
    throw new Error(`wrong custom component name: "${componentName}"`);
  }

  const componentPath = path.join(
    ROOT_DIR,
    config.INPUT_DIR,
    config.COMPONENTS_DIR,
    componentName
  );

  if (fs.existsSync(componentPath)) {
    throw new Error(`Component "${componentName}" already exists`);
  }
  fs.mkdirSync(componentPath, { recursive: true });

  const templatePath = path.join(dirname, "assets", templateName);
  const templatePathPosix = pathToPosix(templatePath);

  getAllFilePathsInDirSync(templatePath).forEach((filePath) => {
    const newPath = path.join(
      componentPath,
      filePath.replace(pathToPosix(templatePathPosix), "")
    );
    const content = fs
      .readFileSync(filePath, "utf-8")
      .replaceAll("{{componentName}}", componentName);
    fs.writeFileSync(newPath, content, "utf-8");
  });

  console.log(
    `Component "${componentName}" successfully created, at: "${componentPath}"`
  );
};
