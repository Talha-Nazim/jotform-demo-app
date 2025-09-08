import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());

const API_BASE = "https://api.jotform.com";
const API_KEY = process.env.JOTFORM_API_KEY;

// POST body: { templateFormId: "252504582895466", replacements: { "{{NAME}}": "Full Name", "{{EMAIL}}": "Email Address" } }
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

app.listen(5000, () => console.log("Listening on 5000"));
