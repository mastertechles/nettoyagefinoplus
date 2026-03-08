import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express BEFORE using it
const app = express();



app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});







// Allow local frontend
app.use(cors({ origin: [

  "https://nettoyagefinoplus.ca",
  "https://www.nettoyagefinoplus.ca"

] 

 }));
 
app.use(express.json());


// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",

 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }

  
});

app.post("/contact", async (req, res) => {
  try {
    // Log request body to ensure we receive everything
    console.log("Incoming contact form data:", req.body);

    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }


    // Send email
    await transporter.sendMail({
      from: `"Website Form" <${process.env.SMTP_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `New message from ${name}`,


      text: `
New message from website contact form:

Name: ${name}
Email: ${email}
Phone: ${phone}
Message:
${message}
`,
      html: `
<h2>New message from website contact form</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Message:</strong><br/>${message}</p>
`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});