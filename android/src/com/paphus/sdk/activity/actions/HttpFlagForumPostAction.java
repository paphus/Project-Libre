package com.paphus.sdk.activity.actions;

import android.app.Activity;
import android.view.View;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.config.ForumPostConfig;

public class HttpFlagForumPostAction extends HttpUIAction {
	ForumPostConfig config;

	public HttpFlagForumPostAction(Activity activity, ForumPostConfig config) {
		super(activity);
		this.config = config;
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		MainActivity.connection.flag(this.config);
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
	    MainActivity.post.isFlagged = true;
	    this.activity.findViewById(R.id.flaggedLabel).setVisibility(View.VISIBLE);
	}
}