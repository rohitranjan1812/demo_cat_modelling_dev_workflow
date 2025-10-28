1  |/**
2  | * Data Generator Controller
3  | * REST API endpoints for data generation
4  | */
5  |
6  |const DataGeneratorService = require('../tools/DataGeneratorService');
7  |
8  |class DataGeneratorController {
9  |  constructor() {
10  |    this.generator = new DataGeneratorService();
11  |    
12  |    this.generateData = this.generateData.bind(this);
13  |    this.generateHazards = this.generateHazards.bind(this);
14  |    this.generateVulnerabilities = this.generateVulnerabilities.bind(this);
15  |    this.generateAccounts = this.generateAccounts.bind(this);
16  |    this.getGeneratorStatus = this.getGeneratorStatus.bind(this);
17  |  }
18  |
19  |  /**
20  |   * Generate comprehensive dataset
21  |   * POST /api/data-generator/generate
22  |   */
23  |  async generateData(req, res) {
24  |    try {
25  |      const config = {
26  |        numHazards: parseInt(req.body.numHazards) || 100,
27  |        numVulnerabilities: parseInt(req.body.numVulnerabilities) || 50,
28  |        numAccounts: parseInt(req.body.numAccounts) || 20,
29  |        numLocationsPerAccount: parseInt(req.body.numLocationsPerAccount) || 10,
30  |        numPoliciesPerAccount: parseInt(req.body.numPoliciesPerAccount) || 5,
31  |        regions: req.body.regions || [],
32  |        perils: req.body.perils || [],
33  |        linkEntities: req.body.linkEntities !== false,
34  |        saveToDatabase: req.body.saveToDatabase !== false
35  |      };
36  |
37  |      const result = await this.generator.generateComprehensiveDataset(config);
38  |
39  |      res.status(201).json({
40  |        success: true,
41  |        message: 'Data generated successfully',
42  |        data: {
43  |          duration: result.duration,
44  |          summary: result.summary
45  |        }
46  |      });
47  |    } catch (error) {
48  |      console.error('Error in generateData:', error);
49  |      res.status(500).json({
50  |        success: false,
51  |        message: 'Failed to generate data',
52  |        error: error.message
53  |      });
54  |    }
55  |  }
56  |
57  |  /**
58  |   * Generate hazards only
59  |   * POST /api/data-generator/hazards
60  |   */
61  |  async generateHazards(req, res) {
62  |    try {
63  |      const count = parseInt(req.body.count) || 10;
64  |      const options = {
65  |        regions: req.body.regions || [],
66  |        perils: req.body.perils || [],
67  |        startYear: parseInt(req.body.startYear) || 2020,
68  |        endYear: parseInt(req.body.endYear) || 2024
69  |      };
70  |
71  |      const hazards = await this.generator.generateHazards(count, options);
72  |
73  |      res.status(201).json({
74  |        success: true,
75  |        message: `Generated ${hazards.length} hazards`,
76  |        data: hazards
77  |      });
78  |    } catch (error) {
79  |      console.error('Error in generateHazards:', error);
80  |      res.status(500).json({
81  |        success: false,
82  |        message: 'Failed to generate hazards',
83  |        error: error.message
84  |      });
85  |    }
86  |  }
87  |
88  |  /**
89  |   * Generate vulnerabilities only
90  |   * POST /api/data-generator/vulnerabilities
91  |   */
92  |  async generateVulnerabilities(req, res) {
93  |    try {
94  |      const count = parseInt(req.body.count) || 10;
95  |      const options = {
96  |        regions: req.body.regions || [],
97  |        perils: req.body.perils || []
98  |      };
99  |
100  |      const vulnerabilities = await this.generator.generateVulnerabilities(count, options);
101  |
102  |      res.status(201).json({
103  |        success: true,
104  |        message: `Generated ${vulnerabilities.length} vulnerabilities`,
105  |        data: vulnerabilities
106  |      });
107  |    } catch (error) {
108  |      console.error('Error in generateVulnerabilities:', error);
109  |      res.status(500).json({
110  |        success: false,
111  |        message: 'Failed to generate vulnerabilities',
112  |        error: error.message
113  |      });
114  |    }
115  |  }
116  |
117  |  /**
118  |   * Generate accounts only
119  |   * POST /api/data-generator/accounts
120  |   */
121  |  async generateAccounts(req, res) {
122  |    try {
123  |      const count = parseInt(req.body.count) || 10;
124  |      const options = {
125  |        regions: req.body.regions || []
126  |      };
127  |
128  |      const accounts = await this.generator.generateAccounts(count, options);
129  |
130  |      res.status(201).json({
131  |        success: true,
132  |        message: `Generated ${accounts.length} accounts`,
133  |        data: accounts
134  |      });
135  |    } catch (error) {
136  |      console.error('Error in generateAccounts:', error);
137  |      res.status(500).json({
138  |        success: false,
139  |        message: 'Failed to generate accounts',
140  |        error: error.message
141  |      });
142  |    }
143  |  }
144  |
145  |  /**
146  |   * Get generator status and configuration
147  |   * GET /api/data-generator/status
148  |   */
149  |  async getGeneratorStatus(req, res) {
150  |    try {
151  |      const status = {
152  |        counters: this.generator.counters,
153  |        availableRegions: Object.keys(this.generator.regionConfigs),
154  |        availablePerils: Object.keys(this.generator.perilConfigs),
155  |        generationConfig: this.generator.generationConfig
156  |      };
157  |
158  |      res.json({
159  |        success: true,
160  |        data: status
161  |      });
162  |    } catch (error) {
163  |      console.error('Error in getGeneratorStatus:', error);
164  |      res.status(500).json({
165  |        success: false,
166  |        message: 'Failed to get generator status',
167  |        error: error.message
168  |      });
169  |    }
170  |  }
171  |}
172  |
173  |module.exports = new DataGeneratorController();
174  |
