const BloodBank = require('../models/BloodBank');

// Get Blood Bank Availability (Accessible to Patients)
exports.getAvailability = async (req, res) => {
  try {
    const inventory = await BloodBank.find().sort({ bloodGroup: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Blood Bank Inventory (Admin Only)
exports.updateInventory = async (req, res) => {
  const { bloodGroup, quantity } = req.body;
  try {
    let blood = await BloodBank.findOne({ bloodGroup });
    if (!blood) {
      blood = new BloodBank({ bloodGroup, quantity, lastUpdated: new Date() });
    } else {
      blood.quantity = quantity;
      blood.lastUpdated = new Date();
    }
    await blood.save();
    res.json({ message: 'Blood bank updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
