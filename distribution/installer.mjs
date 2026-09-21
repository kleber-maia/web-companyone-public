import { createHash, randomBytes, verify } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

const feedUrl = process.env.COMPANYONE_UPDATE_FEED_URL || "https://companyone.ai/distribution/releases/latest.json";
const trustedReleaseAssetPrefixes = [
  "/kleber-maia/web-companyone-public/releases/download/",
  "/kleber-maia/web-opera-os-public/releases/download/",
  "/kleber-maia/web-company-os-public/releases/download/",
];
const serviceRoot = path.resolve(process.env.COMPANYONE_SERVICE_ROOT || path.join(os.homedir(), "Services", "companyone"));
const appUrl = required("COMPANYONE_APP_URL");
const databaseUrl = required("COMPANYONE_DATABASE_URL");
const adminEmail = required("COMPANYONE_ADMIN_EMAIL");
const adminPassword = required("COMPANYONE_ADMIN_PASSWORD");
const adminName = process.env.COMPANYONE_ADMIN_NAME || "Admin";
const releasesRoot = path.join(serviceRoot, "releases");
const sharedRoot = path.join(serviceRoot, "shared");
const updateRoot = path.join(sharedRoot, "updates");
const currentLink = path.join(serviceRoot, "current");

if (process.platform !== "darwin") throw new Error("The current CompanyONE beta installer supports macOS only.");
if (!["http:", "https:"].includes(new URL(appUrl).protocol)) throw new Error("COMPANYONE_APP_URL must use HTTP or HTTPS.");
if (!/^postgres(?:ql)?:/.test(new URL(databaseUrl).protocol)) throw new Error("COMPANYONE_DATABASE_URL must be a PostgreSQL URL.");
if (!adminEmail.includes("@")) throw new Error("COMPANYONE_ADMIN_EMAIL must be an email address.");
if (adminPassword.length < 12) throw new Error("COMPANYONE_ADMIN_PASSWORD must contain at least 12 characters.");
if (existsSync(currentLink)) throw new Error("CompanyONE is already installed. Use Settings → Updates instead.");
for (const command of ["node", "tar", "psql", "pg_dump", "launchctl", "curl"]) requireCommand(command);

const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "companyone-install-"));
let releaseDirectory;

