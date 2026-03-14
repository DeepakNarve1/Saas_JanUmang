const Razorpay = require("razorpay");

let _razorpay = null;

const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error(
        "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set. Add it to your .env file.",
      );
    }
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

module.exports = { getRazorpay };
