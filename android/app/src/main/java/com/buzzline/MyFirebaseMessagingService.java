package com.buzzline;

import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "BuzzLineFCM";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "Message received from: " + remoteMessage.getFrom());

        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Notification Title: " + remoteMessage.getNotification().getTitle());
            Log.d(TAG, "Notification Body: " + remoteMessage.getNotification().getBody());
        }

        // You can show local notification here using NotificationManager
        // For now, just logging
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "FCM Token: " + token);
        // Optionally send this token to your server
    }
}
