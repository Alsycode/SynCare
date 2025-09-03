const MedicalHistory = require('../models/MedicalHistory');

// Get medical history entries by patient ID
exports.getMedicalHistoryByPatientId = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const medicalHistory = await MedicalHistory.findOne({ patientId })
      .populate('entries.addedBy', 'name')
      .select('entries');
    if (!medicalHistory) {
      return res.status(404).json({ message: 'Medical history not found', entries: [] });
    }
    res.status(200).json(medicalHistory);
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({ message: 'Server error while fetching medical history' });
  }
};
