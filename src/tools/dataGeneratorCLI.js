1  |#!/usr/bin/env node
2  |/**
3  | * CLI Tool for Data Generation
4  | * Usage: node src/tools/dataGeneratorCLI.js [options]
5  | */
6  |
7  |const DataGeneratorService = require('./DataGeneratorService');
8  |const mongoose = require('mongoose');
9  |
10  |const args = process.argv.slice(2);
11  |
12  |const config = {
13  |  numHazards: 100,
14  |  numVulnerabilities: 50,
15  |  numAccounts: 20,
16  |  numLocationsPerAccount: 10,
17  |  numPoliciesPerAccount: 5,
18  |  regions: [],
19  |  perils: [],
20  |  linkEntities: true,
21  |  saveToDatabase: true
22  |};
23  |
24  |function parseArgs() {
25  |  for (let i = 0; i < args.length; i++) {
26  |    const arg = args[i];
27  |    switch (arg) {
28  |      case '--hazards':
29  |        config.numHazards = parseInt(args[++i]);
30  |        break;
31  |      case '--vulnerabilities':
32  |        config.numVulnerabilities = parseInt(args[++i]);
33  |        break;
34  |      case '--accounts':
35  |        config.numAccounts = parseInt(args[++i]);
36  |        break;
37  |      case '--locations':
38  |        config.numLocationsPerAccount = parseInt(args[++i]);
39  |        break;
40  |      case '--policies':
41  |        config.numPoliciesPerAccount = parseInt(args[++i]);
42  |        break;
43  |      case '--regions':
44  |        config.regions = args[++i].split(',');
45  |        break;
46  |      case '--perils':
47  |        config.perils = args[++i].split(',');
48  |        break;
49  |      case '--no-link':
50  |        config.linkEntities = false;
51  |        break;
52  |      case '--no-save':
53  |        config.saveToDatabase = false;
54  |        break;
55  |      case '--help':
56  |        printHelp();
57  |        process.exit(0);
58  |      default:
59  |        if (arg.startsWith('--')) {
60  |          console.error(`Unknown option: ${arg}`);
61  |          printHelp();
62  |          process.exit(1);
63  |        }
64  |    }
65  |  }
66  |}
67  |
68  |function printHelp() {
69  |  console.log(`
70  |CAT Modeling Data Generator CLI
71  |
72  |Usage: node src/tools/dataGeneratorCLI.js [options]
73  |
74  |Options:
75  |  --hazards <number>              Number of hazards to generate (default: 100)
76  |  --vulnerabilities <number>      Number of vulnerabilities to generate (default: 50)
77  |  --accounts <number>             Number of accounts to generate (default: 20)
78  |  --locations <number>            Locations per account (default: 10)
79  |  --policies <number>             Policies per account (default: 5)
80  |  --regions <regions>             Comma-separated regions (default: all)
81  |                                  Options: North America, Europe, Asia Pacific, Latin America, Middle East, Africa
82  |  --perils <perils>               Comma-separated perils (default: all)
83  |                                  Options: Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami
84  |  --no-link                       Don't link entities together
85  |  --no-save                       Don't save to database (return data only)
86  |  --help                          Show this help message
87  |
88  |Examples:
89  |  # Generate default dataset
90  |  node src/tools/dataGeneratorCLI.js
91  |
92  |  # Generate small dataset for testing
93  |  node src/tools/dataGeneratorCLI.js --hazards 10 --vulnerabilities 5 --accounts 3
94  |
95  |  # Generate for specific regions
96  |  node src/tools/dataGeneratorCLI.js --regions "North America,Europe" --perils "Earthquake,Hurricane"
97  |
98  |  # Generate large dataset
99  |  node src/tools/dataGeneratorCLI.js --hazards 1000 --vulnerabilities 500 --accounts 100 --locations 20
100  |`);
101  |}
102  |
103  |async function connectDatabase() {
104  |  try {
105  |    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modelling';
106  |    await mongoose.connect(dbUrl);
107  |    console.log('✓ Connected to MongoDB');
108  |  } catch (error) {
109  |    console.error('✗ Database connection failed:', error.message);
110  |    process.exit(1);
111  |  }
112  |}
113  |
114  |async function disconnectDatabase() {
115  |  await mongoose.disconnect();
116  |  console.log('✓ Disconnected from MongoDB');
117  |}
118  |
119  |async function main() {
120  |  parseArgs();
121  |
122  |  console.log('\n╔════════════════════════════════════════════════════════════╗');
123  |  console.log('║     CAT MODELING DATA GENERATOR                            ║');
124  |  console.log('╚════════════════════════════════════════════════════════════╝\n');
125  |
126  |  console.log('Configuration:');
127  |  console.log(`  Hazards: ${config.numHazards}`);
128  |  console.log(`  Vulnerabilities: ${config.numVulnerabilities}`);
129  |  console.log(`  Accounts: ${config.numAccounts}`);
130  |  console.log(`  Locations per account: ${config.numLocationsPerAccount}`);
131  |  console.log(`  Policies per account: ${config.numPoliciesPerAccount}`);
132  |  console.log(`  Regions: ${config.regions.length > 0 ? config.regions.join(', ') : 'All'}`);
133  |  console.log(`  Perils: ${config.perils.length > 0 ? config.perils.join(', ') : 'All'}`);
134  |  console.log(`  Link entities: ${config.linkEntities}`);
135  |  console.log(`  Save to database: ${config.saveToDatabase}`);
136  |  console.log('');
137  |
138  |  if (config.saveToDatabase) {
139  |    await connectDatabase();
140  |  }
141  |
142  |  try {
143  |    const generator = new DataGeneratorService();
144  |    const result = await generator.generateComprehensiveDataset(config);
145  |
146  |    console.log('\n╔════════════════════════════════════════════════════════════╗');
147  |    console.log('║     GENERATION SUMMARY                                     ║');
148  |    console.log('╚════════════════════════════════════════════════════════════╝\n');
149  |
150  |    console.log(`Duration: ${result.duration}`);
151  |    console.log('');
152  |    console.log('Generated Entities:');
153  |    console.log(`  ✓ Hazards: ${result.summary.hazards}`);
154  |    console.log(`  ✓ Vulnerabilities: ${result.summary.vulnerabilities}`);
155  |    console.log(`  ✓ Accounts: ${result.summary.accounts}`);
156  |    console.log(`  ✓ Locations: ${result.summary.locations}`);
157  |    console.log(`  ✓ Policies: ${result.summary.policies}`);
158  |    console.log(`  ✓ Hazard Zones: ${result.summary.hazardZones}`);
159  |    console.log('');
160  |
161  |    if (config.saveToDatabase) {
162  |      console.log('✅ All data saved to database successfully!');
163  |    } else {
164  |      console.log('ℹ️  Data generated but not saved to database (use without --no-save to persist)');
165  |    }
166  |
167  |    console.log('\n✨ Data generation completed successfully!\n');
168  |  } catch (error) {
169  |    console.error('\n❌ Error during data generation:', error.message);
170  |    console.error(error.stack);
171  |    process.exit(1);
172  |  } finally {
173  |    if (config.saveToDatabase) {
174  |      await disconnectDatabase();
175  |    }
176  |  }
177  |}
178  |
179  |main();
180  |
