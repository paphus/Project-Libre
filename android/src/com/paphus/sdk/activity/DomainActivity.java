package com.paphus.sdk.activity;

import com.paphus.sdk.activity.R;

import android.content.Intent;
import android.view.View;

/**
 * Activity for viewing a domain details.
 */
public class DomainActivity extends WebMediumActivity {

	public void resetView() {
        setContentView(R.layout.activity_domain);

        super.resetView();
	}

	public void browse(View view) {
		MainActivity.type = "Bots";
		
        Intent intent = new Intent(this, MainActivity.class);
		intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
	}
	
	public String getType() {
		return "Domain";
	}
	
}
