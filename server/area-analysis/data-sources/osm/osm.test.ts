import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { UpstreamError } from '../../errors.ts';
import { toIndex } from './aggregate.ts';
import { createJsonCache } from './cache.ts';
import { classifyPoi } from './classify.ts';
import { createOsmAreaDataSource, type OsmAreaDataSourceOptions } from './index.ts';

/* ---------- fixtures ---------- */

const ALPHA = { lat: 17.4, lon: 78.4 };
const BETA = { lat: 17.45, lon: 78.45 }; // ~7.5 km from Alpha
const GAMMA = { lat: 17.5, lon: 78.5 };

const nominatimFixture = [
  {
    osm_type: 'relation',
    osm_id: 12345,
    lat: '17.4',
    lon: '78.4',
    category: 'boundary',
    type: 'administrative',
    addresstype: 'city',
    name: 'Testville',
    display_name: 'Testville, Test State, India',
    boundingbox: ['17.2', '17.6', '78.2', '78.6'],
  },
];

function node(id: number, lat: number, lon: number, tags: Record<string, string>) {
  return { type: 'node', id, lat, lon, tags };
}

/** `count` points spread within ~300 m of a centre, all carrying `tags`. */
function around(
  centre: { lat: number; lon: number },
  count: number,
  tags: Record<string, string>,
  firstId: number,
) {
  return Array.from({ length: count }, (_, i) =>
    node(firstId + i, centre.lat + (i % 3) * 0.001, centre.lon + Math.floor(i / 3) * 0.001, tags),
  );
}

const localitiesFixture = {
  elements: [
    node(1, ALPHA.lat, ALPHA.lon, { place: 'suburb', name: 'Alpha' }),
    node(2, BETA.lat, BETA.lon, { place: 'suburb', name: 'Beta' }),
    node(3, GAMMA.lat, GAMMA.lon, { place: 'suburb', name: 'Gamma' }),
    // Duplicate of Alpha as a boundary way with different casing: must be merged.
    {
      type: 'way',
      id: 4,
      center: { lat: ALPHA.lat + 0.002, lon: ALPHA.lon },
      tags: { place: 'suburb', name: 'ALPHA' },
    },
    // Unnamed place: ignored.
    node(5, ALPHA.lat, ALPHA.lon + 0.01, { place: 'suburb' }),
  ],
};

const poisFixture = {
  elements: [
    ...around(ALPHA, 6, { amenity: 'restaurant' }, 100),
    ...around(ALPHA, 2, { leisure: 'fitness_centre' }, 200),
    ...around(ALPHA, 3, { office: 'company' }, 300),
    ...around(ALPHA, 1, { amenity: 'college' }, 400),
    ...around(ALPHA, 1, { railway: 'station', public_transport: 'station' }, 500),
    ...around(ALPHA, 1, { amenity: 'school' }, 600),
    ...around(ALPHA, 1, { shop: 'clothes' }, 700),
    ...around(ALPHA, 1, { shop: 'vacant' }, 800),
    ...around(BETA, 3, { amenity: 'cafe' }, 900),
    ...around(BETA, 1, { leisure: 'fitness_centre' }, 1000),
    ...around(BETA, 1, { shop: 'supermarket' }, 1100),
    ...around(BETA, 1, { shop: 'beauty' }, 1200),
    ...around(BETA, 1, { amenity: 'kindergarten' }, 1300),
    ...around(BETA, 1, { leisure: 'playground' }, 1400),
    ...around(GAMMA, 1, { shop: 'convenience' }, 1500),
  ],
};

/* ---------- fake transport ---------- */

interface Call {
  url: string;
  query?: string;
}

interface FakeHandlers {
  nominatim?: (url: string) => unknown;
  /** Receives the decoded Overpass query and the 1-based index of this Overpass call. */
  overpass?: (query: string, overpassCallIndex: number) => unknown | Response;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function createFakeFetch(handlers: FakeHandlers = {}) {
  const calls: Call[] = [];
  let overpassCalls = 0;

  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url.includes('/search?')) {
      calls.push({ url });
      return jsonResponse(handlers.nominatim ? handlers.nominatim(url) : nominatimFixture);
    }

    const query = decodeURIComponent(String(init?.body ?? '').replace(/^data=/, ''));
    calls.push({ url, query });
    overpassCalls += 1;

    const defaultBody = query.includes('"place"') ? localitiesFixture : poisFixture;
    const result = handlers.overpass ? handlers.overpass(query, overpassCalls) : defaultBody;
    return result instanceof Response ? result : jsonResponse(result);
  };

  return { fetchImpl, calls };
}

