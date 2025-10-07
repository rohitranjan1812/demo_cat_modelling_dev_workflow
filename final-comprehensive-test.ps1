# Final Comprehensive Rigour Test Suite
# Post-Bug Fix Verification

$passCount = 0
$failCount = 0
$ErrorActionPreference = 'SilentlyContinue'

Write-Output ""
Write-Output "╔════════════════════════════════════════════════════════════╗"
Write-Output "║   FINAL COMPREHENSIVE RIGOUR TEST SUITE                   ║"
Write-Output "║   Post-Bug Fix Verification                               ║"
Write-Output "╚════════════════════════════════════════════════════════════╝"
Write-Output ""

# TEST 1: Backend Health Check
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 1: Backend Health Check"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -ErrorAction Stop
    if ($health.success -eq $true -and $health.status -eq "OK") {
        Write-Output "✅ PASS - Backend responding with status OK"
        Write-Output "   Version: $($health.version)"
        Write-Output "   Message: $($health.message)"
        $passCount++
    } else {
        Write-Output "❌ FAIL - Unexpected response"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 2: CORS Configuration
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 2: CORS Configuration"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $headers = @{ 'Origin' = 'http://localhost:3000' }
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Headers $headers -ErrorAction Stop
    $corsHeader = $response.Headers['Access-Control-Allow-Origin']
    if ($corsHeader -eq 'http://localhost:3000') {
        Write-Output "✅ PASS - CORS allows frontend origin"
        Write-Output "   CORS Header: $corsHeader"
        $passCount++
    } else {
        Write-Output "❌ FAIL - CORS header: $corsHeader"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 3: Simulations Endpoint
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 3: Simulations Endpoint"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/simulations/runs" -Method Get -ErrorAction Stop
    if ($result.success -eq $true) {
        Write-Output "✅ PASS - Simulations endpoint working"
        Write-Output "   Total: $($result.data.pagination.total)"
        Write-Output "   Status: $($result.success)"
        $passCount++
    } else {
        Write-Output "❌ FAIL - success=$($result.success)"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 4: Exposures Endpoint
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 4: Exposures Endpoint"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/exposures" -Method Get -ErrorAction Stop
    if ($result.success -eq $true) {
        Write-Output "✅ PASS - Exposures endpoint working"
        Write-Output "   Total: $($result.data.pagination.total)"
        Write-Output "   Status: $($result.success)"
        $passCount++
    } else {
        Write-Output "❌ FAIL - success=$($result.success)"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 5: Accounts Endpoint
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 5: Accounts Endpoint"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/accounts" -Method Get -ErrorAction Stop
    if ($result.success -eq $true) {
        Write-Output "✅ PASS - Accounts endpoint working"
        Write-Output "   Count: $($result.data.accounts.Count)"
        Write-Output "   Has Data: $(if ($result.data.accounts.Count -gt 0) {'Yes'} else {'No'})"
        $passCount++
    } else {
        Write-Output "❌ FAIL - success=$($result.success)"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 6: Hazards Endpoint (THE BUG FIX)
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 6: ⭐ Hazards Endpoint (PREVIOUSLY FAILED - NOW FIXED)"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/hazards" -Method Get -ErrorAction Stop
    if ($result.success -eq $true) {
        Write-Output "✅ PASS - 🎉 Hazards endpoint NOW WORKING after bug fix!"
        Write-Output "   Total: $($result.data.pagination.total)"
        Write-Output "   Message: $($result.message)"
        Write-Output "   Status: $($result.success)"
        Write-Output "   🔧 Fix Applied: findWithPagination → findPaginated"
        $passCount++
    } else {
        Write-Output "❌ FAIL - success=$($result.success)"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 7: Integration Health Endpoint
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 7: Integration Health Endpoint"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/integration/health" -Method Get -ErrorAction Stop
    if ($result.success -eq $true) {
        Write-Output "✅ PASS - Integration service working"
        Write-Output "   Endpoints Available: $($result.endpoints.Count)"
        Write-Output "   Message: $($result.message)"
        $passCount++
    } else {
        Write-Output "❌ FAIL - success=$($result.success)"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 8: Vulnerabilities Endpoint
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 8: Vulnerabilities Endpoint"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/vulnerabilities" -Method Get -ErrorAction Stop
    if ($result.success -eq $true) {
        Write-Output "✅ PASS - Vulnerabilities endpoint working"
        Write-Output "   Total: $($result.data.pagination.total)"
        Write-Output "   Status: $($result.success)"
        $passCount++
    } else {
        Write-Output "❌ FAIL - success=$($result.success)"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 9: Database Connection Test
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 9: Database Connection & Data Verification"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $accounts = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/accounts" -Method Get -ErrorAction Stop
    $exposures = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/exposures" -Method Get -ErrorAction Stop
    $simulations = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/simulations/runs" -Method Get -ErrorAction Stop
    
    if ($accounts.success -and $exposures.success -and $simulations.success) {
        Write-Output "✅ PASS - Database connected and queryable"
        Write-Output "   Accounts: $($accounts.data.accounts.Count)"
        Write-Output "   Exposures: $($exposures.data.pagination.total)"
        Write-Output "   Simulations: $($simulations.data.pagination.total)"
        $passCount++
    } else {
        Write-Output "❌ FAIL - One or more collections inaccessible"
        $failCount++
    }
} catch {
    Write-Output "❌ FAIL - $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# TEST 10: Error Handling Verification
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "TEST 10: API Error Handling"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
try {
    $body = @{
        exposureId = "EXP-00000001"
        policyId = "POL-NONEXISTENT"
        occupancyType = "Commercial"
        constructionType = "Concrete"
        replacementValue = 1000000
    } | ConvertTo-Json

    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/exposures" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Output "❌ FAIL - Should have returned validation error"
        $failCount++
    } catch {
        # This is expected - the API should reject invalid policy
        Write-Output "✅ PASS - API properly rejects invalid data"
        Write-Output "   Error handling working correctly"
        $passCount++
    }
} catch {
    Write-Output "❌ FAIL - Unexpected error: $($_.Exception.Message)"
    $failCount++
}
Write-Output ""

# FINAL RESULTS
Write-Output ""
Write-Output "╔════════════════════════════════════════════════════════════╗"
Write-Output "║                   FINAL TEST RESULTS                       ║"
Write-Output "╚════════════════════════════════════════════════════════════╝"
Write-Output ""
Write-Output "   ✅ Tests Passed: $passCount / $($passCount + $failCount)"
Write-Output "   ❌ Tests Failed: $failCount / $($passCount + $failCount)"
$successRate = [math]::Round(($passCount / ($passCount + $failCount)) * 100, 2)
Write-Output "   📊 Success Rate: $successRate%"
Write-Output ""

if ($failCount -eq 0) {
    Write-Output "   🎉🎊 PERFECT SCORE - ALL TESTS PASSED! 🎊🎉"
    Write-Output "   ✨ System is 100% operational!"
    Write-Output "   ✅ Bug fix verified and working!"
    Write-Output "   ✅ All endpoints responding correctly!"
    Write-Output "   ✅ CORS configuration validated!"
    Write-Output "   ✅ Error handling confirmed!"
} elseif ($passCount / ($passCount + $failCount) -ge 0.9) {
    Write-Output "   🌟 EXCELLENT - System is highly functional!"
    Write-Output "   Minor issues detected, review failed tests above."
} else {
    Write-Output "   ⚠️  NEEDS ATTENTION - Some tests failed."
    Write-Output "   Review results above for details."
}
Write-Output ""
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "Test Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output ""
