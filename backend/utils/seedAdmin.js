const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    if (!adminEmail) return;

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, salt);

      const newAdmin = new Admin({
        name: process.env.DEFAULT_ADMIN_NAME || 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: process.env.DEFAULT_ADMIN_ROLE || 'ADMIN'
      });

      await newAdmin.save();
      console.log('✅ Default Admin seeded successfully');
    } else {
      console.log('✅ Default Admin already exists in database');
    }
  } catch (error) {
    console.error('❌ Error seeding Admin:', error);
  }
};

module.exports = seedAdmin;
