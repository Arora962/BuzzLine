// server.js
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

// Load service account
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🔴 Paste your actual device FCM token here
const registrationToken = process.env.FCM_REGISTRATION_TOKEN || 'flhP22TpQvu-uv7OsdOaDe:APA91bFWlfrF6PLAy6AzWa5zL7Xj-LV0_1rd4lmH4LXHT-np-_c_ordi2mHXdXteoBQ5Pq6gf_TqEWcw5bOQAmg2NYnQd8kHPZ_RerGTsTc30kmLqWxPhOY';

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/send', (req, res) => {
  const { type, title, body } = req.body;

  const message = {
  token: registrationToken,
  notification: {
    title,
    body,
  },
  android: {
    priority: 'high',
    notification: {
      channelId: type === 'call' ? 'calls_channel' : 'misc_channel',
      sound: 'default',
      visibility: 'public', 
      priority: 'high',     
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
      },
    },
  },
  data: {
    type: type,
    customData: 'value',
  },
};

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log('✅ Successfully sent message:', response);
      res.send(`
        <h2 style="color:green;">✅ Notification sent successfully!</h2>
        <a href="/">Back</a>
      `);
    })
    .catch((error) => {
      console.error('❌ Error sending message:', error);
      res.send(`
        <h2 style="color:red;">❌ Error sending notification</h2>
        <pre>${error.message}</pre>
        <a href="/">Back</a>
      `);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend is live at http://localhost:${PORT}`);
});
