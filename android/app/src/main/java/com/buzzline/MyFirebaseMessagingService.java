package com.buzzline;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "BuzzLineFCM";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        String title = remoteMessage.getNotification() != null ? remoteMessage.getNotification().getTitle() : "BuzzLine";
        String message = remoteMessage.getNotification() != null ? remoteMessage.getNotification().getBody() : "You have a new message";
        String type = remoteMessage.getData().get("type");

        Log.d(TAG, "Message received: " + title + " | type: " + type);

        if ("call".equalsIgnoreCase(type)) {
            showCallNotification(title, message);
        } else {
            showNormalNotification(title, message);
        }
    }

    private void showCallNotification(String title, String message) {
        String channelId = "calls_channel";

        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

        // Create high-importance call channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "Calls",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("BuzzLine Call Notifications");
            channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(channel);
        }

        // Intent to launch CallActivity (full screen call interface)
        Intent callActivityIntent = new Intent(this, CallActivity.class);
        callActivityIntent.putExtra("caller_name", title);
        callActivityIntent.putExtra("caller_message", message);
        callActivityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent fullScreenIntent = PendingIntent.getActivity(
            this, 0, callActivityIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Intent to open the main app when notification body is tapped
        Intent mainActivityIntent = new Intent(this, MainActivity.class);
        mainActivityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 1, mainActivityIntent, PendingIntent.FLAG_IMMUTABLE);

        // Broadcast intent for "Reject"
        Intent rejectIntent = new Intent(this, NotificationDismissReceiver.class);
        PendingIntent rejectPendingIntent = PendingIntent.getBroadcast(this, 2, rejectIntent, PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setFullScreenIntent(fullScreenIntent, true)
                .setContentIntent(contentIntent)
                .addAction(R.mipmap.ic_launcher, "Accept", fullScreenIntent)
                .addAction(R.mipmap.ic_launcher, "Reject", rejectPendingIntent)
                .setAutoCancel(true)
                .setOngoing(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        manager.notify(101, builder.build());
    }

    private void showNormalNotification(String title, String message) {
        String channelId = "misc_channel";

        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

        // Create misc channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "Miscellaneous",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("BuzzLine Other Notifications");
            manager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 3, intent, PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent);

        manager.notify(102, builder.build());
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "FCM Token: " + token);
        super.onNewToken(token);
    }
}
