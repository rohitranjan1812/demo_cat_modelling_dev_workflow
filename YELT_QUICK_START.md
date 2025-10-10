# 🚀 Quick Start: Running 100,000 Simulations for YELT

## Prerequisites ✅
- ✅ MongoDB running
- ✅ 5,000 exposure accounts generated ($481B exposure)
- ✅ Hazard data loaded (10,000 hazards)
- ✅ Vulnerability data loaded (12,985 vulnerabilities)

---

## Option 1: Quick Test (10 Simulations, ~1 minute)

```bash
# Start backend
node src/index.js

# In another terminal, run test
node scripts/test-realistic-cat-model.js
```

**Expected Output:**
```
✅ Accounts visible in UI: 5,000
✅ Simulations with Losses: 8-10 (80-100%)
✅ Simulations with Events: 8-10 (80-100%)
💰 Avg Loss per Simulation: $20-50M
📊 Avg Events per Simulation: 5-15
```

---

## Option 2: Small YELT (1,000 Simulations, ~37 minutes)

```bash
# Start backend
node src/index.js

# In another terminal, run 1,000 simulations
node scripts/high-volume-simulation-runner.js 1000
```

**Expected Output:**
```
🚀 HIGH-VOLUME CAT SIMULATION RUNNER
Target: 1,000 simulations
Concurrency: 10 batches × 10 sims

Progress updates every batch...

🎯 SIMULATION RUN COMPLETE
  Total Simulations: 800-900 completed
  Success Rate: 80-90%
  Total Loss: $20-50B
  Total Events: 5,000-15,000

📊 Generating YELT table...
✅ YELT exported to: ./output/yelt/
```

**YELT Files Generated:**
- `./output/yelt/yelt_table.csv` - Full event loss table
- `./output/yelt/yelt_data.json` - JSON format with statistics
- `./output/yelt/yelt_summary.md` - Readable summary report

---

## Option 3: Full YELT (100,000 Simulations, ~61 hours)

```bash
# Start backend with increased resources
export NODE_OPTIONS="--max-old-space-size=8192"
node src/index.js

# In another terminal, run 100K simulations
node scripts/high-volume-simulation-runner.js 100000
```

**Expected Output:**
```
🚀 HIGH-VOLUME CAT SIMULATION RUNNER
Target: 100,000 simulations
Concurrency: 10 batches × 10 sims

📊 Batch 1000/10000 Complete
  ✅ Completed: 10,000 / 100,000 (10.0%)
  ⚡ Throughput: 27.3 sims/sec
  ⏳ Est. Remaining: 55.2 minutes

... (continues for ~61 hours) ...

🎯 SIMULATION RUN COMPLETE
  Total Simulations: 80,000-90,000 completed
  Success Rate: 80-90%
  Total Loss: $2-5 Trillion
  Total Events: 500,000-1,500,000

📊 Generating YELT table from 85,000 simulations...
✅ YELT table generated successfully!
📁 Output: ./output/yelt
```

---

## Performance Tuning for Faster Runs

### 1. Increase Concurrency

Edit `scripts/high-volume-simulation-runner.js`:
```javascript
const runner = new HighVolumeSimulationRunner({
  totalSimulations: 100000,
  concurrentBatches: 20,  // ⬆️ Increase from 10
  batchSize: 20,          // ⬆️ Increase from 10
  ...
});
```

**Impact:** 4x faster (100K sims in ~15 hours instead of 61)

### 2. Use Single-Year Simulations

```javascript
const runner = new HighVolumeSimulationRunner({
  startYear: 2024,
  endYear: 2024,  // ⬆️ Single year only
  ...
});
```

**Impact:** 2-5x faster per simulation

### 3. Optimize MongoDB

```bash
# Ensure indexes exist
mongosh cat-modeling-dev --eval "
  db.simulationruns.createIndex({ status: 1 });
  db.simulationevents.createIndex({ simulationRunId: 1 });
  db.accounts.createIndex({ createdBy: 1, status: 1 });
"
```

### 4. Run on Powerful Hardware

**Recommended:**
- CPU: 8+ cores
- RAM: 16GB+
- Storage: SSD
- Network: Fast connection

