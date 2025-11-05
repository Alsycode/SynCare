const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');

// Submit Feedback (Patients only)
exports.submitFeedback = async (req, res) => {
  const { appointmentId, rating, comments } = req.body;
  console.log("req.body",req.body);
  console.log("req.user",req.user)
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Access denied, patients only' });
    }
    const appointment = await Appointment.findOne({ _id: appointmentId });
    console.log("appointment",appointment)
    if (!appointment || appointment.patientId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }
    const existingFeedback = await Feedback.findOne({ appointmentId, patientId: req.user.id });
    console.log("existingFeedback",existingFeedback)
    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted for this appointment' });
    }
    const feedback = new Feedback({
      patientId: req.user.id,
      appointmentId,
      rating,
      comments,
    });
    console.log("feedback",feedback)
    await feedback.save();
    console.log("saved")
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Feedback for an Appointment
exports.getFeedbackByAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (
      !appointment ||
      (req.user.role !== 'admin' &&
        req.user.id !== appointment.patientId.toString() &&
        req.user.id !== appointment.doctorId.toString())
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const feedback = await Feedback.findOne({ appointmentId: req.params.appointmentId }).populate(
      'patientId',
      'name'
    );
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


// Get All Feedback for Admin without Aggregation
exports.getAllFeedback = async (req, res) => {
  try {
  
 const feedbacks = await Feedback.find()
  .populate('patientId', 'name')
  .populate({
    path: 'appointmentId',
    select: 'date time doctorId',
    populate: {
      path: 'doctorId',
      select: 'name',
    },
  });


   const formattedFeedbacks = feedbacks.map(feedback => ({
  _id: feedback._id,
  patientId: feedback.patientId?._id || null,
  patientName: feedback.patientId?.name || 'Anonymous',
  doctorId: feedback.appointmentId?.doctorId?._id || null,
  doctorName: feedback.appointmentId?.doctorId?.name || 'N/A',
  appointmentDate: feedback.appointmentId?.date || null,
  appointmentTime: feedback.appointmentId?.time || 'N/A',
  rating: feedback.rating,
  comments: feedback.comments || 'N/A',
  submittedAt: feedback.createdAt
}));


    formattedFeedbacks.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.json(formattedFeedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
