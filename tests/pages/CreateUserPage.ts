import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for the Create User page (/users/new).
 *
 * TODO: Add the remaining locators and methods to complete this POM.
 * Hint: use page.getByLabel(), page.getByRole(), page.getByTestId()
 */
export class CreateUserPage {
  readonly page: Page;

  // TODO: add locators for the other fields and the submit button
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;

  readonly submitButton: Locator;
  readonly serverErrorAlert: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.getByLabel('First Name');
    this.lastNameInput = page.getByLabel('Last Name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');

    this.submitButton = page.getByRole('button', { name: 'Create User' });
    this.serverErrorAlert = page.locator('#form-alert');
    this.errorSummary = page.locator('#error-summary');
  }

  async goto() {
    await this.page.goto('/users/new');
  }


  async fillForm(user: { firstName: string; lastName: string; email: string; password: string }): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  getAlert(): Locator {
    return this.serverErrorAlert;
  }
}
