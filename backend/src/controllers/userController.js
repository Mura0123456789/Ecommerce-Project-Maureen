const prisma = require('../config/db');

// GET /api/users/me
async function getProfile(req, res) {
  const { id, name, email, role, createdAt } = req.user;
  res.json({ id, name, email, role, createdAt });
}

// PUT /api/users/me
async function updateProfile(req, res) {
  const { name, email } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
    },
  });

  res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
}

module.exports = { getProfile, updateProfile };
