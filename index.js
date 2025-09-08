import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const API_BASE = "https://api.jotform.com";
const API_KEY = process.env.JOTFORM_API_KEY;

// ✅ Create a new form
app.post("/create-form", async (req, res) => {
  try {
    const form = {
      properties: {
        title: "My API Created Form",
      },
      questions: {
        1: {
          type: "control_textbox",
          text: "Your Name",
          order: 1,
          name: "namefield",
        },
        2: {
          type: "control_email",
          text: "Your Email",
          order: 2,
          name: "emailfield",
        },
      },
    };

    const response = await axios.post(
      `${API_BASE}/user/forms?apiKey=${API_KEY}`,
      form
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create form" });
  }
});

// ✅ Get all forms
app.get("/forms", async (req, res) => {
  try {
    const response = await axios.get(
      `${API_BASE}/user/forms?apiKey=${API_KEY}`,
      {
        // headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
