import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseApiResponse } from './src/api.js';

test('returns valid JSON from successful API responses', async () => {
  const result = await parseApiResponse(new Response(
    JSON.stringify({ user: { email: 'user@example.com' } }),
    { headers: { 'Content-Type': 'application/json' } }
  ));

  assert.equal(result.user.email, 'user@example.com');
});

test('uses the API error from a non-success JSON response', async () => {
  await assert.rejects(
    parseApiResponse(new Response(JSON.stringify({ error: 'Incorrect email or password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })),
    { message: 'Incorrect email or password.' }
  );
});

test('handles HTML and plain-text error responses without JSON parse failures', async () => {
  await assert.rejects(
    parseApiResponse(new Response('<!doctype html><html><body>Proxy error</body></html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' }
    })),
    { message: 'The server returned an unexpected response (HTTP 502).' }
  );
  await assert.rejects(
    parseApiResponse(new Response('Service unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    })),
    { message: 'Service unavailable' }
  );
});

test('reports invalid JSON or empty bodies on successful responses clearly', async () => {
  await assert.rejects(
    parseApiResponse(new Response('<html>Unexpected proxy page</html>', {
      headers: { 'Content-Type': 'text/html' }
    })),
    { message: 'The server returned an invalid response. Please try again.' }
  );
  await assert.rejects(
    parseApiResponse(new Response(null, { status: 204 })),
    { message: 'The server returned an empty response. Please try again.' }
  );
});
