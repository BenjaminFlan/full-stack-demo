/**
 * E5 — Delete user starter
 *
 * Copy this file to tests/ui/deleteUser.spec.ts, then complete the TODOs.
 *
 * Useful locators:
 *   page.locator('#users-tbody tr').filter({ hasText: 'alice@example.com' })
 *   page.getByRole('status')   ← the green success message
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
function makeUser(overrides: Partial<{ firstName: string; lastName: string; email: string; password: string }> = {}) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return {
    firstName: 'Jamie',
    lastName: 'Knoxx',
    email: `jamie.knoxx+${stamp}@example.com`,
    password: 'TestPass123!',
    ...overrides,
  };
}

async function createUser(
  request: Parameters<typeof test>[0]['request'],
  user: ReturnType<typeof makeUser>,
) {
  const response = await request.post(`${BASE_URL}/api/users`, {
    data: user,
  });

  await expect(response).toBeOK();
}

function rowByEmail(page: Parameters<typeof test>[0]['page'], email: string) {
  return page.locator('#users-tbody tr').filter({ hasText: email });
}

async function deleteUserByEmail(page: Parameters<typeof test>[0]['page'], email: string) {
  await rowByEmail(page, email).getByRole('button', { name: 'Delete' }).click();
}

async function readTotalUsersCount(page: Parameters<typeof test>[0]['page']) {
  const text = (await page.getByTestId('user-count').textContent())?.trim() ?? '';
  return Number(text);
}

test.beforeEach(async ({ request }) => {
  // Reset to seed data before each test so deletes don't cascade
  await request.post(`${BASE_URL}/api/seed`);
});

test('the new user can be viewed in list', async ({ page, request }) => {
  const user = makeUser();
  await createUser(request, user);

  await page.goto(`${BASE_URL}/users`);
  await expect(page.getByRole('cell', { name: user.email })).toBeVisible();
});

test('deleting a user shows a confirmation message', async ({ page, request }) => {
  const user = makeUser();
  await createUser(request, user);

  await page.goto(`${BASE_URL}/users`);
  await deleteUserByEmail(page, user.email);

  const fullName = `${user.firstName} ${user.lastName}`;
  await expect(page.getByRole('status')).toHaveText(`User "${fullName}" was deleted successfully.`);
});

test('deleting a user removes the row from the table', async ({ page, request }) => {
  const user = makeUser();
  await createUser(request, user);

  await page.goto(`${BASE_URL}/users`);
  const targetRow = rowByEmail(page, user.email);

  await expect(targetRow).toHaveCount(1);
  await deleteUserByEmail(page, user.email);
  await expect(targetRow).toHaveCount(0);
});

test('deleting a user decreases Total Users count by 1 and persists after reload', async ({ page, request }) => {
  const user = makeUser();
  await createUser(request, user);

  await page.goto(`${BASE_URL}/users`);
  const beforeDelete = await readTotalUsersCount(page);
  expect(beforeDelete).toBeGreaterThan(0);

  await deleteUserByEmail(page, user.email);
  await expect(rowByEmail(page, user.email)).toHaveCount(0);

  const afterDelete = await readTotalUsersCount(page);
  expect(afterDelete).toBe(beforeDelete - 1);

  await page.reload();
  await expect(rowByEmail(page, user.email)).toHaveCount(0);
  await expect(page.getByTestId('user-count')).toHaveText(String(afterDelete));
});

test('deleting one of two similar names removes only the targeted user', async ({ page, request }) => {
  const userA = makeUser({ firstName: 'Sam', lastName: 'Taylor' });
  const userB = makeUser({ firstName: 'Sam', lastName: 'Taylor' });
  await createUser(request, userA);
  await createUser(request, userB);

  await page.goto(`${BASE_URL}/users`);
  await expect(rowByEmail(page, userA.email)).toHaveCount(1);
  await expect(rowByEmail(page, userB.email)).toHaveCount(1);

  await deleteUserByEmail(page, userA.email);

  await expect(rowByEmail(page, userA.email)).toHaveCount(0);
  await expect(rowByEmail(page, userB.email)).toHaveCount(1);
});
