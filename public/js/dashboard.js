document.addEventListener('DOMContentLoaded', () => {
    const userEmail = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');
    const productsContainer = document.getElementById('products-container');
    const cartContainer = document.getElementById('cart-container');
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user name or email
    userEmail.textContent = userName || email;
    
    // Logout functionality
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    });
    
    // Fetch products
    async function fetchProducts() {
        try {
            const response = await fetch('/products');
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productsContainer.innerHTML = '<div class="error-message visible">Failed to load products</div>';
        }
    }
    
    // Display products
    function displayProducts(products) {
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            productsContainer.innerHTML = '<div class="empty-cart">No products available</div>';
            return;
        }
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div>Stock: ${product.stock}</div>
                <button class="button add-to-cart" data-sku="${product.sku}">Add to Cart</button>
            `;
            
            productsContainer.appendChild(productCard);
        });
        
        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', async () => {
                const sku = button.getAttribute('data-sku');
                await addToCart(sku, 1);
            });
        });
    }
    
    // Add item to cart
    async function addToCart(sku, qty) {
        try {
            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, sku, qty })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            
            // Refresh cart display
            fetchCartTotal();
            
            // Show success message
            alert('Item added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart');
        }
    }
    
    // Fetch cart total
    async function fetchCartTotal() {
        try {
            const response = await fetch(`/cart/total?token=${token}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch cart total');
            }
            
            const cartData = await response.json();
            displayCartTotal(cartData);
        } catch (error) {
            console.error('Error fetching cart total:', error);
            cartContainer.innerHTML = '<div class="error-message visible">Failed to load cart</div>';
        }
    }
    
    // Display cart total
    function displayCartTotal(cartData) {
        cartContainer.innerHTML = `
            <div class="cart-summary">
                <div class="cart-item">
                    <span>Subtotal:</span>
                    <span>$${cartData.subtotal.toFixed(2)}</span>
                </div>
                <div class="cart-item">
                    <span>Discount:</span>
                    <span>$${cartData.discount.toFixed(2)}</span>
                </div>
                <div class="cart-item">
                    <span>Tax:</span>
                    <span>$${cartData.tax.toFixed(2)}</span>
                </div>
                <div class="cart-item">
                    <span>Shipping:</span>
                    <span>$${cartData.shipping.toFixed(2)}</span>
                </div>
                <div class="cart-total">
                    <span>Total:</span>
                    <span>$${cartData.total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    // Initialize
    fetchProducts();
    fetchCartTotal();
});
