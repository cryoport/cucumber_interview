import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'chai';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
let token;

function dollars(n) { return `$${Number(n).toFixed(2)}`; }

Before(async function () {
    // noop: candidate can decide to reset per-scenario or in Background
});

Given('the API is running', async function () {
    // ping products
    const res = await fetch(`${BASE}/products`);
    expect(res.ok).to.equal(true);
});

Given('I reset the system', async function () {
    const res = await fetch(`${BASE}/reset`, { method: 'POST' });
    expect(res.ok).to.equal(true);
});

Given('I log in as {string} with password {string}', async function (email, password) {
    const res = await fetch(`${BASE}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const body = await res.json();
    expect(res.ok, JSON.stringify(body)).to.equal(true);
    token = body.token;
});

Given('the catalog contains:', async function (table) {
    // Provided by the server; table here is descriptive. Candidate can skip or assert.
    const res = await fetch(`${BASE}/products`);
    const products = await res.json();
    expect(products.length).to.be.greaterThan(0);
});

When('I add {int} unit(s) of {string} to my cart', async function (qty, sku) {
    const res = await fetch(`${BASE}/cart/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, sku, qty })
    });
    expect(res.ok).to.equal(true);
});

When('I apply coupon {string}', async function (code) {
    const res = await fetch(`${BASE}/cart/apply-coupon`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code })
    });
    expect(res.ok).to.equal(true);
});

When('I request the cart totals', async function () {
    const res = await fetch(`${BASE}/cart/total?token=${token}`);
    this.totals = await res.json();
});

Then('the subtotal should be {string}', function (amount) {
    expect(dollars(this.totals.subtotal)).to.equal(amount);
});
Then('the discount should be {string}', function (amount) {
    expect(dollars(this.totals.discount)).to.equal(amount);
});
Then('the taxable amount should be {string}', function (amount) {
    // Candidate can compute (subtotal - discount) or assert server field if exposed
    const taxable = Number(this.totals.subtotal - this.totals.discount).toFixed(2);
    expect(`$${taxable}`).to.equal(amount);
});
Then('the tax should be {string}', function (amount) {
    expect(dollars(this.totals.tax)).to.equal(amount);
});
Then('the shipping should be {string}', function (amount) {
    expect(dollars(this.totals.shipping)).to.equal(amount);
});
Then('the total should be {string}', function (amount) {
    expect(dollars(this.totals.total)).to.equal(amount);
});