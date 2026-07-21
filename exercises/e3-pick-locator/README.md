# E3 — Pick Locator (Playwright Codegen)

> **Concept:** Playwright's built-in codegen tool generates locators interactively as you click elements in the browser.

## What you need

- App running: `npm start`
- Starter spec: copy `codegen.starter.spec.ts` → `tests/ui/codegen.spec.ts`

## Steps

1. In a terminal, start codegen pointed at the app:

   ```bash
   npx playwright codegen http://localhost:3000
   ```

   Two windows open: the app browser and the Playwright Inspector.
2. **Click "Users"** in the nav. Notice the Inspector shows `page.getByRole('link', { name: 'Users' })`.
3. **Navigate to `/users/new`**. Click the First Name input. Notice `page.getByLabel('First Name')`.
4. **Click the Create User button**. Notice `page.getByRole('button', { name: 'Create User' })`.
5. **Click the Admin radio button** in the filter. Notice `page.getByRole('radio', { name: 'Admin' })`.
6. Copy any two generated locators into a new scratch file in `tests/scratch.spec.ts`.
7. **Navigate to `/llm`**. Click the Generate Response button. What locator does codegen suggest?
getByTestId('ask-btn')

## Tips

- Codegen prefers `getByRole` and `getByLabel` where possible — the same hierarchy you should follow.
- If codegen suggests `getByTestId`, it means no better semantic locator exists for that element.
- You can record a full user journey and use it as a test skeleton.

## Done when

- [ ] Codegen opens successfully against `http://localhost:3000`
- [ ] You've generated at least 3 locators and can explain what each targets
