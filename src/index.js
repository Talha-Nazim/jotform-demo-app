import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import  swaggerDocument  from "./swagger.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// ✅ Get and update a new form
app.post("/clone-and-fill", async (req, res) => {
  try {
    const { templateFormId, replacements } = req.body;
    if (!templateFormId || !replacements) return res.status(400).json({ error: "templateFormId and replacements required" });

    // 1) Clone
    const cloneResp = await axios.post(`${API_BASE}/form/${templateFormId}/clone?apiKey=${API_KEY}`);
    const newFormId = cloneResp.data.content.id;

    // 2) Get questions from cloned form
    const qResp = await axios.get(`${API_BASE}/form/${newFormId}/questions?apiKey=${API_KEY}`);
    const questions = qResp.data.content; // object keyed by qid

    // 3) For each question check placeholder and update
    const updatePromises = [];
    for (const [qid, qObj] of Object.entries(questions)) {
      const text = qObj.text || qObj.label || ""; // sometimes question object uses 'text' or 'label'
      for (const [placeholder, newText] of Object.entries(replacements)) {
        if (String(text).includes(placeholder)) {
          const updates = { text: String(text).replace(placeholder, newText) };
          // Optionally update 'name' or other props:
          // if (qObj.name && replacementsNameMap) { updates.name = ... }
          updatePromises.push(
            axios.post(`${API_BASE}/form/${newFormId}/question/${qid}?apiKey=${API_KEY}`, updates)
          );
        }
      }
    }

    await Promise.all(updatePromises);

    res.json({
      message: "Cloned and updated",
      newFormUrl: `https://form.jotform.com/${newFormId}`,
      newFormId,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Clone/update failed", details: err.response?.data || err.message });
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

// app.listen(5000, () => {
//   console.log("🚀 Server running on http://localhost:5000");
// });

export default app;
