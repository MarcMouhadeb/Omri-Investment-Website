// POST /api/create-checkout-session
// Body: { productId, accessToken }
// Verifies the caller is a logged-in Supabase user, then creates a Stripe
// Checkout Session for the requested course and returns its URL.
// The browser never talks to Stripe directly with a secret key - that key
// only ever lives here, server-side, read from an environment variable.

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const { PRODUCTS } = require("./_products");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productId, accessToken } = req.body || {};
  const product = PRODUCTS[productId];
  if (!product) {
    return res.status(400).json({ error: "Unknown course." });
  }
  if (!accessToken) {
    return res.status(401).json({ error: "Please log in first." });
  }

  let user;
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) throw error || new Error("No user");
    user = data.user;
  } catch (err) {
    console.error("Auth check failed in create-checkout-session:", err);
    return res.status(401).json({ error: "Your session has expired - please log in again." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: product.name },
            unit_amount: product.priceCents
          },
          quantity: 1
        }
      ],
      client_reference_id: user.id,
      metadata: { product_id: productId, user_id: user.id },
      customer_email: user.email,
      success_url: `${process.env.SITE_URL}/account.html?purchase=success`,
      cancel_url: `${process.env.SITE_URL}/education.html`
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
};
