import { useCallback, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { AlertCircle } from "lucide-react";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CheckoutForm = ({ bookingId }) => {
  const { getToken } = useAuth();
  const [error, setError] = useState(null);

  const fetchClientSecret = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      // Create a Checkout Session
      const res = await fetch(
        `${BACKEND_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create checkout session");
      }
      
      const data = await res.json();
      return data.clientSecret;
    } catch (err) {
      console.error("Error fetching client secret:", err);
      setError(err.message || "Failed to initialize payment");
      throw err;
    }
  }, [bookingId, getToken]);

  const options = { fetchClientSecret };

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-red-50 p-6 rounded-lg text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-red-800 mb-1">Payment Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-600">Please try again or contact support</p>
      </div>
    );
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="w-full max-w-md mx-auto bg-yellow-50 p-6 rounded-lg text-center">
        <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-yellow-800 mb-1">Configuration Error</h3>
        <p className="text-yellow-600">Stripe publishable key is missing</p>
      </div>
    );
  }

  return (
    <div id="checkout" className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutForm;