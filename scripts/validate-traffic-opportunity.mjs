import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const opportunity = JSON.parse(readFileSync(resolve(root, 'ops/traffic-opportunity.example.json'), 'utf8'));

const required = [
  'id',
  'detected_at',
  'topic',
  'source_urls',
  'confidence',
  'audience_intent',
  'target_vcf_destination',
  'recommended_asset',
  'conversion_goal',
  'claude_brief',
  'codex_task',
  'status',
  'approval_required'
];

const failures = required.filter((field) => {
  const value = opportunity[field];
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
});

if (!Array.isArray(opportunity.source_urls) || opportunity.source_urls.some((url) => !/^https:\/\//.test(url))) {
  if (!failures.includes('source_urls')) failures.push('source_urls');
}

const validConfidence = new Set(['high', 'medium', 'low']);
if (opportunity.confidence && !validConfidence.has(opportunity.confidence)) failures.push('confidence');

const validStatus = new Set(['detected', 'verified', 'briefed', 'building', 'review', 'approved', 'published', 'measuring', 'closed', 'rejected']);
if (opportunity.status && !validStatus.has(opportunity.status)) failures.push('status');

if (typeof opportunity.approval_required !== 'boolean' && opportunity.approval_required !== undefined) failures.push('approval_required');

if (failures.length) {
  console.error(`Traffic opportunity validation failed: ${[...new Set(failures)].join(', ')}`);
  process.exit(1);
}

console.log(`Traffic opportunity validation passed: ${opportunity.id}`);