function createSource(
  fetchImpl: typeof fetch,
  overrides: Partial<OsmAreaDataSourceOptions> = {},
) {
  return createOsmAreaDataSource({
    overpassUrl: 'http://overpass.test/api/interpreter',
    nominatimUrl: 'http://nominatim.test',
    userAgent: 'AreaScout tests',
    countryCodes: [],
    cacheTtlMs: 60 * 60 * 1000,
    catchmentRadiusM: 1500,
    maxAreas: 60,
    minPois: 5,
    suggestedCities: ['Hyderabad'],
    fetch: fetchImpl,
    minIntervalMs: 0,
    retryDelaysMs: [0],
    rateLimitDelaysMs: [0],
    ...overrides,
  });
}

/* ---------- tests ---------- */

describe('classifyPoi', () => {
  it('maps tags to competition buckets and signal counters', () => {
    assert.deepEqual(classifyPoi({ amenity: 'restaurant' })?.buckets, ['food']);
    assert.deepEqual(classifyPoi({ shop: 'clothes' })?.buckets, ['retail']);
    assert.deepEqual(classifyPoi({ shop: 'bakery' })?.buckets, ['food']);
    assert.deepEqual(classifyPoi({ amenity: 'dentist' })?.buckets, ['healthcare']);
    assert.deepEqual(classifyPoi({ leisure: 'fitness_centre', sport: 'yoga' })?.buckets, [
      'fitness',
    ]);

    const coworking = classifyPoi({ office: 'coworking' });
    assert.deepEqual(coworking?.buckets, ['services']);
    assert.equal(coworking?.office, true);

    const station = classifyPoi({ railway: 'station' });
    assert.deepEqual(station?.buckets, []);
    assert.equal(station?.transit, true);

    assert.equal(classifyPoi({ amenity: 'college' })?.higherEducation, true);
    assert.equal(classifyPoi({ amenity: 'kindergarten' })?.school, true);
  });

  it('ignores places that are not businesses', () => {
    assert.equal(classifyPoi({ shop: 'vacant' }), null);
    assert.equal(classifyPoi({ natural: 'tree' }), null);
    assert.equal(classifyPoi({}), null);
  });
});

describe('toIndex', () => {
  it('ranks counts within the city as 0-100 percentiles', () => {
    assert.deepEqual(toIndex([]), []);
    assert.deepEqual(toIndex([0, 0, 0]), [0, 0, 0]);
    assert.deepEqual(toIndex([7]), [100]);
    assert.deepEqual(toIndex([10, 5]), [100, 0]);
    assert.deepEqual(toIndex([3, 3, 9]), [25, 25, 100], 'ties share a rank');
    assert.deepEqual(toIndex([0, 3, 3, 9]), [0, 50, 50, 100], 'zero counts stay zero');
  });
});

