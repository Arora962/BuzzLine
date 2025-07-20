package com.buzzline;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.facebook.react.HeadlessJsTaskService;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "BuzzLineFCM";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        String title = remoteMessage.getNotification() != null ? remoteMessage.getNotification().getTitle() : "BuzzLine";
        String message = remoteMessage.getNotification() != null ? remoteMessage.getNotification().getBody() : "You have a new message";

        Log.d(TAG, "Message received: " + title);

        // Determine channel based on title
        String channelId = title.toLowerCase().contains("call") ? "calls_channel" : "misc_channel";

        showNotification(title, message, channelId);
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "FCM Token: " + token);
    }

    private void showNotification(String title, String message, String channelId) {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

        // Create channel if needed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel;
            if (channelId.equals("calls_channel")) {
                channel = new NotificationChannel(channelId, "Calls", NotificationManager.IMPORTANCE_HIGH);
            } else {
                channel = new NotificationChannel(channelId, "Miscellaneous", NotificationManager.IMPORTANCE_DEFAULT);
            }
            manager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, intent, PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        manager.notify(0, builder.build());
    }
}