try {
  console.log("Reading the signed CompanyONE release channel…");
  const manifestText = await requestText(feedUrl);
  const signatureText = await requestText(`${feedUrl}.sig`);
  const publicKeyUrl = new URL("../release-signing-public.pem", feedUrl).href;
  const publicKey = await requestText(publicKeyUrl);
  if (!verify(null, Buffer.from(manifestText), publicKey, Buffer.from(signatureText.trim(), "base64"))) {
    throw new Error("The CompanyONE release signature is invalid.");
  }
  const manifest = validateManifest(JSON.parse(manifestText));
  if (manifest.platform !== process.platform || manifest.architecture !== process.arch) {
    throw new Error(`This package supports ${manifest.platform} ${manifest.architecture}, not this Mac.`);
  }

  console.log(`Downloading CompanyONE ${manifest.version}…`);
  const archive = path.join(temporaryRoot, "companyone.tar.gz");
  await download(manifest.package.url, archive);
  assertPackage(archive, manifest.package);
  execFileSync("tar", ["-xzf", archive, "-C", temporaryRoot]);
  const extracted = path.join(temporaryRoot, "CompanyONE");
  validateRuntime(extracted, manifest);

  mkdirSync(releasesRoot, { recursive: true });
  mkdirSync(path.join(sharedRoot, "backups"), { recursive: true });
  mkdirSync(path.join(sharedRoot, "uploads"), { recursive: true });
  mkdirSync(path.join(sharedRoot, "logs"), { recursive: true });
  mkdirSync(updateRoot, { recursive: true });
  releaseDirectory = path.join(releasesRoot, manifest.version);
  if (existsSync(releaseDirectory)) throw new Error("The target release folder already exists.");
  renameSync(extracted, releaseDirectory);
  writeFileSync(path.join(releaseDirectory, ".env.production"), productionEnvironment());
  chmodSync(path.join(releaseDirectory, ".env.production"), 0o600);
  writeFileSync(path.join(updateRoot, "release-signing-public.pem"), publicKey, { mode: 0o600 });

  const runtimeEnv = { ...process.env, ...parseEnvironment(path.join(releaseDirectory, ".env.production")) };
  console.log("Preparing the fresh CompanyONE database…");
  const database = psqlConnectionString(databaseUrl);
  const tableCount = execFileSync("psql", [database, "--no-psqlrc", "--tuples-only", "--no-align", "--command", "select count(*) from pg_tables where schemaname = 'public'"], { encoding: "utf8" }).trim();
  if (tableCount !== "0") throw new Error("The target database is not empty. CompanyONE beta installs require a fresh database.");
  execFileSync("node", [".next/standalone/node_modules/prisma/build/index.js", "migrate", "deploy", "--schema", "prisma/schema.prisma"], {
    cwd: releaseDirectory,
    env: runtimeEnv,
    stdio: "inherit",
  });
  execFileSync("node", ["scripts/seed-admin.mjs"], {
    cwd: releaseDirectory,
    env: {
      ...runtimeEnv,
      FIRST_ADMIN_EMAIL: adminEmail,
      FIRST_ADMIN_NAME: adminName,
      FIRST_ADMIN_PASSWORD: adminPassword,
    },
    stdio: "inherit",
  });

  activateRelease(releaseDirectory);
  installLaunchAgent();
  console.log("Starting CompanyONE…");
  restartService();
  await waitForHealth();
  console.log(`CompanyONE ${manifest.version} is installed and healthy at ${appUrl}.`);
} catch (error) {
  if (!existsSync(currentLink) && releaseDirectory) rmSync(releaseDirectory, { recursive: true, force: true });
  throw error;
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

function productionEnvironment() {
  const secure = new URL(appUrl).protocol === "https:";
  const values = {
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: process.env.COMPANYONE_AUTH_SECRET || randomBytes(48).toString("hex"),
    APP_URL: appUrl,
    SESSION_COOKIE_SECURE: secure ? "true" : "false",
    BACKUP_DIR: path.join(sharedRoot, "backups"),
    UPLOAD_DIR: path.join(sharedRoot, "uploads"),
    BACKUP_RETENTION_DAYS: "14",
    BACKUP_AUTO_AFTER_OPERATION: "true",
    BACKUP_AUTO_DELAY_MS: "2000",
    BACKUP_TIME_ZONE: process.env.COMPANYONE_TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone,
    COMPANYONE_SERVICE_ROOT: serviceRoot,
    COMPANYONE_HERMES_HOME: path.join(os.homedir(), ".hermes"),
    COMPANYONE_STATE_DIR: path.join(sharedRoot, "hermes-state"),
    COMPANYONE_HERMES_AUTO_SETUP: "true",
    COMPANYONE_HERMES_MULTIPLEX_PROFILES: "true",
    COMPANYONE_UPDATE_FEED_URL: feedUrl,
  };
  return `${Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n")}\n`;
}

function installLaunchAgent() {
  const launchAgent = path.join(os.homedir(), "Library", "LaunchAgents", "com.companyone.production.plist");
  mkdirSync(path.dirname(launchAgent), { recursive: true });
  writeFileSync(launchAgent, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.companyone.production</string>
  <key>ProgramArguments</key><array><string>${xml(path.join(currentLink, "start-production.sh"))}</string></array>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${xml(path.join(sharedRoot, "logs", "production.out.log"))}</string>
  <key>StandardErrorPath</key><string>${xml(path.join(sharedRoot, "logs", "production.err.log"))}</string>
</dict></plist>\n`);
  execFileSync("plutil", ["-lint", launchAgent], { stdio: "inherit" });
  execFileSync("launchctl", ["bootstrap", `gui/${process.getuid()}`, launchAgent], { stdio: "inherit" });
}

function activateRelease(release) {
  const temporary = `${currentLink}.${process.pid}.next`;
  rmSync(temporary, { force: true });
  symlinkSync(release, temporary);
  renameSync(temporary, currentLink);
}

function restartService() {
  execFileSync("launchctl", ["kickstart", "-k", `gui/${process.getuid()}/com.companyone.production`], { stdio: "inherit" });
}

async function waitForHealth() {
  const healthUrl = new URL("/login", appUrl).href;
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(healthUrl, { method: "HEAD", redirect: "manual" });
      if (response.status >= 200 && response.status < 500) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`CompanyONE did not become healthy: ${lastError}`);
}

function validateManifest(value) {
  if (!value || value.schemaVersion !== 1 || value.product !== "CompanyONE" || value.channel !== "beta") throw new Error("The release manifest is not supported.");
  if (!/^[A-Za-z0-9._-]+$/.test(value.version)) throw new Error("The release version is invalid.");
  const packageUrl = new URL(value.package?.url);
  const releaseFeed = new URL(feedUrl);
  const servedByReleaseSite = packageUrl.origin === releaseFeed.origin && packageUrl.pathname.startsWith("/distribution/releases/");
  const servedByGitHubRelease = packageUrl.origin === "https://github.com"
    && trustedReleaseAssetPrefixes.some((prefix) => packageUrl.pathname.startsWith(prefix));
  if (packageUrl.protocol !== "https:" || (!servedByReleaseSite && !servedByGitHubRelease)) throw new Error("The package address is not trusted.");
  if (!Number.isSafeInteger(value.package?.bytes) || value.package.bytes < 1) throw new Error("The package size is invalid.");
  if (!/^[a-f0-9]{64}$/i.test(value.package?.sha256)) throw new Error("The package checksum is invalid.");
  return value;
}

function validateRuntime(release, manifest) {
  for (const file of ["release.json", "start-production.sh", ".next/standalone/server.js", ".next/standalone/node_modules/prisma/build/index.js", "prisma/schema.prisma"]) {
    if (!existsSync(path.join(release, file))) throw new Error(`The package is incomplete: ${file}.`);
  }
  const embedded = JSON.parse(readFileSync(path.join(release, "release.json"), "utf8"));
  if (embedded.version !== manifest.version || embedded.sourceRevision !== manifest.sourceRevision) throw new Error("The package identity does not match its signed manifest.");
}

function assertPackage(file, expected) {
  if (statSync(file).size !== expected.bytes) throw new Error("The downloaded package size is invalid.");
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (hash !== expected.sha256) throw new Error("The downloaded package checksum is invalid.");
}

async function requestText(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`Could not download ${url}: HTTP ${response.status}`);
  return response.text();
}

async function download(url, file) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`Could not download the CompanyONE package: HTTP ${response.status}`);
  writeFileSync(file, Buffer.from(await response.arrayBuffer()));
}

function parseEnvironment(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) values[match[1]] = JSON.parse(match[2]);
  }
  return values;
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required. Read https://companyone.ai/distribution/agent.txt before installing.`);
  return value;
}

function psqlConnectionString(connectionString) {
  const url = new URL(connectionString);
  for (const parameter of ["schema", "connection_limit", "pool_timeout", "socket_timeout"]) url.searchParams.delete(parameter);
  return url.href;
}

function requireCommand(command) {
  try {
    execFileSync("/usr/bin/which", [command], { stdio: "ignore" });
  } catch {
    throw new Error(`${command} is required before installing CompanyONE.`);
  }
}

function xml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