describe('OpenStreetMap data source', () => {
  it('builds ranked-ready areas from localities and mapped places', async () => {
    const { fetchImpl, calls } = createFakeFetch();
    const source = createSource(fetchImpl);

    const result = await source.getCityAreas('Testville');
    assert.ok(result, 'expected a result');
    assert.equal(result.city, 'Testville');
    assert.equal(calls.length, 3, 'one Nominatim and two Overpass requests');

    assert.deepEqual(
      result.areas.map((a) => a.id),
      ['alpha', 'beta'],
      'Gamma has too little data and duplicates are merged',
    );
    assert.equal(result.skippedAreas, 1);

    const [alpha, beta] = result.areas;
    assert.equal(alpha.competition.food, 100);
    assert.equal(beta.competition.food, 0);
    assert.equal(alpha.competition.fitness, 100);
    assert.equal(alpha.youngProfessionals, 100);
    assert.equal(beta.youngProfessionals, 0);
    assert.equal(alpha.students, 100);
    assert.equal(beta.students, 0);
    assert.equal(beta.families, 100, 'kindergarten plus playground beats one school');
    assert.equal(alpha.footfall, 100);
    assert.ok(alpha.traits.includes('Transit connected'));
    assert.ok(alpha.zone?.endsWith('Testville'));

    // OpenStreetMap cannot supply these; they must be absent, not faked.
    assert.equal(alpha.population, undefined);
    assert.equal(alpha.affluence, undefined);
    assert.equal(alpha.growth, undefined);

    const coverage = result.coverage ?? [];
    assert.equal(coverage.find((c) => c.signal === 'competition')?.provenance, 'measured');
    assert.equal(coverage.find((c) => c.signal === 'population')?.provenance, 'unavailable');
    assert.ok(result.notes?.[0]?.includes('mapped places'));
  });

  it('serves repeat and concurrent requests from cache and in-flight sharing', async () => {
    const { fetchImpl, calls } = createFakeFetch();
    const source = createSource(fetchImpl);

    const [a, b] = await Promise.all([
      source.getCityAreas('Testville'),
      source.getCityAreas('  testville '),
    ]);
    assert.equal(a?.city, 'Testville');
    assert.equal(b?.city, 'Testville');
    assert.equal(calls.length, 3, 'concurrent lookups share one fetch');

    await source.getCityAreas('TESTVILLE');
    assert.equal(calls.length, 3, 'a repeat lookup is served from cache');
  });

  it('reuses a downloaded city for a different spelling after one Nominatim lookup', async () => {
    const { fetchImpl, calls } = createFakeFetch();
    const source = createSource(fetchImpl);

    await source.getCityAreas('Testville');
    assert.equal(calls.length, 3);

    const alias = await source.getCityAreas('Testville City');
    assert.equal(alias?.city, 'Testville');
    assert.equal(calls.length, 4, 'only Nominatim was asked; no new Overpass download');

    await source.getCityAreas('testville city');
    assert.equal(calls.length, 4, 'the alias itself is now cached');
  });

  it('prefers the city itself over the district that shares its name', async () => {
    const { fetchImpl, calls } = createFakeFetch({
      nominatim: () => [
        {
          osm_type: 'relation',
          osm_id: 555,
          lat: '18.5',
          lon: '73.9',
          category: 'boundary',
          type: 'administrative',
          addresstype: 'state_district',
          name: 'Pune District',
          display_name: 'Pune District, Maharashtra, India',
          boundingbox: ['17.9', '19.4', '73.3', '75.2'],
        },
        {
          osm_type: 'node',
          osm_id: 777,
          lat: '18.52',
          lon: '73.86',
          category: 'place',
          type: 'city',
          addresstype: 'city',
          name: 'Pune',
          display_name: 'Pune, Maharashtra, India',
          boundingbox: ['18.36', '18.68', '73.7', '74.02'],
        },
      ],
    });
    const source = createSource(fetchImpl);

    const result = await source.getCityAreas('Pune');
    assert.equal(result?.city, 'Pune');
    assert.ok(calls[1].query?.includes('around:12000,18.52,73.86'), 'a point city is queried by radius');
  });

  it('queries a radius instead of an oversized bounding box', async () => {
    const { fetchImpl, calls } = createFakeFetch({
      nominatim: () => [
        {
          ...nominatimFixture[0],
          name: 'Bigshire',
          display_name: 'Bigshire, India',
          boundingbox: ['17.0', '18.5', '77.5', '79.5'],
        },
      ],
    });
    const source = createSource(fetchImpl);

    const result = await source.getCityAreas('Bigshire');
    assert.equal(result?.city, 'Bigshire');
    assert.ok(calls[1].query?.includes('around:12000,'), 'radius scope used');
    assert.ok(!calls[1].query?.includes('(17.0,77.5,18.5,79.5)'), 'oversized bbox not used');
  });

  it('expands common abbreviations before asking Nominatim', async () => {
    const { fetchImpl, calls } = createFakeFetch();
    const source = createSource(fetchImpl);

    const result = await source.getCityAreas('HYD');
    assert.equal(result?.city, 'Testville');
    assert.ok(calls[0].url.includes('q=Hyderabad'), `looked up ${calls[0].url}`);
  });

  it('remembers unknown cities so typos do not hit Nominatim repeatedly', async () => {
    const { fetchImpl, calls } = createFakeFetch({ nominatim: () => [] });
    const source = createSource(fetchImpl);

    assert.equal(await source.getCityAreas('Atlantis'), null);
    assert.equal(await source.getCityAreas('Atlantis'), null);
    assert.equal(calls.length, 1);
  });

  it('retries a rate-limited Overpass call', async () => {
    const { fetchImpl, calls } = createFakeFetch({
      overpass: (query, index) =>
        index === 1
          ? jsonResponse({}, 429)
          : query.includes('"place"')
            ? localitiesFixture
            : poisFixture,
    });
    const source = createSource(fetchImpl);

    const result = await source.getCityAreas('Testville');
    assert.equal(result?.areas.length, 2);
    assert.equal(calls.length, 4, 'the failed attempt was retried once');
  });

  it('surfaces Overpass runtime errors as retryable upstream failures', async () => {
    const { fetchImpl } = createFakeFetch({
      overpass: () => ({ elements: [], remark: 'runtime error: Query timed out after 120 seconds.' }),
    });
    const source = createSource(fetchImpl);

    await assert.rejects(
      () => source.getCityAreas('Testville'),
      (error: unknown) => error instanceof UpstreamError && error.retryable,
    );
  });

  it('gives up after repeated server errors with an upstream failure', async () => {
    const { fetchImpl, calls } = createFakeFetch({ overpass: () => jsonResponse({}, 503) });
    const source = createSource(fetchImpl);

    await assert.rejects(() => source.getCityAreas('Testville'), UpstreamError);
    assert.equal(calls.length, 3, 'Nominatim once, Overpass twice');
  });

  it('bounds queries by the bounding box by default', async () => {
    const { fetchImpl, calls } = createFakeFetch();
    await createSource(fetchImpl).getCityAreas('Testville');

    for (const call of calls.slice(1)) {
      assert.ok(call.query?.includes('(17.2,78.2,17.6,78.6)'), 'bbox filter present');
      assert.ok(!call.query?.includes('area('), 'no area filter');
    }
  });

  it('can use the exact boundary and falls back to the bbox when Overpass has no area', async () => {
    const { fetchImpl, calls } = createFakeFetch({
      overpass: (query) => {
        if (query.includes('"place"')) {
          return query.includes('area(') ? { elements: [] } : localitiesFixture;
        }
        return poisFixture;
      },
    });
    const source = createSource(fetchImpl, { scope: 'area' });

    const result = await source.getCityAreas('Testville');
    assert.equal(result?.areas.length, 2);
    assert.equal(calls.length, 4);
    assert.ok(calls[1].query?.includes('area(3600012345)'), 'relation id offset applied');
    assert.ok(
      calls[2].query?.includes('(17.2,78.2,17.6,78.6)'),
      'second localities query uses the bbox',
    );
    assert.ok(calls[3].query?.includes('(17.2,78.2,17.6,78.6)'), 'the POI query uses the same scope');
  });

  it('reports a city with no mapped localities as empty rather than unknown', async () => {
    const { fetchImpl, calls } = createFakeFetch({ overpass: () => ({ elements: [] }) });
    const source = createSource(fetchImpl);

    const result = await source.getCityAreas('Testville');
    assert.ok(result);
    assert.deepEqual(result.areas, []);
    assert.match(result.notes?.[0] ?? '', /no named localities/);
    assert.equal(calls.length, 2, 'Nominatim plus one localities query; no POI query without localities');
  });

  it('suggests configured cities first, then cities already analysed', async () => {
    const { fetchImpl } = createFakeFetch();
    const source = createSource(fetchImpl);

    assert.deepEqual(await source.listCities(), ['Hyderabad']);
    await source.getCityAreas('Testville');
    assert.deepEqual(await source.listCities(), ['Hyderabad', 'Testville']);
    assert.equal(source.info.isSample, false);
    assert.match(source.info.attribution ?? '', /OpenStreetMap contributors/);
  });

  it('uses exact tag filters so Overpass can answer from its index', async () => {
    const { fetchImpl, calls } = createFakeFetch();
    await createSource(fetchImpl).getCityAreas('Testville');
    const poiQuery = calls[2].query ?? '';
    assert.ok(poiQuery.includes('nwr["building"="office"]'));
    assert.ok(!/"building"~/.test(poiQuery), 'no regular expression on the building key');
    assert.ok(!/"amenity"~/.test(poiQuery), 'no regular expression on the amenity key');
  });
});

describe('JSON file cache', () => {
  it('persists entries to disk and honours expiry', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'areascout-cache-'));
    try {
      let clock = 1_000_000;
      const cache = createJsonCache({ dir, now: () => clock });
      await cache.set('testville', { city: 'Testville' }, 1000);

      // A fresh instance must read the entry back from disk.
      const reopened = createJsonCache({ dir, now: () => clock });
      assert.deepEqual(await reopened.get('testville'), { city: 'Testville' });
      assert.deepEqual(await reopened.values(), [{ city: 'Testville' }]);

      clock += 2000;
      assert.equal(await reopened.get('testville'), undefined);
      assert.deepEqual(await reopened.values(), []);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
