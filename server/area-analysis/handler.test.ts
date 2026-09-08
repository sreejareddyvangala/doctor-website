import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  ApiErrorBody,
  AreaAnalysisResponse,
  CoveredCitiesResponse,
} from '../../shared/area-analysis/contracts.ts';
import { createMockAreaDataSource } from './data-sources/mock/index.ts';
import type { AreaDataSource } from './data-sources/types.ts';
import { UpstreamError } from './errors.ts';
import { createAreaAnalysisHandler } from './handler.ts';

const dataSource = createMockAreaDataSource();
const handler = createAreaAnalysisHandler({ dataSource }, { logger: { error: () => {} } });
const BASE = 'http://test.local/api/area-analysis';

function post(body: unknown, init: RequestInit = {}) {
  return handler(
    new Request(BASE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      ...init,
    }),
  );
}

describe('POST /api/area-analysis', () => {
  it('ranks areas for a covered city', async () => {
    const response = await post({ categoryId: 'gym', city: 'Hyderabad' });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /application\/json/);

    const data = (await response.json()) as AreaAnalysisResponse;
    assert.equal(data.status, 'ok');
    if (data.status !== 'ok') return;

    assert.equal(data.query.city, 'Hyderabad');
    assert.equal(data.query.categoryLabel, 'Gym / Fitness Studio');
    assert.ok(data.results.length > 5);
    assert.equal(data.totals.analyzed, data.results.length);
    assert.equal(data.totals.high + data.totals.medium + data.totals.low, data.results.length);
    assert.equal(data.dataSource.isSample, true);
    assert.ok(!Number.isNaN(Date.parse(data.analyzedAt)));

    data.results.forEach((result, index) => {
      assert.equal(result.rank, index + 1);
      if (index > 0) assert.ok(data.results[index - 1].score >= result.score);
      assert.ok(result.explanation.length > 20, `${result.areaName} has no explanation`);
      assert.ok(['high', 'medium', 'low'].includes(result.potential));
    });
  });

  it('puts the IT corridor at the top for gyms in the sample data', async () => {
    const response = await post({ categoryId: 'gym', city: 'Hyderabad' });
    const data = (await response.json()) as AreaAnalysisResponse;
    if (data.status !== 'ok') assert.fail('expected ok');
    assert.equal(data.results[0].areaName, 'Gachibowli');
    assert.equal(data.results[0].potential, 'high');
  });

  it('resolves aliases and casing to the canonical city', async () => {
    const response = await post({ categoryId: 'cafe', city: '  bangalore ' });
    const data = (await response.json()) as AreaAnalysisResponse;
    assert.equal(data.status, 'ok');
    assert.equal(data.query.city, 'Bengaluru');
  });

  it('reports no_coverage with alternatives for an unknown city', async () => {
    const response = await post({ categoryId: 'gym', city: 'Atlantis' });
    assert.equal(response.status, 200);
    const data = (await response.json()) as AreaAnalysisResponse;
    assert.equal(data.status, 'no_coverage');
    if (data.status !== 'no_coverage') return;
    assert.equal(data.query.city, 'Atlantis');
    assert.ok(data.availableCities.includes('Hyderabad'));
  });

  it('rejects invalid JSON', async () => {
    const response = await post('{not json');
    assert.equal(response.status, 400);
    const body = (await response.json()) as ApiErrorBody;
    assert.equal(body.error.code, 'INVALID_JSON');
  });

  it('rejects invalid fields with per-field issues', async () => {
    const response = await post({ categoryId: 'spaceport', city: 'H' });
    assert.equal(response.status, 400);
    const body = (await response.json()) as ApiErrorBody;
    assert.equal(body.error.code, 'INVALID_REQUEST');
    assert.equal(body.error.issues?.length, 2);
  });

  it('rejects GET on the analysis endpoint', async () => {
    const response = await handler(new Request(BASE));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'POST');
  });
});

describe('GET /api/area-analysis/cities', () => {
  it('lists covered cities with the data source', async () => {
    const response = await handler(new Request(`${BASE}/cities`));
    assert.equal(response.status, 200);
    const data = (await response.json()) as CoveredCitiesResponse;
    assert.ok(data.cities.includes('Hyderabad'));
    assert.equal(data.dataSource.id, 'mock');
  });
});

describe('routing', () => {
  it('returns 404 for unknown sub-paths and paths outside the base', async () => {
    for (const url of [`${BASE}/nope`, 'http://test.local/api/other', 'http://test.local/']) {
      const response = await handler(new Request(url));
      assert.equal(response.status, 404, url);
      const body = (await response.json()) as ApiErrorBody;
      assert.equal(body.error.code, 'NOT_FOUND');
    }
  });

  it('never caches responses', async () => {
    const response = await handler(new Request(`${BASE}/cities`));
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
});

describe('upstream failures', () => {
  it('maps an UpstreamError to 503 with a retry hint', async () => {
    const failing: AreaDataSource = {
      info: dataSource.info,
      listCities: async () => [],
      getCityAreas: async () => {
        throw new UpstreamError('OpenStreetMap Overpass', 'too busy');
      },
    };
    const failingHandler = createAreaAnalysisHandler(
      { dataSource: failing },
      { logger: { error: () => {} } },
    );

    const response = await failingHandler(
      new Request(BASE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ categoryId: 'gym', city: 'Hyderabad' }),
      }),
    );

    assert.equal(response.status, 503);
    assert.equal(response.headers.get('retry-after'), '60');
    const body = (await response.json()) as ApiErrorBody;
    assert.equal(body.error.code, 'UPSTREAM_UNAVAILABLE');
    assert.match(body.error.message, /OpenStreetMap Overpass/);
  });
});

describe('CORS', () => {
  const cors = createAreaAnalysisHandler(
    { dataSource },
    { allowedOrigins: ['https://app.example.com'] },
  );

  it('answers preflight for an allowed origin', async () => {
    const response = await cors(
      new Request(BASE, { method: 'OPTIONS', headers: { origin: 'https://app.example.com' } }),
    );
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://app.example.com');
    assert.match(response.headers.get('access-control-allow-methods') ?? '', /POST/);
  });

  it('omits CORS headers for other origins and when none are configured', async () => {
    const other = await cors(
      new Request(`${BASE}/cities`, { headers: { origin: 'https://evil.example.com' } }),
    );
    assert.equal(other.headers.get('access-control-allow-origin'), null);

    const none = await handler(
      new Request(`${BASE}/cities`, { headers: { origin: 'https://app.example.com' } }),
    );
    assert.equal(none.headers.get('access-control-allow-origin'), null);
  });
});
