const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const puppeteer = require('puppeteer');

let browser;

beforeAll(async () => {
  if (process.env.BROWSER === 'puppeteer') {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
  }
  
  // Make browser available to tests
  global.__BROWSER__ = browser;
});

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

// Helper to create Selenium driver with correct ChromeDriver version
global.createDriver = async () => {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    
  return driver;
};