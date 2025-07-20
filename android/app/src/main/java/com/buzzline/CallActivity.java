package com.buzzline;

import android.app.KeyguardManager;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class CallActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_call);

        // Make this activity appear over the lock screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            );
        }

        // Get data from intent
        String callerName = getIntent().getStringExtra("caller_name");
        String callerMessage = getIntent().getStringExtra("caller_message");

        // Set up UI
        TextView titleText = findViewById(R.id.caller_name);
        TextView messageText = findViewById(R.id.caller_message);
        Button acceptButton = findViewById(R.id.accept_button);
        Button rejectButton = findViewById(R.id.reject_button);

        titleText.setText(callerName != null ? callerName : "Incoming Call");
        messageText.setText(callerMessage != null ? callerMessage : "BuzzLine Call");

        acceptButton.setOnClickListener(v -> {
            // Handle accept call
            // You can add your call handling logic here
            finish();
        });

        rejectButton.setOnClickListener(v -> {
            // Handle reject call
            finish();
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Clean up any resources
    }
}
