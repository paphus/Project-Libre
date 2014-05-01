package com.paphus.sdk.activity.actions;

import java.util.List;

import android.app.Activity;

import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.config.ContentConfig;

public class HttpGetTagsAction extends HttpAction {
	ContentConfig config;
	List<String> tags;

	public HttpGetTagsAction(Activity activity, ContentConfig config) {
		super(activity);
		this.config = config;
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		this.tags = MainActivity.connection.getTags(this.config);
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
			MainActivity.tags = this.tags.toArray();
		} else if (this.config.type.equals("Forum")) {
			MainActivity.forumTags = this.tags.toArray();
		} else if (this.config.type.equals("Post")) {
			MainActivity.forumPostTags = this.tags.toArray();
		} else if (this.config.type.equals("Channel")) {
			MainActivity.channelTags = this.tags.toArray();
		}
	}
}