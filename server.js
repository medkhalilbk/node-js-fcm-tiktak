const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Path to your service account key file
const serviceAccount = require('./serviceAccountKey1.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Endpoint to handle client subscription
app.post('/send-notification', (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
      imageUrl:"https://i.ibb.co/YdVbRPn/icon.png"
    },
    data:{
        title:title,
        body:body
    } , 
    token: token,
    android:{
        ttl:3600 * 1000,
        priority:'high',
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
      res.status(500).send('Failed to send notification');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
