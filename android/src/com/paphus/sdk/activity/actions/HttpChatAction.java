package com.paphus.sdk.activity.actions;

import android.app.Activity;
import android.text.Html;
import android.view.View;
import android.widget.ImageView;
import android.widget.ScrollView;
import android.widget.TextView;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.ChatActivity;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.config.ChatConfig;
import com.paphus.sdk.config.ChatResponse;

public class HttpChatAction extends HttpUIAction {
	ChatConfig config;
	ChatResponse response;

	public HttpChatAction(Activity activity, ChatConfig config) {
		super(activity);
		this.config = config;
	}

	@Override
	protected String doInBackground(Void... params) {
		try {
		this.response = MainActivity.connection.chat(this.config);
		} catch (Exception exception) {
			this.exception = exception;
		}
		return "";
	}
	
	@Override
	protected void onPreExecute() {
		if (!this.config.disconnect) {
			super.onPreExecute();
		}
	}

	@Override
	protected void onPostExecute(String xml) {
		if (this.config.disconnect) {
			return;
		}
		super.onPostExecute(xml);
		if (this.exception != null) {
			return;
		}
		try {
			MainActivity.conversation = this.response.conversation;

	        HttpGetImageAction.fetchImage(this.activity, this.response.avatar, (ImageView)this.activity.findViewById(R.id.imageView));
	        
			if (this.response.message == null) {
				return;
			}
			String response = this.response.message;
	
			TextView log = (TextView) this.activity.findViewById(R.id.logText);
			((ChatActivity)this.activity).html = ((ChatActivity)this.activity).html + "<b>" + MainActivity.instance.name + "</b><br/>"  + response + "<br/>";
			log.setText(Html.fromHtml(((ChatActivity)this.activity).html));
			ScrollView scroll = (ScrollView) this.activity.findViewById(R.id.scrollView);
			scroll.fullScroll(View.FOCUS_DOWN);
	
			((ChatActivity)this.activity).response(response);
		} catch (Exception error) {
			this.exception = error;
			MainActivity.error(this.exception.getMessage(), this.exception, this.activity);
			return;			
		}
	}
}