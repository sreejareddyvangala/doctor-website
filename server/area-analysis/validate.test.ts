import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseAreaAnalysisRequest } from './validate.ts';

describe('parseAreaAnalysisRequest', () => {
  it('accepts a valid request and normalises whitespace in the city', () => {
    const result = parseAreaAnalysisRequest({ categoryId: 'gym', city: '  New   Delhi ' });
    assert.deepEqual(result, { ok: true, value: { categoryId: 'gym', city: 'New Delhi' } });
  });

  it('rejects bodies that are not objects', () => {
    for (const body of [null, 'gym', 42, ['gym'], undefined]) {
      const result = parseAreaAnalysisRequest(body);
      assert.equal(result.ok, false);
    }
  });

  it('reports every problem at once', () => {
    const result = parseAreaAnalysisRequest({ categoryId: 'spaceport', city: 'H' });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.issues.length, 2);
    assert.match(result.issues[0], /categoryId/);
    assert.match(result.issues[1], /city/);
  });

  it('rejects a missing city', () => {
    const result = parseAreaAnalysisRequest({ categoryId: 'gym' });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.deepEqual(result.issues, ['city is required.']);
  });

  it('rejects cities with disallowed characters or excessive length', () => {
    const symbols = parseAreaAnalysisRequest({ categoryId: 'gym', city: 'Hyderabad<script>' });
    assert.equal(symbols.ok, false);

    const tooLong = parseAreaAnalysisRequest({ categoryId: 'gym', city: 'a'.repeat(61) });
    assert.equal(tooLong.ok, false);
  });

  it('accepts accented and non-Latin city names', () => {
    assert.equal(parseAreaAnalysisRequest({ categoryId: 'cafe', city: 'São Paulo' }).ok, true);
    assert.equal(parseAreaAnalysisRequest({ categoryId: 'cafe', city: 'हैदराबाद' }).ok, true);
  });
});
