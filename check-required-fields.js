const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');
const Location = require('./src/models/Location');
const Exposure = require('./src/models/Exposure');
const Policy = require('./src/models/Policy');

const models = {
  Hazard,
  Vulnerability,
  Location,
  Exposure,
  Policy
};

console.log('Required fields for each model:\n' + '='.repeat(80));

Object.keys(models).forEach(modelName => {
  console.log(`\n${modelName}:`);
  const Model = models[modelName];
  const schema = Model.schema;
  
  const required = [];
  Object.keys(schema.paths).forEach(path => {
    const schemaType = schema.paths[path];
    if (schemaType.isRequired) {
      const hasDefault = schemaType.defaultValue !== undefined;
      required.push(`${path}${hasDefault ? ' (has default)' : ''}`);
    }
  });
  
  if (required.length > 0) {
    required.forEach(field => console.log(`  ✓ ${field}`));
  } else {
    console.log('  (no required fields)');
  }
});
