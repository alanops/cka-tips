import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(readFileSync('./tip-schema.json', 'utf8'));
const tips = JSON.parse(readFileSync('./tips.json', 'utf8'));

const validate = ajv.compile(schema);
if (!validate(tips)) {
  console.error('tips.json failed schema validation:');
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}

const ids = new Set();
for (const tip of tips) {
  if (ids.has(tip.id)) {
    console.error(`duplicate tip id: ${tip.id}`);
    process.exit(1);
  }
  ids.add(tip.id);
}

console.log(`OK: ${tips.length} tips valid`);
