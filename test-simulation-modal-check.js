/**
 * Enhanced Simulation Modal Check Test
 * Specifically tests what happens after clicking Start Simulation
 * Checks for modals, dialogs, forms, API calls
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function testSimulationModal() {
  console.log('🔍 Starting Enhanced Simulation Modal Test\n');
  
  let driver;
  
  try {
    // Setup Chrome with network logging
    const options = new chrome.Options();
    options.addArguments('--start-maximized');
    options.addArguments('--disable-notifications');
    options.setLoggingPrefs({ browser: 'ALL', performance: 'ALL' });
    
    console.log('📱 Launching Chrome browser...');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Enable performance logging to capture network requests
    await driver.manage().logs().get('performance');

    // Navigate and login
    console.log('🌐 Navigating to http://localhost:3000');
    await driver.get('http://localhost:3000');
    await driver.sleep(2000);

    console.log('🔐 Logging in...');
    const usernameField = await driver.wait(
      until.elementLocated(By.css('input[type="text"], input[name="username"]')),
      10000
    );
    await usernameField.sendKeys('riskmanager');

    const passwordField = await driver.findElement(By.css('input[type="password"]'));
    await passwordField.sendKeys('RiskManager2025!');

    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();
    await driver.sleep(3000);
    console.log('   ✅ Logged in successfully');

    // Navigate to Simulations
    console.log('\n🎯 Navigating to Simulations...');
    const simulationsLink = await driver.findElement(
      By.xpath('//*[contains(text(), "Simulation")]')
    );
    await simulationsLink.click();
    await driver.sleep(2000);
    console.log('   ✅ On Simulations page');

    // Take screenshot before clicking
    let screenshot = await driver.takeScreenshot();
    fs.writeFileSync('modal-test-01-before-click.png', screenshot, 'base64');
    console.log('   📸 Screenshot: modal-test-01-before-click.png');

    // Check current page elements
    console.log('\n📋 Analyzing page before clicking Start...');
    const pageSource1 = await driver.getPageSource();
    fs.writeFileSync('modal-test-page-before.html', pageSource1);
    
    // Count modals/dialogs before
    const dialogsBefore = await driver.findElements(By.css('[role="dialog"], .MuiDialog-root, .modal, .dialog'));
    console.log(`   Found ${dialogsBefore.length} dialog elements before click`);

    // Click Start Simulation
    console.log('\n🖱️  Clicking Start Simulation button...');
    const startButton = await driver.findElement(By.xpath('//button[contains(text(), "Start")]'));
    await startButton.click();
    console.log('   ✅ Clicked Start Simulation');

    // Wait a moment for UI to update
    await driver.sleep(2000);

    // Take screenshot after clicking
    screenshot = await driver.takeScreenshot();
    fs.writeFileSync('modal-test-02-after-click.png', screenshot, 'base64');
    console.log('   📸 Screenshot: modal-test-02-after-click.png');

    // Check for modal/dialog appearance
    console.log('\n🔍 Checking for modal/dialog...');
    const dialogsAfter = await driver.findElements(By.css('[role="dialog"], .MuiDialog-root, .modal, .dialog'));
    console.log(`   Found ${dialogsAfter.length} dialog elements after click`);

    if (dialogsAfter.length > dialogsBefore.length) {
      console.log('   ✅ Dialog appeared!');
      
      // Analyze dialog content
      for (let i = 0; i < dialogsAfter.length; i++) {
        try {
          const dialogText = await dialogsAfter[i].getText();
          console.log(`\n   📄 Dialog ${i + 1} content:`);
          console.log(dialogText.substring(0, 300));
          
          // Save dialog HTML
          const dialogHtml = await dialogsAfter[i].getAttribute('outerHTML');
          fs.writeFileSync(`modal-test-dialog-${i + 1}.html`, dialogHtml);
        } catch (err) {
          console.log(`   ⚠️  Could not read dialog ${i + 1}`);
        }
      }
    } else {
      console.log('   ⚠️  No new dialog appeared');
    }

    // Check for form fields
    console.log('\n📝 Checking for form fields...');
    const formFields = await driver.findElements(By.css('input, select, textarea'));
    console.log(`   Found ${formFields.length} total form fields`);

    // Check specifically for simulation configuration fields
    const simConfigFields = [
      'input[name*="name"]',
      'input[name*="hazard"]',
      'select[name*="hazard"]',
      'input[name*="scenario"]',
      'select[name*="scenario"]',
      'input[name*="exposure"]',
      'textarea[name*="description"]'
    ];

    console.log('   Checking for simulation-specific fields:');
    for (const selector of simConfigFields) {
      try {
        const field = await driver.findElement(By.css(selector));
        const fieldName = await field.getAttribute('name') || await field.getAttribute('id') || 'unnamed';
        console.log(`      ✅ Found: ${fieldName} (${selector})`);
      } catch {
        console.log(`      ❌ Not found: ${selector}`);
      }
    }

    // Check for any new buttons (Save, Create, etc.)
    console.log('\n🔘 Checking for action buttons...');
    const buttons = await driver.findElements(By.css('button'));
    console.log(`   Found ${buttons.length} buttons on page`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      try {
        const buttonText = await buttons[i].getText();
        if (buttonText) {
          console.log(`      - "${buttonText}"`);
        }
      } catch (err) {
        // Skip invisible buttons
      }
    }

    // Save final page source
    const pageSource2 = await driver.getPageSource();
    fs.writeFileSync('modal-test-page-after.html', pageSource2);
    console.log('\n   📄 Full page source saved: modal-test-page-after.html');

    // Check browser console for errors
    console.log('\n📋 Checking browser console...');
    const logs = await driver.manage().logs().get('browser');
    const errors = logs.filter(log => log.level.name === 'SEVERE' || log.level.name === 'WARNING');
    console.log(`   Found ${errors.length} console errors/warnings`);
    
    errors.slice(0, 5).forEach((log, i) => {
      console.log(`      ${i + 1}. [${log.level.name}] ${log.message.substring(0, 150)}`);
    });

    // Try to capture network activity (if available)
    try {
      const perfLogs = await driver.manage().logs().get('performance');
      const networkEvents = perfLogs
        .map(log => JSON.parse(log.message))
        .filter(msg => msg.message.method && msg.message.method.startsWith('Network.'));
      
      console.log(`\n🌐 Network Activity: ${networkEvents.length} events captured`);
      
      // Look for API calls
      const apiCalls = networkEvents.filter(event => 
        event.message.method === 'Network.requestWillBeSent' &&
        event.message.params.request.url.includes('localhost:3001')
      );
      
      if (apiCalls.length > 0) {
        console.log(`   Found ${apiCalls.length} API calls to backend:`);
        apiCalls.slice(0, 5).forEach((call, i) => {
          const url = call.message.params.request.url;
          const method = call.message.params.request.method;
          console.log(`      ${i + 1}. ${method} ${url}`);
        });
      } else {
        console.log('   ⚠️  No API calls detected to backend (localhost:3001)');
      }
    } catch (err) {
      console.log('   ⚠️  Could not capture network activity');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 ANALYSIS SUMMARY');
    console.log('='.repeat(80));
    console.log(`Dialogs before click: ${dialogsBefore.length}`);
    console.log(`Dialogs after click: ${dialogsAfter.length}`);
    console.log(`Total form fields: ${formFields.length}`);
    console.log(`Console errors: ${errors.length}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (driver) {
      console.log('\n🔒 Closing browser...');
      await driver.quit();
    }
  }
}

testSimulationModal();
