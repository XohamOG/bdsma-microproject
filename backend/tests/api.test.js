/**
 * Backend API Integration Test Suite
 */

const http = require('http');
const assert = require('assert');
const app = require('../src/app');

let server;
const TEST_PORT = 5099;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:${TEST_PORT}${path}`,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('[TEST] Starting Backend API Integration Tests...');
  server = app.listen(TEST_PORT);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    await test('GET /api/health returns status healthy and dataset info', async () => {
      const res = await request('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.status, 'healthy');
      assert.strictEqual(res.data.data.dataset.total_records, 14640);
    });

    // 2. Brands list
    await test('GET /api/brands returns 6 airlines with NSS and BRI', async () => {
      const res = await request('/api/brands');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.brands.length, 6);
      const first = res.data.data.brands[0];
      assert.ok('net_sentiment_score' in first);
      assert.ok('reputation_index' in first);
      assert.ok('rank' in first);
    });

    // 3. Brand deep-dive
    await test('GET /api/brands/united/reputation returns detail metrics and timeline', async () => {
      const res = await request('/api/brands/united/reputation');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.brand.name, 'United');
      assert.ok(res.data.data.metrics.total_tweets > 0);
      assert.ok(res.data.data.top_complaint_reasons.length > 0);
      assert.ok(res.data.data.timeline.length > 0);
    });

    // 4. Unknown brand 404
    await test('GET /api/brands/unknown_airline/reputation returns 404', async () => {
      const res = await request('/api/brands/unknown_airline/reputation');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.error.code, 'NOT_FOUND');
    });

    // 5. Sentiment overview
    await test('GET /api/analytics/sentiment returns distribution', async () => {
      const res = await request('/api/analytics/sentiment');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok('positive' in res.data.data.distribution);
      assert.ok('negative' in res.data.data.distribution);
      assert.ok('neutral' in res.data.data.distribution);
    });

    // 6. Trends
    await test('GET /api/analytics/trends returns daily timeline', async () => {
      const res = await request('/api/analytics/trends');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.interval, 'daily');
      assert.ok(res.data.data.timeline.length > 0);
    });

    // 7. Complaints
    await test('GET /api/analytics/complaints returns top categories', async () => {
      const res = await request('/api/analytics/complaints?limit=5');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.categories.length <= 5);
      assert.ok(res.data.data.total_negative_tweets > 0);
    });

    // 8. Brand comparison
    await test('GET /api/analytics/compare?brands=united,delta compares selected airlines', async () => {
      const res = await request('/api/analytics/compare?brands=united,delta');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.comparison.length, 2);
      assert.ok('highest_reputation' in res.data.data);
    });

    // 9. Anomalies
    await test('GET /api/analytics/anomalies returns detected surge events', async () => {
      const res = await request('/api/analytics/anomalies');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.data.anomalies));
      assert.ok(res.data.data.anomalies.length > 0);
      assert.ok(res.data.data.anomalies[0].z_score > 0);
    });

    // 10. Benchmarks
    await test('GET /api/analytics/benchmarks returns PySpark vs Pandas comparison', async () => {
      const res = await request('/api/analytics/benchmarks');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.benchmarks.length > 0);
    });

    // 11. Tweets explorer
    await test('GET /api/tweets?page=1&limit=5 returns paginated tweets', async () => {
      const res = await request('/api/tweets?page=1&limit=5');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.tweets.length, 5);
      assert.strictEqual(res.data.data.pagination.page, 1);
      assert.strictEqual(res.data.data.pagination.limit, 5);
      assert.ok(res.data.data.pagination.total > 10000);
    });

    // 12. Nonexistent route 404
    await test('GET /api/nonexistent returns 404 with error envelope', async () => {
      const res = await request('/api/nonexistent');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.error.code, 'NOT_FOUND');
    });

    console.log(`\n[TEST SUMMARY] ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('[FATAL TEST ERROR]:', err);
  if (server) server.close();
  process.exit(1);
});
