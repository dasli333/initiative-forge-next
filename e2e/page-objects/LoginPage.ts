import { type Page, type Locator } from "@playwright/test";
import { getTestUser } from "../utils/auth.helpers";

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole("button", { name: /sign in|log in/i });
    this.errorMessage = page.getByRole("alert");
    this.logoutButton = page.getByRole("button", { name: /log out|logout|sign out/i });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Login with test user credentials from environment
   */
  async loginAsTestUser() {
    const { username, password } = getTestUser();
    await this.login(username, password);
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL(/\/login/, { timeout: 10000 });
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async waitForRedirectFromLogin() {
    await this.page.waitForURL(/\/campaigns/, { timeout: 10000 });
  }
}
