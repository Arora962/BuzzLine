package com.buzzline;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class NotificationDismissReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("BuzzLineFCM", "Call Rejected by user.");
        // Do nothing, just dismisses the notification
    }
}
