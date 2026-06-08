require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

console.log("ACCESS TOKEN LOADED:", !!ACCESS_TOKEN);
console.log("TOKEN LENGTH:", ACCESS_TOKEN?.length || 0);
console.log("TOKEN FIRST 20:", ACCESS_TOKEN?.substring(0, 20));
console.log("TOKEN LAST 10:", ACCESS_TOKEN?.slice(-10));

// =====================================
// DEBUG TOKEN ROUTE
// =====================================
app.get("/test-token", (req, res) => {
  res.json({
    tokenLoaded: !!ACCESS_TOKEN,
    tokenLength: ACCESS_TOKEN?.length || 0,
    verifyTokenLoaded: !!VERIFY_TOKEN
  });
});

// =====================================
// DEBUG WHOAMI ROUTE
// =====================================
app.get("/whoami", async (req, res) => {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v23.0/me",
      {
        params: {
          access_token: ACCESS_TOKEN
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.json(err.response?.data || err.message);
  }
});

// =====================================
// DEBUG CHECK-TOKEN ROUTE
// =====================================
app.get("/check-token", async (req, res) => {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v23.0/me",
      {
        params: {
          access_token: ACCESS_TOKEN,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.json(err.response?.data || err.message);
  }
});

// =====================================
// DEBUG IG-TEST ROUTE
// =====================================
app.get("/ig-test", async (req, res) => {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v23.0/me",
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.json(err.response?.data || err.message);
  }
});

// =====================================
// DEBUG PAGE-INFO ROUTE
// =====================================
app.get("/page-info", async (req, res) => {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v23.0/me",
      {
        params: {
          fields: "id,name,instagram_business_account",
          access_token: ACCESS_TOKEN
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.json(err.response?.data || err.message);
  }
});

// =====================================
// DEBUG TOKEN-INFO ROUTE
// =====================================
app.get("/token-info", (req, res) => {
  res.json({
    length: ACCESS_TOKEN?.length || 0,
    first20: ACCESS_TOKEN?.substring(0, 20),
    last20: ACCESS_TOKEN?.slice(-20)
  });
});

// =====================================
// HOME
// =====================================
app.get("/", (req, res) => {
  res.send("Instagram Automation Running 🚀");
});

// =====================================
// PRIVACY POLICY
// =====================================
app.get("/privacy-policy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>Surya Tea Shop Instagram Automation.</p>
    <p>This application uses the Instagram Graph API to automate replies to comments and messages.</p>
    <p>No personal information is sold or shared with third parties.</p>
    <p>Contact: venugopal902565@gmail.com</p>
  `);
});

// =====================================
// TERMS OF SERVICE
// =====================================
app.get("/terms", (req, res) => {
  res.send(`
    <h1>Terms of Service</h1>
    <p>By using this automation service, you agree to use it responsibly.</p>
    <p>This service is provided as-is.</p>
    <p>Contact: venugopal902565@gmail.com</p>
  `);
});

// =====================================
// DATA DELETION
// =====================================
app.get("/delete-data", (req, res) => {
  res.send(`
    <h1>Delete User Data</h1>
    <p>To request deletion of your data, send an email to:</p>
    <h3>venugopal902565@gmail.com</h3>
    <p>Subject: Delete My Instagram Data</p>
  `);
});

// =====================================
// WEBHOOK VERIFY
// =====================================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// =====================================
// WEBHOOK RECEIVE
// =====================================
app.post("/webhook", async (req, res) => {
  try {
    console.log(JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    if (!entry) {
      return res.sendStatus(200);
    }

    const change = entry.changes?.[0];
    if (!change) {
      return res.sendStatus(200);
    }

    if (change.field === "comments" && change.value) {
      const commentText = change.value.text || "";
      const userId = change.value.from?.id;

      console.log("Comment:", commentText);
      console.log("User:", userId);

      let reply = "Welcome to Surya Tea Shop ☕";

      if (commentText.toLowerCase().includes("menu")) {
        reply = "Tea Menu: Masala Tea ₹20, Ginger Tea ₹25, Green Tea ₹30";
      } else if (commentText.toLowerCase().includes("offer")) {
        reply = "🎉 Today's Offer: Buy 2 Teas Get 1 Free!";
      } else if (commentText.toLowerCase().includes("price")) {
        reply = "☕ Tea starts from ₹20 only.";
      }

      const commentId = change.value.id;

      try {
        const response = await axios.post(
          `https://graph.facebook.com/v23.0/${commentId}/replies`,
          {
            message: reply
          },
          {
            params: { access_token: ACCESS_TOKEN }
          }
        );
        console.log("Reply Sent:", response.data);
      } catch (err) {
        console.error("Reply Error:", err.response?.data || err.message);
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.error("Webhook Error:", err.response?.data || err.message);
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});