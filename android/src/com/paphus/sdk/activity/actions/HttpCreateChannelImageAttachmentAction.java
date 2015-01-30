package com.paphus.sdk.activity.actions;

import android.app.Activity;

import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.config.MediaConfig;

public class HttpCreateChannelImageAttachmentAction extends HttpCreateChannelFileAttachmentAction {
	
	public HttpCreateChannelImageAttachmentAction(Activity activity, String file, MediaConfig config) {
		super(activity, file, config);
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		this.config = MainActivity.connection.createChannelImageAttachment(this.file, this.config);
		} catch (Exception exception) {
			this.exception = exception;
		}
		return "";
	}
}