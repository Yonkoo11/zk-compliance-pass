#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');

const URL = 'https://yonkoo11.github.io/zk-compliance-pass/';
const FRAMES_DIR = path.join(__dirname, 'frames');

async function capture() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Force dark color scheme
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('#connect-cta', { timeout: 10000 });

  // Frame 02: Connect screen
  await page.screenshot({ path: path.join(FRAMES_DIR, '02-connect.png') });
  console.log('Captured 02-connect');

  // Frame 04: KYC credential card
  await page.evaluate(() => {
    document.getElementById('step-connect').classList.remove('active');
    document.getElementById('step-kyc').classList.add('active');
    document.getElementById('step-kyc').style.opacity = '1';
    document.getElementById('step-kyc').style.transform = 'none';
    document.getElementById('kyc-address').textContent = '0x018d...72be';
    document.getElementById('kyc-level').textContent = 'Level 2 - Advanced';
    document.getElementById('ens-name').textContent = 'alice.hsk';
    document.getElementById('kyc-status').textContent = 'Approved';
    document.getElementById('kyc-status').className = 'field-value field-approved';
    document.getElementById('generate-btn').disabled = false;
    document.getElementById('connect-btn').textContent = '0x018d...72be';
    document.getElementById('connect-btn').classList.add('connected');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(FRAMES_DIR, '04-kyc.png') });
  console.log('Captured 04-kyc');

  // Frame 05: Proof generating (stage 2 active)
  await page.evaluate(() => {
    document.getElementById('step-kyc').classList.remove('active');
    document.getElementById('step-proof').classList.add('active');
    document.getElementById('step-proof').style.opacity = '1';
    document.getElementById('step-proof').style.transform = 'none';
    document.getElementById('stage-1').classList.add('stage-done');
    document.getElementById('stage-2').classList.add('stage-active');
    document.getElementById('proof-time-msg').textContent = 'This may take 30-60 seconds in the browser...';
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(FRAMES_DIR, '05-proving.png') });
  console.log('Captured 05-proving');

  // Frame 01: Proof complete (hook frame)
  await page.evaluate(() => {
    document.getElementById('stage-2').classList.remove('stage-active');
    document.getElementById('stage-2').classList.add('stage-done');
    document.getElementById('stage-3').classList.add('stage-done');
    document.getElementById('proof-time-msg').textContent = 'Proof generated successfully.';
    document.getElementById('submit-btn').disabled = false;
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(FRAMES_DIR, '01-hook.png') });
  console.log('Captured 01-hook');

  // Frame 06: Compliant badge + vault
  await page.evaluate(() => {
    document.getElementById('step-proof').classList.remove('active');
    document.getElementById('step-compliant').classList.add('active');
    document.getElementById('step-compliant').style.opacity = '1';
    document.getElementById('step-compliant').style.transform = 'none';
    document.getElementById('compliance-badge').classList.add('visible');
    document.getElementById('compliance-badge').style.opacity = '1';
    document.getElementById('compliance-badge').style.transform = 'scale(1)';
    document.getElementById('vault-balance').textContent = '0.01 HSK';
    document.getElementById('deposit-btn').disabled = false;
    document.getElementById('withdraw-btn').disabled = false;
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(FRAMES_DIR, '06-compliant.png') });
  console.log('Captured 06-compliant');

  // Frame 07: Same as 06 (close/CTA)
  await page.screenshot({ path: path.join(FRAMES_DIR, '07-close.png') });
  console.log('Captured 07-close');

  await browser.close();
  console.log('All frames captured.');
}

capture().catch(e => { console.error(e); process.exit(1); });
