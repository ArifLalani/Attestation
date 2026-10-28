// Screenshot helper for the design options (own browser per call, so several people can use it at once).
// node scripts/shot.mjs <url> <out.png> [width=1440] [height=900] [full=1]
import { chromium } from "@playwright/test";

const [url, out, width = "1440", height = "900", full = "1"] = process.argv.slice(2);
// Uses the Chromium already installed for the Playwright MCP instead of downloading another one.
const executablePath = process.env.SHOT_CHROME ?? `${process.env.LOCALAPPDATA}/ms-playwright/chromium-1234/chrome-win64/chrome.exe`;
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: full === "1" });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ out, overflowX: overflow }));
await browser.close();