---

## Monitoring Progress

### Watch Real-Time Stats
```bash
# Terminal 1: Backend logs
node src/index.js

# Terminal 2: Simulation runner
node scripts/high-volume-simulation-runner.js 100000

# Terminal 3: Monitor database
mongosh cat-modeling-dev --eval "
  while(true) {
    print('Completed: ' + db.simulationruns.countDocuments({status: 'Completed'}));
    print('Running: ' + db.simulationruns.countDocuments({status: 'Running'}));
    sleep(5000);
  }
"
```

### Check Progress via API
```bash
curl http://localhost:3001/api/simulations/stats
```

---

## Analyzing YELT Results

### 1. View Summary Report
```bash
cat ./output/yelt/yelt_summary.md
```

### 2. Analyze CSV in Excel/Python
```python
import pandas as pd

# Load YELT
yelt = pd.read_csv('./output/yelt/yelt_table.csv')

# Top 10 worst losses
print(yelt.nlargest(10, 'Loss'))

# Loss by hazard type
print(yelt.groupby('HazardType')['Loss'].agg(['count', 'sum', 'mean']))

# 100-year return period events
rp100 = yelt[yelt['ReturnPeriod'] >= 100]
print(f"100-year RP losses: ${rp100['Loss'].sum()/1e9:.2f}B")
```

### 3. Calculate Exceedance Probability
```python
# Aggregate Annual Aggregate Loss (AAL)
aal = yelt.groupby('Year')['Loss'].sum().mean()
print(f"AAL: ${aal/1e6:.2f}M")

# Probable Maximum Loss (PML)
pml_99 = yelt['Loss'].quantile(0.99)
print(f"PML 99%: ${pml_99/1e6:.2f}M")
```

---

## Troubleshooting

### Issue: Simulations Timing Out
**Solution:** Reduce time horizon to single year
```javascript
startYear: 2024,
endYear: 2024  // Single year
```

### Issue: Too Many Failures
**Solution:** Decrease concurrency
```javascript
concurrentBatches: 5,  // Reduce from 10
batchSize: 5           // Reduce from 10
```

### Issue: Out of Memory
**Solution:** Increase Node.js memory
```bash
export NODE_OPTIONS="--max-old-space-size=8192"
node scripts/high-volume-simulation-runner.js 100000
```

### Issue: Backend Connection Refused
**Solution:** Make sure backend is running
```bash
# Start backend first
node src/index.js

# Then run simulations
node scripts/high-volume-simulation-runner.js 1000
```

---

## Success Criteria ✅

Your YELT generation is successful when:

- ✅ **80-90% success rate** for simulations
- ✅ **80-100% of completed sims** have events
- ✅ **80-100% of completed sims** have losses
- ✅ **$2-5T total loss** for 100K simulations
- ✅ **500K-1.5M total events** generated
- ✅ **YELT files** exported successfully
- ✅ **Loss distribution** follows proper curve
- ✅ **Return periods** properly distributed

---

## Next Steps After YELT Generation

1. **Load YELT into Analytics Tools**
   - Excel for basic analysis
   - Python/R for advanced statistics
   - BI tools (Tableau, Power BI) for visualization

2. **Calculate Key Metrics**
   - Annual Aggregate Loss (AAL)
   - Probable Maximum Loss (PML)
   - Value at Risk (VaR)
   - Tail Value at Risk (TVaR)

3. **Generate Exceedance Probability Curves**
   - Occurrence EP
   - Aggregate EP
   - Return period curves

4. **Portfolio Optimization**
   - Risk-adjusted pricing
   - Capital allocation
   - Reinsurance structure

---

## 🎯 Recommended Test Sequence

1. **Quick Test:** 10 simulations (1 minute) ✅
2. **Small YELT:** 1,000 simulations (37 minutes) ✅
3. **Medium YELT:** 10,000 simulations (6 hours) ⏱️
4. **Full YELT:** 100,000 simulations (61 hours) 🚀

**Start with Quick Test to validate everything works!**

---

*Ready to generate your YELT? Start with the Quick Test! 🚀*
