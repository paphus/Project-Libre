package com.paphus.sdk.activity.actions;

import java.util.List;

import android.app.Activity;

import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.config.ContentConfig;

public class HttpGetCategoriesAction extends HttpAction {
	ContentConfig config;
	List<String> categories;
	
	public HttpGetCategoriesAction(Activity activity, ContentConfig config) {
		super(activity);
		this.config = config;
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		this.categories = MainActivity.connection.getCategories(this.config);
		} catch (Exception exception) {
			this.exception = exception;
		}
		return "";
	}

	public void postExecute(String xml) {
		if (this.exception != null) {
			return;
		}
		if (this.config.type.equals("Bot")) {
			MainActivity.categories = categories.toArray();
		} else if (this.config.type.equals("Forum")) {
			MainActivity.forumCategories = categories.toArray();
		} else if (this.config.type.equals("Channel")) {
			MainActivity.channelCategories = categories.toArray();
		}
	}
}