/**
 * Manual Debug Test
 * Opens browser and waits for manual testing
 * Check browser console for debug logs
 */

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function manualDebugTest() {
  console.log('🔍 Starting Manual Debug Test\n');
  console.log('This will open Chrome and pause - you can manually test and check console\n');
  
  let driver;
  
  try {
    const options = new chrome.Options();
    options.addArguments('--start-maximized');
    options.addArguments('--auto-open-devtools-for-tabs'); // Auto-open DevTools
    
    console.log('📱 Launching Chrome with DevTools...');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log('🌐 Navigating to http://localhost:3000');
    await driver.get('http://localhost:3000');
    await driver.sleep(2000);

    console.log('🔐 Filling in login credentials...');
    const usernameField = await driver.findElement(By.css('input[type="text"]'));
    await usernameField.sendKeys('riskmanager');

    const passwordField = await driver.findElement(By.css('input[type="password"]'));
    await passwordField.sendKeys('RiskManager2025!');

    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();
    await driver.sleep(3000);

    console.log('✅ Logged in');
    console.log('🎯 Navigating to Simulations...');
    
    try {
      const simulationsLink = await driver.findElement(By.xpath('//*[contains(text(), "Simulation")]'));
      await simulationsLink.click();
      await driver.sleep(2000);
      console.log('✅ On Simulations page');
    } catch (err) {
      console.log('⚠️  Navigation failed, trying direct URL');
      await driver.get('http://localhost:3000/simulations');
      await driver.sleep(2000);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎮 MANUAL TEST MODE');
    console.log('='.repeat(80));
    console.log('Browser is now open with DevTools');
    console.log('');
    console.log('INSTRUCTIONS:');
    console.log('1. Check the Console tab for debug logs (🔵 🟢 🟡 emojis)');
    console.log('2. Click the "Start Simulation" button');
    console.log('3. Watch for console logs when you click');
    console.log('4. Check if modal appears');
    console.log('5. If modal appears, inspect its DOM elements');
    console.log('');
    console.log('Expected Console Logs:');
    console.log('  🔵 START SIMULATION BUTTON CLICKED');
    console.log('  🔵 showForm BEFORE setState: false');
    console.log('  🔵 setState calls executed');
    console.log('  🟡 useEffect: showForm state changed to: true');
    console.log('  🟢 SimulationForm RENDER');
    console.log('  🟢 Props - open: true');
    console.log('');
    console.log('Press Ctrl+C in this terminal when done testing');
    console.log('='.repeat(80));

    // Keep browser open indefinitely
    await new Promise(() => {}); // Never resolves - keeps browser open

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    // This won't execute until Ctrl+C
    if (driver) {
      console.log('\n\n🔒 Closing browser...');
      await driver.quit();
    }
  }
}

manualDebugTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
