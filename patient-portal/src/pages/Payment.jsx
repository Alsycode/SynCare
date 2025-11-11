import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { loadRazorpay } from '../utils/razorpay';

function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // ✅ Use environment variable for backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
  }, []);

  const handlePayment = async () => {
    try {
      // ✅ Payment initiation
      const res = await axios.post(
        `${backendUrl}/api/payments/create`,
        { appointmentId, amount: 100 }, // Example amount
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const { orderId, amount, currency } = res.data;
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID; // ✅ Razorpay key from env

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        handler: async (response) => {
          try {
            // ✅ Payment verification
            await axios.post(
              `${backendUrl}/api/payments/verify`,
              {
                appointmentId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            navigate('/dashboard');
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          email: 'patient@example.com',
          contact: '1234567890',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('Payment initiation failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Make Payment</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handlePayment}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Pay ₹100
        </button>
      </div>
    </div>
  );
}

export default Payment;
