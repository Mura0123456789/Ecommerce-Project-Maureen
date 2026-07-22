const prisma = require('../config/db');

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { images: true } } } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
  }
  return cart;
}

function withTotal(cart) {
  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { ...cart, total: Number(total.toFixed(2)) };
}

// GET /api/cart
async function getCart(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  res.json(withTotal(cart));
}

// POST /api/cart  { productId, quantity }
async function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required' });

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const cart = await getOrCreateCart(req.user.id);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: Number(productId) } },
    update: { quantity: { increment: Number(quantity) } },
    create: { cartId: cart.id, productId: Number(productId), quantity: Number(quantity) },
  });

  const updated = await getOrCreateCart(req.user.id);
  res.status(201).json(withTotal(updated));
}

// PUT /api/cart/:productId  { quantity }
async function updateCartItem(req, res) {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;
  if (quantity == null || quantity < 1) {
    return res.status(400).json({ message: 'quantity must be at least 1 (use DELETE to remove an item)' });
  }

  const cart = await getOrCreateCart(req.user.id);

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity: Number(quantity) },
  });

  const updated = await getOrCreateCart(req.user.id);
  res.json(withTotal(updated));
}

// DELETE /api/cart/:productId
async function removeCartItem(req, res) {
  const productId = Number(req.params.productId);
  const cart = await getOrCreateCart(req.user.id);

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  await prisma.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId } } });

  const updated = await getOrCreateCart(req.user.id);
  res.json(withTotal(updated));
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
