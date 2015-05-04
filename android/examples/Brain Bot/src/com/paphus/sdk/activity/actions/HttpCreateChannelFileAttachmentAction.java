package com.paphus.sdk.activity.actions;

import android.app.Activity;

import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.activity.livechat.LiveChatActivity;
import com.paphus.sdk.config.MediaConfig;

public class HttpCreateChannelFileAttachmentAction extends HttpUIAction {

	MediaConfig config;
	String file;
	
	public HttpCreateChannelFileAttachmentAction(Activity activity, String file, MediaConfig config) {
		super(activity);
		this.config = config;
		this.file = file;
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		this.config = MainActivity.connection.createChannelFileAttachment(this.file, this.config);
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
		((LiveChatActivity)this.activity).sendFile(config);
    }
}