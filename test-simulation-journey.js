/**
 * Comprehensive Selenium Test for Simulation User Journey
 * Tests the complete flow from login to starting a simulation
 * Captures all bugs and errors encountered
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function testSimulationJourney() {
  console.log('🚀 Starting Simulation User Journey Test\n');
  
  const testReport = {
    testName: 'Simulation User Journey Test',
    startTime: new Date().toISOString(),
    steps: [],
    bugs: [],
    screenshots: [],
    status: 'In Progress'
  };

  let driver;
  
  try {
    // Setup Chrome options
    const options = new chrome.Options();
    options.addArguments('--start-maximized');
    options.addArguments('--disable-notifications');
    options.addArguments('--disable-popup-blocking');
    
    // Create driver
    console.log('📱 Launching Chrome browser...');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    testReport.steps.push({
      step: 1,
      action: 'Launch browser',
      status: 'Success',
      timestamp: new Date().toISOString()
    });

    // Step 1: Navigate to frontend
    console.log('🌐 Navigating to http://localhost:3000');
    await driver.get('http://localhost:3000');
    await driver.sleep(2000);

    // Take screenshot
    const loginScreenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshot-01-login-page.png', loginScreenshot, 'base64');
    console.log('   ✓ Screenshot saved: screenshot-01-login-page.png');

    testReport.steps.push({
      step: 2,
      action: 'Navigate to frontend',
      url: 'http://localhost:3000',
      status: 'Success',
      screenshot: 'screenshot-01-login-page.png',
      timestamp: new Date().toISOString()
    });

    // Step 2: Login
    console.log('🔐 Attempting login with riskmanager/RiskManager2025!');
    
    try {
      // Wait for username field
      const usernameField = await driver.wait(
        until.elementLocated(By.css('input[type="text"], input[name="username"], input[placeholder*="username" i], input[id*="username" i]')),
        10000
      );
      await usernameField.clear();
      await usernameField.sendKeys('riskmanager');
      console.log('   ✓ Username entered');

      // Wait for password field
      const passwordField = await driver.findElement(
        By.css('input[type="password"], input[name="password"], input[placeholder*="password" i]')
      );
      await passwordField.clear();
      await passwordField.sendKeys('RiskManager2025!');
      console.log('   ✓ Password entered');

      // Take screenshot before login
      const beforeLoginScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot-02-before-login.png', beforeLoginScreenshot, 'base64');
      console.log('   ✓ Screenshot saved: screenshot-02-before-login.png');

      // Find and click login button - try multiple strategies
      let loginButton;
      try {
        // Try finding by type submit first
        loginButton = await driver.findElement(By.css('button[type="submit"]'));
      } catch {
        try {
          // Try finding by xpath with text content
          loginButton = await driver.findElement(By.xpath('//button[contains(text(), "Login") or contains(text(), "Sign In") or contains(text(), "Log In")]'));
        } catch {
          // Try finding any button in a form
          loginButton = await driver.findElement(By.css('form button'));
        }
      }
      await loginButton.click();
      console.log('   ✓ Login button clicked');

      // Wait for navigation after login
      await driver.sleep(3000);

      // Take screenshot after login
      const afterLoginScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot-03-after-login.png', afterLoginScreenshot, 'base64');
      console.log('   ✓ Screenshot saved: screenshot-03-after-login.png');

      // Check for error messages
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      if (bodyText.toLowerCase().includes('error') || bodyText.toLowerCase().includes('invalid')) {
        testReport.bugs.push({
          step: 'Login',
          severity: 'High',
          description: 'Login error detected',
          bodyContent: bodyText,
          screenshot: 'screenshot-03-after-login.png'
        });
        console.log('   ⚠️  Login error detected!');
      } else {
        console.log('   ✓ Login successful');
      }

      testReport.steps.push({
        step: 3,
        action: 'Login',
        credentials: 'riskmanager/RiskManager2025!',
        status: 'Success',
        screenshots: ['screenshot-02-before-login.png', 'screenshot-03-after-login.png'],
        timestamp: new Date().toISOString()
      });

    } catch (loginError) {
      console.log('   ❌ Login failed:', loginError.message);
      testReport.bugs.push({
        step: 'Login',
        severity: 'Critical',
        description: 'Login failed - could not find login form elements',
        error: loginError.message
      });
      testReport.steps.push({
        step: 3,
        action: 'Login',
        status: 'Failed',
        error: loginError.message,
        timestamp: new Date().toISOString()
      });
    }

    // Step 3: Navigate to Simulations
    console.log('🎯 Navigating to Simulations page...');
    
    try {
      // Look for Simulations link/button
      const simulationsLink = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Simulation') or contains(text(), 'simulation')]")),
        10000
      );
      await simulationsLink.click();
      console.log('   ✓ Clicked Simulations link');
      await driver.sleep(2000);

      const simPageScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot-04-simulations-page.png', simPageScreenshot, 'base64');
      console.log('   ✓ Screenshot saved: screenshot-04-simulations-page.png');

      testReport.steps.push({
        step: 4,
        action: 'Navigate to Simulations',
        status: 'Success',
        screenshot: 'screenshot-04-simulations-page.png',
        timestamp: new Date().toISOString()
      });

    } catch (navError) {
      console.log('   ❌ Navigation to Simulations failed:', navError.message);
      testReport.bugs.push({
        step: 'Navigate to Simulations',
        severity: 'High',
        description: 'Could not find Simulations navigation link',
        error: navError.message
      });
      testReport.steps.push({
        step: 4,
        action: 'Navigate to Simulations',
        status: 'Failed',
        error: navError.message,
        timestamp: new Date().toISOString()
      });

      // Try direct URL
      console.log('   🔄 Trying direct URL: http://localhost:3000/simulations');
      await driver.get('http://localhost:3000/simulations');
      await driver.sleep(2000);
      
      const directNavScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot-05-direct-simulations.png', directNavScreenshot, 'base64');
      console.log('   ✓ Screenshot saved: screenshot-05-direct-simulations.png');
    }

    // Step 4: Look for "Start Simulation" or "New Simulation" button
    console.log('🎬 Looking for Start Simulation button...');
    
    try {
      // Get page source to analyze
      const pageSource = await driver.getPageSource();
      fs.writeFileSync('page-source-simulations.html', pageSource);
      console.log('   ✓ Page source saved: page-source-simulations.html');

      // Try multiple possible selectors
      const possibleSelectors = [
        "//button[contains(text(), 'Start')]",
        "//button[contains(text(), 'New')]",
        "//button[contains(text(), 'Create')]",
        "//button[contains(text(), 'Run')]",
        "//a[contains(text(), 'Start')]",
        "//a[contains(text(), 'New')]",
        "button[class*='start']",
        "button[class*='new']",
        "button[class*='create']"
      ];

      let startButton = null;
      let usedSelector = null;

      for (const selector of possibleSelectors) {
        try {
          if (selector.startsWith('//')) {
            startButton = await driver.findElement(By.xpath(selector));
          } else {
            startButton = await driver.findElement(By.css(selector));
          }
          usedSelector = selector;
          console.log(`   ✓ Found button using selector: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!startButton) {
        throw new Error('Could not find Start Simulation button with any known selector');
      }

      // Take screenshot before clicking
      const beforeStartScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot-06-before-start.png', beforeStartScreenshot, 'base64');
      console.log('   ✓ Screenshot saved: screenshot-06-before-start.png');

      // Click the button
      console.log('🖱️  Clicking Start Simulation button...');
      await startButton.click();
      await driver.sleep(2000);

      // Take screenshot after clicking
      const afterStartScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot-07-after-start-click.png', afterStartScreenshot, 'base64');
      console.log('   ✓ Screenshot saved: screenshot-07-after-start-click.png');

      // Check for errors or modal
      const bodyTextAfterClick = await driver.findElement(By.tagName('body')).getText();
      
      // Save the body text for analysis
      fs.writeFileSync('page-text-after-start-click.txt', bodyTextAfterClick);
      console.log('   ✓ Page text saved: page-text-after-start-click.txt');

      // Analyze for common error patterns
      const errorPatterns = [
        { pattern: /error/i, severity: 'High' },
        { pattern: /failed/i, severity: 'High' },
        { pattern: /not found/i, severity: 'Medium' },
        { pattern: /invalid/i, severity: 'Medium' },
        { pattern: /cannot/i, severity: 'Medium' },
        { pattern: /undefined/i, severity: 'High' },
        { pattern: /null/i, severity: 'High' },
        { pattern: /exception/i, severity: 'Critical' },
        { pattern: /timeout/i, severity: 'High' }
      ];

      const detectedErrors = [];
      for (const { pattern, severity } of errorPatterns) {
        if (pattern.test(bodyTextAfterClick)) {
          detectedErrors.push({
            pattern: pattern.toString(),
            severity: severity
          });
        }
      }

      if (detectedErrors.length > 0) {
        console.log('   ⚠️  Detected errors after clicking Start Simulation:');
        detectedErrors.forEach(err => {
          console.log(`      - Pattern: ${err.pattern} (Severity: ${err.severity})`);
        });

        testReport.bugs.push({
          step: 'Start Simulation Click',
          severity: 'Critical',
          description: 'Errors detected after clicking Start Simulation',
          detectedErrors: detectedErrors,
          bodyContent: bodyTextAfterClick.substring(0, 500),
          screenshot: 'screenshot-07-after-start-click.png'
        });
      } else {
        console.log('   ✓ No obvious errors detected');
      }

      testReport.steps.push({
        step: 5,
        action: 'Click Start Simulation',
        usedSelector: usedSelector,
        status: 'Success',
        detectedErrors: detectedErrors,
        screenshots: ['screenshot-06-before-start.png', 'screenshot-07-after-start-click.png'],
        timestamp: new Date().toISOString()
      });

    } catch (startError) {
      console.log('   ❌ Start Simulation failed:', startError.message);
      
      // Take error screenshot
      const errorScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot-08-start-error.png', errorScreenshot, 'base64');
      console.log('   ✓ Error screenshot saved: screenshot-08-start-error.png');

      testReport.bugs.push({
        step: 'Start Simulation',
        severity: 'Critical',
        description: 'Failed to start simulation - button not found or not clickable',
        error: startError.message,
        screenshot: 'screenshot-08-start-error.png'
      });

      testReport.steps.push({
        step: 5,
        action: 'Click Start Simulation',
        status: 'Failed',
        error: startError.message,
        screenshot: 'screenshot-08-start-error.png',
        timestamp: new Date().toISOString()
      });
    }

    // Step 5: Check browser console for errors
    console.log('📋 Checking browser console for errors...');
    try {
      const logs = await driver.manage().logs().get('browser');
      const errors = logs.filter(log => log.level.name === 'SEVERE' || log.level.name === 'WARNING');
      
      if (errors.length > 0) {
        console.log(`   ⚠️  Found ${errors.length} console errors/warnings:`);
        errors.forEach((error, index) => {
          console.log(`      ${index + 1}. [${error.level.name}] ${error.message}`);
        });

        // Save console errors to file
        fs.writeFileSync('console-errors.json', JSON.stringify(errors, null, 2));
        console.log('   ✓ Console errors saved: console-errors.json');

        testReport.bugs.push({
          step: 'Browser Console Check',
          severity: 'High',
          description: `Found ${errors.length} browser console errors/warnings`,
          consoleErrors: errors.map(e => ({
            level: e.level.name,
            message: e.message
          }))
        });
      } else {
        console.log('   ✓ No browser console errors found');
      }
    } catch (logError) {
      console.log('   ⚠️  Could not retrieve browser logs:', logError.message);
    }

    testReport.status = 'Completed';
    testReport.endTime = new Date().toISOString();

  } catch (error) {
    console.log('\n❌ Test execution failed:', error.message);
    console.error(error);
    
    testReport.status = 'Failed';
    testReport.endTime = new Date().toISOString();
    testReport.fatalError = {
      message: error.message,
      stack: error.stack
    };

    // Take final error screenshot
    if (driver) {
      try {
        const fatalErrorScreenshot = await driver.takeScreenshot();
        fs.writeFileSync('screenshot-99-fatal-error.png', fatalErrorScreenshot, 'base64');
        console.log('   ✓ Fatal error screenshot saved: screenshot-99-fatal-error.png');
      } catch (e) {
        // Ignore screenshot errors
      }
    }

  } finally {
    // Generate test report
    console.log('\n📊 Generating Test Report...');
    fs.writeFileSync('simulation-test-report.json', JSON.stringify(testReport, null, 2));
    console.log('   ✓ Test report saved: simulation-test-report.json');

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Status: ${testReport.status}`);
    console.log(`Total Steps: ${testReport.steps.length}`);
    console.log(`Bugs Found: ${testReport.bugs.length}`);
    console.log(`Screenshots Captured: ${testReport.steps.filter(s => s.screenshot || s.screenshots).length}`);
    
    if (testReport.bugs.length > 0) {
      console.log('\n🐛 BUGS FOUND:');
      testReport.bugs.forEach((bug, index) => {
        console.log(`\n${index + 1}. ${bug.step} [${bug.severity}]`);
        console.log(`   Description: ${bug.description}`);
        if (bug.error) console.log(`   Error: ${bug.error}`);
      });
    }

    console.log('\n' + '='.repeat(80));

    // Close browser
    if (driver) {
      console.log('\n🔒 Closing browser...');
      await driver.quit();
      console.log('   ✓ Browser closed');
    }

    console.log('\n✅ Test execution completed!');
    console.log(`📄 Full report available in: simulation-test-report.json\n`);
  }
}

// Run the test
testSimulationJourney().catch(console.error);
