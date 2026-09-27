#!/usr/bin/env node
/**
 * Fetches the reelshq encode test fixtures.
 *
 * The sample media is a large binary and is deliberately kept out of git
 * history (see .gitignore). It lives as a release asset so the encode test
 * stays reproducible without bloating the repository.
 *
 * Usage:
 *   node scripts/fetch-test-data.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targetDir = join(root, "test-data");

const RELEASE_TAG = "test-data-v1";
const DEFAULT_REPO = "RaliqID/reelshq";

/** Files the encode test expects. */
const FILES = ["sample-4k60.mp4", "sample-4k60.optimized.mp4"];

/** Reads the repository to fetch from, allowing an env override for forks. */
async function resolveRepo() {
  try {
    const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    if (pkg.testData?.repo) return pkg.testData.repo;
  } catch {
    // Fall back to the upstream repository.
  }
  return DEFAULT_REPO;
}

async function download(url, destination) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  await pipeline(response.body, createWriteStream(destination));
}

async function main() {
  const repo = await resolveRepo();
  mkdirSync(targetDir, { recursive: true });

  let failures = 0;
  for (const name of FILES) {
    const destination = join(targetDir, name);
    if (existsSync(destination)) {
      console.log(`skip    ${name} (already present)`);
      continue;
    }
    const url = `https://github.com/${repo}/releases/download/${RELEASE_TAG}/${name}`;
    process.stdout.write(`fetch   ${name} ... `);
    try {
      await download(url, destination);
      console.log("ok");
    } catch (error) {
      failures += 1;
      console.log(`failed (${error.message})`);
    }
  }

  if (failures > 0) {
    console.error(
      `\n${failures} file(s) could not be downloaded. ` +
        `Check that release "${RELEASE_TAG}" exists at https://github.com/${repo}/releases`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\nFixtures ready in test-data/`);
}

main();
