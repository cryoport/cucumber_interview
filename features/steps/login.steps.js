import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I open the login page', async function () {
  await this.page.goto(`${this.baseUrl}/login.html`);
  await this.page.waitForSelector('#login-form');
});

When('I fill the login form with email {string} and password {string}', async function (email, password) {
  await this.page.fill('#email', email);
  await this.page.fill('#password', password);
});

When('I submit the login form', async function () {
  await Promise.all([
    this.page.waitForLoadState('load'),
    this.page.click('#login-form button[type="submit"]')
  ]);
});

Then('I should see an inline error {string}', async function (message) {
  const locator = this.page.locator('#error-message.visible');
  await expect(await locator.textContent()).to.include(message);
});

Then('I should be on the dashboard page', async function () {
  await this.page.waitForURL(/\/dashboard\.html$/);
  await this.page.waitForSelector('#user-email');
});

Then('I should see my user label {string}', async function (value) {
  const text = (await this.page.textContent('#user-email'))?.trim();
  expect(text).to.equal(value);
});
