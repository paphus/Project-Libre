package com.paphus.sdk.activity.actions;

import android.app.Activity;

import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.config.InstanceConfig;
import com.paphus.sdk.config.VoiceConfig;

public class HttpGetVoiceAction extends HttpAction {
	InstanceConfig config;
	VoiceConfig voice;

	public HttpGetVoiceAction(Activity activity, InstanceConfig config) {
		super(activity);
		this.config = config;
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		this.voice = MainActivity.connection.getVoice(this.config);
		} catch (Exception exception) {
			this.exception = exception;
		}
		return "";
	}

	@Override
	public void onPostExecute(String xml) {
		if (this.exception != null) {
			return;
		}
		try {
			MainActivity.voice = this.voice;
		} catch (Exception error) {
			this.exception = error;
			return;
		}
	}
	
}