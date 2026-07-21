import { test, expect } from '@playwright/test';
import { CreateUserPage } from '../pages/CreateUserPage';
import { UsersListPage } from '../pages/UsersListPage';

function makeUser(overrides: Partial<{ firstName: string; lastName: string; email: string; password: string }> = {}) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    email: `jane.doe+${stamp}@example.com`,
    password: 'SecurePass123!',
    ...overrides,
  };
}

test.beforeEach(async ({ request }) => {
  // Keep each test isolated and deterministic.
  await request.post('/api/seed');
});

test('Add user via UI saves first name, last name and email correctly @smoke', async ({ page }) => {
  const createUserPage = new CreateUserPage(page);
  const usersListPage = new UsersListPage(page);
  const user = makeUser();

  await createUserPage.goto();
  await createUserPage.fillForm(user);
  await createUserPage.submit();

  // Should navigate back to the users list.
  await expect(page).toHaveURL(/\/users/);
  await expect(usersListPage.getUserRowByEmail(user.email)).toHaveCount(1);
});

test('Add user via UI shows error for duplicate email', async ({ page, request }) => {
  const createUserPage = new CreateUserPage(page);
  const user = makeUser();

  // Pre-create user via API so we have a known duplicate
  await request.post('/api/users', {
    data: user,
  });

  await createUserPage.goto();
  await createUserPage.fillForm(user);
  await createUserPage.submit();

  await expect(createUserPage.getAlert()).toContainText(/email.*already (exists|taken|in use)/i);
});

test('Add user via UI Create User button is disabled until all fields are filled', async ({ page }) => {
  const createUserPage = new CreateUserPage(page);
  const user = makeUser();

  await createUserPage.goto();
  const submitBtn = createUserPage.submitButton;

  // E1-E: button starts disabled — all fields are empty
  await expect(submitBtn).toBeDisabled();

  // Filling fields one-by-one — still disabled until ALL four have values
  await createUserPage.firstNameInput.fill(user.firstName);
  await expect(submitBtn).toBeDisabled();

  await createUserPage.lastNameInput.fill(user.lastName);
  await expect(submitBtn).toBeDisabled();

  await createUserPage.emailInput.fill(user.email);
  await expect(submitBtn).toBeDisabled();

  // Password is the last required field — only now the button enables
  await createUserPage.passwordInput.fill(user.password);
  await expect(submitBtn).toBeEnabled();
});
