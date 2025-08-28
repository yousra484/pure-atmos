require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/contact', async (req, res) => {
  const { nom, email, entreprise, telephone, sujet, message } = req.body;

  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Les champs nom, email, sujet et message sont obligatoires.' 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Vérifier la connexion SMTP
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Nouvelle demande de contact - ${sujet}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Nouvelle demande de contact - Pure Atmos Solutions
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Informations du contact :</h3>
            <p><strong>Nom :</strong> ${nom}</p>
            <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Entreprise :</strong> ${entreprise || 'Non spécifiée'}</p>
            <p><strong>Téléphone :</strong> ${telephone || 'Non spécifié'}</p>
            <p><strong>Sujet :</strong> ${sujet}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Message :</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Email envoyé automatiquement depuis le formulaire de contact de pureatmos.site<br>
            Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé avec succès:', info.messageId);
    
    res.status(200).json({ 
      success: true,
      message: 'Votre message a été envoyé avec succès.',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de l'envoi de l'email.", 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
});
