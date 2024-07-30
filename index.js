import { UnstructuredClient } from "unstructured-client";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createLogger, format, transports } from "winston";
import { fileURLToPath } from "url";
import path from "path";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = process.env.UNSTRUCTURED_API_URL;
const key = process.env.UNSTRUCTURED_API_KEY;
const strategy = process.env.STRATEGY || "fast";
const splitPages = process.env.SPLIT_PAGES === "true" ? true : false;
const docsPath =
  process.env.DOCS_PATH || path.resolve(__dirname, "sample_data");
const outputPath = process.env.OUTPUT_PATH || path.resolve(__dirname, "output");

const logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

const getFilesWithPath = async (docsPath) => {
  const files = await readdir(docsPath);
  return files.map((file) => `${docsPath}/${file}`);
};

const getFileData = async (filePath) => {
  try {
    const fileBuffer = await readFile(filePath);
    return fileBuffer;
  } catch (e) {
    throw new Error(`Failed to read ${filePath}`);
  }
};

const createCliet = (url, key) =>
  new UnstructuredClient({
    serverURL: url,
    security: {
      apiKeyAuth: key,
    },
  });

const partition = async (data, file, client) =>
  await client.general.partition({
    partitionParameters: {
      files: {
        content: data,
        fileName: file,
      },
      strategy: strategy,
      splitPdfPage: splitPages,
    },
  });

const writeResults = async (outputPath, file, res) => {
  const outputName = file.split("/").pop();
  await writeFile(
    `${outputPath}/${outputName}.json`,
    JSON.stringify(res.elements),
    (err) => console.info(err)
  );
  return true;
};

const processFile = async (file) => {
  try {
    logger.profile(`Partitioning ${file}`);
    const client = createCliet(url, key);
    const fileBuffer = await getFileData(file);
    const partitionedFile = await partition(fileBuffer, file, client);
    const writePartitionResults = await writeResults(
      outputPath,
      file,
      partitionedFile
    );

    if (writePartitionResults) {
      logger.profile(`Partitioning ${file}`);
      logger.info(`Partitioning ${file} complete`);
    }
  } catch (e) {
    logger.error(`Failed to process ${file}`, e);
  }
};

async function main() {
  try {
    logger.profile(
      `Overall Runtime with strategy ${strategy} and split pages ${splitPages}`
    );

    const files = await getFilesWithPath(docsPath);
    const promises = files.map((file) => processFile(file));

    await Promise.all(promises);

    const outputFiles = await getFilesWithPath(outputPath);

    logger.profile(
      `Overall Runtime with strategy ${strategy} and split pages ${splitPages}`
    );
    logger.info(
      `input files: ${files.length} output files: ${outputFiles.length}`
    );
  } catch (e) {
    logger.error("Failed to process files", e);
  }
}

main();
