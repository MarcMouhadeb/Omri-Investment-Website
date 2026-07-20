// POST /api/stripe-webhook
// Stripe calls this directly (not the browser) after a payment completes.
// This is the ONLY place a purchase actually gets recorded - the browser
// can never write to the purchases table itself (see supabase/schema.sql),
// so there's no way to fake owning a course by messing with client-side code.
//
// Requires the raw, unparsed request body to verify Stripe's signature,
// hence bodyParser is disabled below and the body is read manually.

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata && session.metadata.user_id;
    const productId = session.metadata && session.metadata.product_id;

    if (!userId || !productId) {
      console.error("Webhook missing metadata on session:", session.id);
    } else {
      const { error } = await supabase.from("purchases").insert({
        user_id: userId,
        product_id: productId,
        stripe_session_id: session.id
      });
      if (error) {
        // Duplicate delivery of the same event is normal for webhooks - a unique
        // constraint violation here just means we already recorded this purchase.
        if (error.code !== "23505") {
          console.error("Failed to record purchase:", error);
        }
      }
    }
  }

  res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
