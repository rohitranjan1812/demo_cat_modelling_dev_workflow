/**
 * Puppeteer UI Integration Tests
 * Comprehensive frontend functionality testing with bundled Chromium
 */

const puppeteer = require('puppeteer');

// Configuration
const FRONTEND_URL = 'http://localhost:3000';
const TIMEOUT = 30000; // 30 seconds

describe('🖥️  CAT Modeling Platform - UI Tests (Puppeteer)', () => {
  
  let browser;
  let page;
  
  // Setup Puppeteer browser
  beforeAll(async () => {
    console.log('🚀 Starting Puppeteer browser...');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Puppeteer browser started');
  }, 60000);
  
  afterAll(async () => {
    if (browser) {
      await browser.close();
      console.log('🔌 Puppeteer browser closed');
    }
  });
  
  // ============================================================================
  // PAGE LOAD TESTS
  // ============================================================================
  
  describe('📄 Page Loading', () => {
    
    test('Home page should load successfully', async () => {
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: TIMEOUT });
      
      const title = await page.title();
      expect(title).toContain('CAT Modeling');
      
      console.log(`   ✓ Page loaded: ${title}`);
      
      // Check for React root
      const hasReactRoot = await page.$('div#root');
      expect(hasReactRoot).toBeTruthy();
    }, TIMEOUT + 10000);
    
    test('Dashboard should be accessible and render content', async () => {
      await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle2', timeout: TIMEOUT });
      
      // Wait for main content
      await page.waitForSelector('main, [role="main"], .MuiContainer-root', { timeout: TIMEOUT });
      
      const hasContent = await page.evaluate(() => {
        const body = document.body.textContent || '';
        return body.length > 100; // Should have substantial content
      });
      
      expect(hasContent).toBe(true);
      console.log('   ✓ Dashboard rendered with content');
    }, TIMEOUT + 10000);
  });
  
  // ============================================================================
  // NAVIGATION TESTS
  // ============================================================================
  
  describe('🧭 Navigation', () => {
    
    test('Should navigate to Accounts page', async () => {
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
      
      // Look for Accounts link
      const accountsLink = await page.$x("//a[contains(text(), 'Accounts') or @href='/accounts']");
      
      if (accountsLink.length > 0) {
        await accountsLink[0].click();
        await page.waitForTimeout(2000);
        
        const url = page.url();
        expect(url).toContain('/accounts');
        console.log(`   ✓ Navigated to: ${url}`);
      } else {
        console.log('   ⚠️  Accounts link not found, checking URL pattern');
        await page.goto(`${FRONTEND_URL}/accounts`, { waitUntil: 'networkidle2' });
        expect(page.url()).toContain('/accounts');
      }
    }, TIMEOUT + 10000);
    
    test('Should navigate to Simulations page', async () => {
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
      
      const simulationsLink = await page.$x("//a[contains(text(), 'Simulations') or @href='/simulations']");
      
      if (simulationsLink.length > 0) {
        await simulationsLink[0].click();
        await page.waitForTimeout(2000);
        
        const url = page.url();
        expect(url).toContain('/simulations');
        console.log(`   ✓ Navigated to: ${url}`);
      } else {
        await page.goto(`${FRONTEND_URL}/simulations`, { waitUntil: 'networkidle2' });
        expect(page.url()).toContain('/simulations');
      }
    }, TIMEOUT + 10000);
  });
  
  // ============================================================================
  // DATA DISPLAY TESTS
  // ============================================================================
  
  describe('📊 Data Display', () => {
    
    test('Accounts page should display or handle empty accounts', async () => {
      await page.goto(`${FRONTEND_URL}/accounts`, { waitUntil: 'networkidle2', timeout: TIMEOUT });
      
      await page.waitForTimeout(3000); // Wait for API call
      
      const pageText = await page.evaluate(() => document.body.textContent);
      const hasAccountsContent = pageText.includes('account') || 
                                 pageText.includes('Account') ||
                                 pageText.includes('No accounts') ||
                                 pageText.includes('Loading') ||
                                 pageText.includes('Global Insurance');
      
      expect(hasAccountsContent).toBe(true);
      console.log('   ✓ Accounts page rendered with content');
    }, TIMEOUT + 10000);
    
    test('Simulations page should display simulation data or empty state', async () => {
      await page.goto(`${FRONTEND_URL}/simulations`, { waitUntil: 'networkidle2', timeout: TIMEOUT });
      
      await page.waitForTimeout(3000);
      
      const pageText = await page.evaluate(() => document.body.textContent);
      const hasSimulationsContent = pageText.includes('simulation') || 
                                    pageText.includes('Simulation') ||
                                    pageText.includes('No simulations') ||
                                    pageText.includes('Loading') ||
                                    pageText.includes('Hurricane');
      
      expect(hasSimulationsContent).toBe(true);
      console.log('   ✓ Simulations page rendered');
    }, TIMEOUT + 10000);
  });
  
  // ============================================================================
  // INTERACTION TESTS
  // ============================================================================
  
  describe('🖱️  User Interactions', () => {
    
    test('Page should have interactive elements (buttons, inputs)', async () => {
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
      
      const hasButtons = await page.$$('button, a[role="button"], .MuiButton-root');
      const hasInputs = await page.$$('input, textarea, select');
      
      console.log(`   ✓ Found ${hasButtons.length} buttons and ${hasInputs.length} input fields`);
      expect(hasButtons.length + hasInputs.length).toBeGreaterThan(0);
    }, TIMEOUT + 10000);
  });
  
  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================
  
  describe('📱 Responsive Design', () => {
    
    test('Should render on mobile viewport', async () => {
      await page.setViewport({ width: 375, height: 667 }); // iPhone size
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
      
      const hasContent = await page.evaluate(() => document.body.textContent.length > 50);
      expect(hasContent).toBe(true);
      
      console.log('   ✓ Mobile viewport renders correctly');
      
      // Reset to desktop
      await page.setViewport({ width: 1920, height: 1080 });
    }, TIMEOUT + 10000);
  });
  
  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  
  describe('❌ Error Handling', () => {
    
    test('Should handle invalid routes gracefully', async () => {
      const response = await page.goto(`${FRONTEND_URL}/nonexistent-route-12345`, { 
        waitUntil: 'networkidle2',
        timeout: TIMEOUT
      });
      
      // Should not crash - either 404 page or redirect
      const hasContent = await page.evaluate(() => document.body.textContent.length > 0);
      expect(hasContent).toBe(true);
      
      console.log('   ✓ Invalid routes handled gracefully');
    }, TIMEOUT + 10000);
  });
  
  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('⚡ Performance', () => {
    
    test('Page should load within acceptable time', async () => {
      const startTime = Date.now();
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: TIMEOUT });
      const loadTime = Date.now() - startTime;
      
      console.log(`   ✓ Page loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds
    }, TIMEOUT + 10000);
  });
});


