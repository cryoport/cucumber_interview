import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber';
import { chromium } from 'playwright';

let browser;
let sharedContext;
let sharedPage;

function resolveHeadless() {
  const { HEADLESS, HEADED, SHOW_BROWSER } = process.env;
  if (HEADED === 'true' || SHOW_BROWSER === '1') return false;
  if (HEADLESS === 'false' || HEADLESS === '0') return false;
  return true; // default headless
}

function shouldReuseWindow() {
  const v = process.env.REUSE_WINDOW;
  return v === '1' || v === 'true';
}

BeforeAll(async function () {
  browser = await chromium.launch({ headless: resolveHeadless() });
});

AfterAll(async function () {
  if (browser) await browser.close();
});

Before(async function () {
  if (shouldReuseWindow()) {
    if (!sharedContext) {
      sharedContext = await browser.newContext();
      sharedPage = await sharedContext.newPage();
    } else {
      // Reset state between scenarios while keeping a single visible window
      try {
        await sharedContext.clearCookies();
      } catch {}
      try {
        // Ensure we're on the app's origin so localStorage is available
        if (this.baseUrl) {
          await sharedPage.goto(`${this.baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
        }
        await sharedPage.evaluate(() => {
          try { localStorage.clear(); } catch {}
          try { sessionStorage.clear(); } catch {}
        });
      } catch {}
    }
    this.context = sharedContext;
    this.page = sharedPage;
  } else {
    this.context = await browser.newContext();
    this.page = await this.context.newPage();
  }
});

After(async function (scenario) {
  // Intentionally leaving screenshot capture as a small challenge for the developer.
  // TODO: On failure, capture and attach screenshot so it shows up in artifacts and the HTML report.
  // Example:
  // if (scenario.result?.status === Status.FAILED) {
  //   const buffer = await this.page.screenshot({ fullPage: true });
  //   await this.attach(buffer, 'image/png');
  //   // Optionally also write to ./artifacts/screenshots for offline viewing
  // }

  if (!shouldReuseWindow()) {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
  }
});
