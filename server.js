const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables from .env file

// Path to your service account key file
const serviceAccount = require('./serviceAccountKey1.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = 1000;

// Middleware
app.use(bodyParser.json());

// Endpoint to handle client subscription
app.post('/send-notification', (req, res) => {
  const { token, title, body } = req.body;
  const apiKey = req.headers['x-api-key'];
  
  // Validate API key
  if (!apiKey || apiKey !== process.env.PRIVATE_KEY) {
    return res.status(401).send('Unauthorized: Invalid or missing API key.');
  }

  // Validate request data
  if (!token || !title || !body) {
    return res.status(400).send('Missing required fields: token, title, and body are required.');
  }

  const message = {
    notification: {
      title: title,
      body: body,
      imageUrl: "https://i.ibb.co/YdVbRPn/icon.png"
    },
    data: {
      title: title,
      body: body
    },
    token: token,
    android: {
      ttl: 3600 * 1000,
      priority: 'high',
    }
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.status(200).send('Notification sent successfully!');
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      
      if (error.code === 'messaging/invalid-recipient') {
        res.status(400).send('Invalid token or recipient.');
      } else if (error.code === 'messaging/invalid-payload') {
        res.status(400).send('Invalid message payload.');
      } else if (error.code === 'messaging/invalid-argument') {
        res.status(400).send('Invalid argument in message.');
      } else {
        res.status(500).send('Failed to send notification due to an internal server error.');
      }
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
