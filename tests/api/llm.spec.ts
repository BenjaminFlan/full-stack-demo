/**
 * E9 — Testing the LLM Demo endpoint
 *
 * Copy this file to tests/api/llm.spec.ts to run it.
 *
 * The endpoint: GET /api/llm/ask
 * Response shape:
 *   {
 *     question:      string   // always "What is the capital of Ireland?"
 *     response:      string   // varies each call
 *     responseIndex: number   // 1–15
 *     totalVariants: number   // always 15
 *     model:         string   // "mock-llm-v1"
 *   }
 *
 * Rules:
 *   ✅ Assert on shape, key facts, and numeric ranges
 *   ❌ Do NOT assert on the exact wording of "response"
 *
 * Also see: tests/api/summary.spec.ts for the same pattern on /api/users/:id/summary
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const offensiveWords = ['lazy', "don't want to", 'tired', 'stupid', 'dumb', 'idiot', 'hate', 'kill', 'die', 'death', 'kill yourself'];

test('GET /api/llm/ask returns 200 with the correct shape @smoke', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/api/llm/ask`);
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body).toHaveProperty('question');
  expect(body).toHaveProperty('response');
  expect(body).toHaveProperty('responseIndex');
  expect(body).toHaveProperty('totalVariants');
  expect(body).toHaveProperty('model');

  expect(typeof body.question).toBe('string');
  expect(typeof body.response).toBe('string');
  expect(typeof body.responseIndex).toBe('number');
  expect(typeof body.totalVariants).toBe('number');
  expect(typeof body.model).toBe('string');
});

test('question is always "What is the capital of Ireland?"', async ({ request }) => {
  const { question } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());
  expect(question).toBe('What is the capital of Ireland?');
});

test('response always mentions Dublin', async ({ request }) => {
  const responses = await Promise.all(
    Array.from({ length: 10 }, () =>
      request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json()).then(b => b.response)
    )
  );

  responses.forEach(response => {
    expect(response.toLowerCase()).toContain('dublin');
  });
});

test('responseIndex is between 1 and totalVariants', async ({ request }) => {
  const { responseIndex, totalVariants } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());

  expect(responseIndex).toBeGreaterThanOrEqual(1);
  expect(responseIndex).toBeLessThanOrEqual(totalVariants);
  expect(totalVariants).toBe(15);
});

test('response wording varies across multiple calls', async ({ request }) => {
  const responses = await Promise.all(
    Array.from({ length: 10 }, () =>
      request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json()).then(b => b.response)
    )
  );

  expect(new Set(responses).size).toBeGreaterThan(1);
});

test('response length is between 50 and 300 characters', async ({ request }) => {
  const responses = await Promise.all(
    Array.from({ length: 10 }, () =>
      request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json()).then(b => b.response)
    )
  );

  responses.forEach(response => {
    expect(response.length).toBeGreaterThanOrEqual(50);
    expect(response.length).toBeLessThanOrEqual(300);
  });
});

test('response should not contain offensive words', async ({ request }) => {
  const responses = await Promise.all(
    Array.from({ length: 10 }, () =>
      request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json()).then(b => b.response)
    )
  );

  responses.forEach(response => {
    expect(response).not.toMatch(new RegExp(`\\b(${offensiveWords.join('|')})\\b`, 'i'));
  });
});

