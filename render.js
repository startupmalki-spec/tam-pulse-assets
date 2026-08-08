const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 1200 } });
  await page.goto('file://' + process.cwd() + '/daily/report.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.fonts.ready);

  // one PDF page per report section, equal page height = tallest section
  const secs = await page.evaluate(() =>
    [...document.querySelectorAll('.doc section.page')].map(s => Math.ceil(s.getBoundingClientRect().height))
  );
  if (secs.length) {
    const pageH = Math.max(...secs);
    await page.addStyleTag({ content:
      '@page { size: 1240px ' + (pageH + 2) + 'px; margin: 0; } ' +
      'section.page { height: ' + pageH + 'px !important; min-height: 0 !important; overflow: hidden !important; }' });
    await page.pdf({ path: 'daily/report.pdf', width: '1240px', height: (pageH + 2) + 'px', printBackground: true, preferCSSPageSize: true });
    console.log('PDF: ' + secs.length + ' pages, page height ' + pageH);
  } else {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.pdf({ path: 'daily/report.pdf', width: '1240px', height: (h + 40) + 'px', printBackground: true, pageRanges: '1' });
    console.log('PDF fallback single page, height ' + h);
  }
  await browser.close();
})();
