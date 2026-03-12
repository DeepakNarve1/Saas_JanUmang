const Stripe = require("stripe");

// Lazily initialize so the import doesn't crash if STRIPE_SECRET_KEY isn't set yet
let _stripe = null;

const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your .env file.",
      );
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    });
  }
  return _stripe;
};

module.exports = { getStripe };
