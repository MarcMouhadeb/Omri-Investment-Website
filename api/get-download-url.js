// POST /api/get-download-url
// Body: { productId, accessToken }
// Verifies the caller is logged in AND has a purchase on record for this
// product, then generates short-lived signed URLs into the private
// "course-files" Storage bucket. This is the only path to the real files -
// the bucket itself has no public access, so there is no plain URL anyone
// could copy/share to get the file without buying it.

const { createClient } = require("@supabase/supabase-js");
const { PRODUCTS } = require("./_products");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SIGNED_URL_TTL_SECONDS = 10 * 60; // 10 minutes - plenty to start a download, short enough not to be worth sharing

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
    console.error("Auth check failed in get-download-url:", err);
    return res.status(401).json({ error: "Your session has expired - please log in again." });
  }

  const { data: purchase, error: purchaseErr } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (purchaseErr) {
    console.error("Purchase lookup failed:", purchaseErr);
    return res.status(500).json({ error: "Could not verify your purchase. Please try again." });
  }
  if (!purchase) {
    return res.status(403).json({ error: "No purchase found for this course." });
  }

  const links = [];
  for (const file of product.files) {
    const { data, error } = await supabase.storage
      .from("course-files")
      .createSignedUrl(file.storagePath, SIGNED_URL_TTL_SECONDS);
    if (error) {
      console.error(`Signed URL error for ${file.storagePath}:`, error);
      continue;
    }
    links.push({ filename: file.filename, url: data.signedUrl });
  }

  if (links.length === 0) {
    return res.status(500).json({ error: "Files aren't available yet - contact marc@omriinvestments.com." });
  }

  return res.status(200).json({ links });
};
