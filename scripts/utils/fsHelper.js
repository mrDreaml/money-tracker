import fs from "node:fs";
import path from "node:path";

/**
 * Рекурсивно удаляет всё содержимое папки
 * @param {string} dirPath - Путь к папке для очистки
 */
export const clearDirSync = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      clearDirSync(fullPath);
      fs.rmdirSync(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
};

// Функция для копирования файлов и папок
export const copyDirSync = (src, dest) => {
  if (fs.existsSync(dest)) {
    clearDirSync(dest);
  } else {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// TODO: no usages
// export const moveDirSync = (src, dest) => {
//     // Создаем целевую папку, если она не существует
//     if (!fs.existsSync(dest)) {
//         fs.mkdirSync(dest, { recursive: true });
//     }

//     // Читаем содержимое исходной папки
//     const entries = fs.readdirSync(src, { withFileTypes: true });

//     for (let entry of entries) {
//         const srcPath = path.join(src, entry.name);
//         const destPath = path.join(dest, entry.name);

//         if (entry.isDirectory()) {
//             // Если это папка, рекурсивно перемещаем её содержимое
//             moveDirSync(srcPath, destPath);
//         } else {
//             // Если это файл, перемещаем его
//             fs.renameSync(srcPath, destPath);
//         }
//     }

//     // Удаляем пустую исходную папку
//     fs.rmdirSync(src);
// }

const { platform } = process;
export const locale = path[platform === `win32` ? `win32` : `posix`];
export const pathToPosix = (filePath) => filePath.replaceAll(locale.sep, "/");

export const getAllFilePathsInDirSync = (dirPath, fileMatcherCallback) => {
  const results = [];

  // Читаем содержимое папки
  let items = [];
  try {
    items = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Can't read dir: ${dirPath}`);
  }

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Если это папка, рекурсивно читаем её содержимое
      const nestedFiles = getAllFilePathsInDirSync(
        itemPath,
        fileMatcherCallback
      );
      results.push(...nestedFiles);
    } else if (stat.isFile()) {
      const formattedFilePath = pathToPosix(itemPath);
      if (!fileMatcherCallback || fileMatcherCallback(formattedFilePath)) {
        results.push(formattedFilePath);
      }
    }
  }

  return results;
};

export const fsAsyncErrorHandler = (res, rej) => (err) => {
  if (err) {
    console.error(err);
    rej();
  } else {
    res();
  }
};

export const watchDir = (dir, callback) => {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      callback();
    }
  });
};

export const ROOT_DIR = process.cwd();
