const express = require('express');
const router = express.Router();
const { 
  getAdminStats,
  getAllUsers, 
  loginAdmin, 
  deleteUser, 
  toggleUserStatus, 
  getPendingVendors, 
  getApprovedVendors, 
  approveVendor, 
  rejectVendor,
  getAllProducts,
  approveProduct,
  rejectProduct,
  updateProduct,
  deleteProduct,
  updateVendor,
  getAllOrders,
  updateOrderStatusAdmin,
  getAdminPayments,
  getVendorsAdmin,
  toggleVendorSuspendStatus,
  sendVendorCommunication
} = require('../controllers/adminController');


router.post('/login', loginAdmin);
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/suspend', toggleUserStatus);

router.get('/vendors', getVendorsAdmin);
router.get('/vendors/pending', getPendingVendors);
router.get('/vendors/approved', getApprovedVendors);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/suspend', toggleVendorSuspendStatus);
router.post('/vendors/:id/communication', sendVendorCommunication);
router.put('/vendors/:id', updateVendor);

router.get('/products', getAllProducts);
router.patch('/products/:id/approve', approveProduct);
router.patch('/products/:id/reject', rejectProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatusAdmin);
router.get('/payments', getAdminPayments);

module.exports = router;



