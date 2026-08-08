const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2200, height: 1200 } });
  await page.goto('file://' + process.cwd() + '/daily/report.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // one PDF page per report section
  await page.addStyleTag({ content: 'section.page { page-break-after: always; break-after: page; } section.page:last-of-type { page-break-after: auto; }' });
  const sections = await page.evaluate(() =>
    [...document.querySelectorAll('section.page')].map(s => Math.ceil(s.getBoundingClientRect().height))
  );
  const pageH = Math.max(1100, ...sections.map(h => h + 20));

  await page.pdf({
    path: 'daily/report.pdf',
    width: '2200px',
    height: pageH + 'px',
    printBackground: true
  });
  await browser.close();
  console.log('PDF rendered: ' + sections.length + ' sections, page height ' + pageH);
})();
