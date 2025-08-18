import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(bodyParser.json());

const TAX_RATE = 0.0825;

let state = {};
const reset = () => {
    state = {
        users: [{
            firstName: 'Test',
            lastName: 'User',
            email: 'user@example.com',
            phone: '555-123-4567',
            password: 'secret',
            token: 'tok_' + uuid()
        }],
        products: [
            { sku: 'A100', name: 'Water Bottle', price: 15.00, stock: 10 },
            { sku: 'B200', name: 'Backpack', price: 45.00, stock: 5 }
        ],
        carts: {}, // token -> { items: [{sku, qty}], coupon: null|'SAVE10'|'FREESHIP' }
    };
};
reset();

const findUserByToken = (token) => state.users.find(u => u.token === token);
const getCart = (token) => state.carts[token] ||= { items: [], coupon: null };
const coupons = {
    SAVE10: { type: 'percent', value: 0.10 },
    FREESHIP: { type: 'shipping', value: 0 }
};

app.post('/reset', (req, res) => { reset(); res.json({ ok: true }); });

// Serve static files from the public directory
app.use(express.static('public'));

app.post('/register', (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body || {};

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'First name, last name, email, and password are required' });
    }

    // Check if user already exists
    if (state.users.some(u => u.email === email)) {
        return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    const token = 'tok_' + uuid();
    const newUser = { firstName, lastName, email, phone, password, token };
    state.users.push(newUser);

    return res.status(201).json({ token });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    const user = state.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'invalid' });
    return res.json({ token: user.token });
});

app.get('/products', (_req, res) => res.json(state.products));

app.post('/cart/add', (req, res) => {
    const { token, sku, qty } = req.body || {};
    if (!findUserByToken(token)) return res.status(401).json({ error: 'auth' });
    const p = state.products.find(p => p.sku === sku);
    if (!p) return res.status(404).json({ error: 'sku' });
    if (qty <= 0) return res.status(400).json({ error: 'qty' });
    const cart = getCart(token);
    const line = cart.items.find(i => i.sku === sku) || (cart.items.push({ sku, qty: 0 }), cart.items[cart.items.length - 1]);
    line.qty += qty;
    return res.json(cart);
});

app.post('/cart/apply-coupon', (req, res) => {
    const { token, code } = req.body || {};
    if (!findUserByToken(token)) return res.status(401).json({ error: 'auth' });
    const norm = (code || '').toUpperCase();
    if (!coupons[norm]) return res.status(400).json({ error: 'bad_coupon' });
    const cart = getCart(token);
    cart.coupon = norm;
    return res.json(cart);
});

// Additional cart endpoints to align with README scope
app.get('/cart', (req, res) => {
    const token = req.query.token;
    if (!findUserByToken(token)) return res.status(401).json({ error: 'auth' });
    const cart = getCart(token);
    return res.json(cart);
});

app.post('/cart/update', (req, res) => {
    const { token, sku, qty } = req.body || {};
    if (!findUserByToken(token)) return res.status(401).json({ error: 'auth' });
    const p = state.products.find(p => p.sku === sku);
    if (!p) return res.status(404).json({ error: 'sku' });
    if (qty <= 0) return res.status(400).json({ error: 'qty' });
    const cart = getCart(token);
    const line = cart.items.find(i => i.sku === sku);
    if (line) {
        line.qty = qty;
    } else {
        cart.items.push({ sku, qty });
    }
    return res.json(cart);
});

app.post('/cart/remove', (req, res) => {
    const { token, sku } = req.body || {};
    if (!findUserByToken(token)) return res.status(401).json({ error: 'auth' });
    const cart = getCart(token);
    cart.items = cart.items.filter(i => i.sku !== sku);
    return res.json(cart);
});

function priceBreakdown(cart) {
    const items = cart.items.map(i => {
        const p = state.products.find(p => p.sku === i.sku);
        return { ...i, price: p.price };
    });
    const money = (n) => Math.round(n * 100) / 100;

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

    let discount = 0;
    if (cart.coupon && coupons[cart.coupon]?.type === 'percent') {
        discount = money(subtotal * coupons[cart.coupon].value);
    }

    const shipping = (subtotal >= 50 || cart.coupon === 'FREESHIP') ? 0 : 7;

    // TODO: Review tax calculation logic
    const tax = money(subtotal * TAX_RATE);

    const total = money(subtotal - discount + tax + shipping);

    return {
        subtotal: money(subtotal),
        discount: money(discount),
        tax,
        shipping,
        total,
        // helpful for debugging expectations
        taxableBase: money(subtotal) // should have been subtotal - discount
    };
}

app.get('/cart/total', (req, res) => {
    const token = req.query.token;
    if (!findUserByToken(token)) return res.status(401).json({ error: 'auth' });
    const cart = getCart(token);
    return res.json(priceBreakdown(cart));
});

app.post('/checkout', (req, res) => {
    const { token } = req.body || {};
    if (!findUserByToken(token)) return res.status(401).json({ error: 'auth' });
    const cart = getCart(token);
    // check stock
    for (const line of cart.items) {
        const p = state.products.find(p => p.sku === line.sku);
        if (p.stock < line.qty) return res.status(409).json({ error: 'out_of_stock', sku: line.sku });
    }
    // decrement on success
    for (const line of cart.items) {
        const p = state.products.find(p => p.sku === line.sku);
        p.stock -= line.qty;
    }
    const { total } = priceBreakdown(cart);
    state.carts[token] = { items: [], coupon: null }; // clear cart
    res.json({ orderId: uuid(), total });
});

app.listen(3000, () => console.log('Mini Cart API listening on 3000'));