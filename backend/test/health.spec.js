const test = require('node:test');
const assert = require('node:assert');
const { HealthController } = require('../dist/src/health/health.controller');

test('HealthController should return status ok', () => {
  const controller = new HealthController();
  const response = controller.check();

  assert.strictEqual(response.status, 'ok');
  assert.strictEqual(response.service, 'fieldops-backend');
  assert.ok(response.timestamp, 'timestamp should be present');
});
