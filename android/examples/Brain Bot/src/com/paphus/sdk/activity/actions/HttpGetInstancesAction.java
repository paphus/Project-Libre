package com.paphus.sdk.activity.actions;

import java.util.List;

import android.app.Activity;
import android.content.Intent;

import com.paphus.sdk.activity.ChooseBotActivity;
import com.paphus.sdk.activity.ChooseDomainActivity;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.activity.forum.ChooseForumActivity;
import com.paphus.sdk.activity.livechat.ChooseChannelActivity;
import com.paphus.sdk.config.BrowseConfig;
import com.paphus.sdk.config.WebMediumConfig;

public class HttpGetInstancesAction extends HttpUIAction {
	BrowseConfig config;
	List<WebMediumConfig> instances;

	public HttpGetInstancesAction(Activity activity, BrowseConfig config) {
		super(activity);
		this.config = config;
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		this.instances = MainActivity.connection.browse(config);
		} catch (Exception exception) {
			this.exception = exception;
		}
		return "";
	}

	@Override
	public void onPostExecute(String xml) {
		super.onPostExecute(xml);
		if (this.exception != null) {
			return;
		}
		MainActivity.instances = this.instances;
		
		if (config.type.equals("Bot")) {
	        Intent intent = new Intent(this.activity, ChooseBotActivity.class);		
	        this.activity.startActivity(intent);
		} else if (config.type.equals("Forum")) {
	        Intent intent = new Intent(this.activity, ChooseForumActivity.class);		
	        this.activity.startActivity(intent);
		} else if (config.type.equals("Channel")) {
	        Intent intent = new Intent(this.activity, ChooseChannelActivity.class);		
	        this.activity.startActivity(intent);
		} else if (config.type.equals("Domain")) {
	        Intent intent = new Intent(this.activity, ChooseDomainActivity.class);		
	        this.activity.startActivity(intent);
		}
	}
}