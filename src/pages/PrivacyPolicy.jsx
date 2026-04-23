const PrivacyPolicy = () => (
  <div className="page-container py-24 max-w-4xl">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

    <p>
      Your privacy is important to us. At <strong>Naidu Gari Ruchulu</strong>,
      we ensure that your personal information is handled securely.
    </p>

    <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
    <ul className="list-disc ml-6">
      <li>Name, phone number, and address</li>
      <li>Email address</li>
      <li>Order and payment details</li>
    </ul>

    <h2 className="text-xl font-semibold mt-6 mb-2">Usage</h2>
    <p>
      We use your information to process orders, improve services, and provide
      customer support.
    </p>

    <h2 className="text-xl font-semibold mt-6 mb-2">Security</h2>
    <p>Payments are processed securely via trusted gateways like Razorpay.</p>

    <p className="mt-6">We never sell or share your data with third parties.</p>
  </div>
);
export default PrivacyPolicy;
