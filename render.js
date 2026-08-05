const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2200, height: 1200 } });
  await page.goto('file://' + process.cwd() + '/daily/report.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.pdf({
    path: 'daily/report.pdf',
    width: '2200px',
    height: (h + 40) + 'px',
    printBackground: true,
    pageRanges: '1'
  });
  await browser.close();
  console.log('PDF rendered, height ' + h);
})();
