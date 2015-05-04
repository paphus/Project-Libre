package com.paphus.sdk.activity.forum;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

import com.paphus.sdk.activity.MainActivity;
import com.paphus.brainbot.R;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpCreateForumPostAction;
import com.paphus.sdk.activity.actions.HttpGetTagsAction;
import com.paphus.sdk.config.ForumPostConfig;

/**
 * Activity for creating a new forum post.
 */
public class CreateForumPostActivity extends Activity {
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_forumpost);
        
        resetView();
	}

	public void resetView() {

    	HttpAction action = new HttpGetTagsAction(this, "Post");
    	action.execute();
	}
    
    /**
     * Create the instance.
     */
    public void create(View view) {
    	ForumPostConfig config = new ForumPostConfig();
    	saveProperties(config);
    	config.forum = MainActivity.instance.id;
		
    	HttpAction action = new HttpCreateForumPostAction(
        		this, 
        		config);
        action.execute();
    }

    public void saveProperties(ForumPostConfig instance) {    	
        EditText text = (EditText) findViewById(R.id.topicText);
        instance.topic = text.getText().toString().trim();
        text = (EditText) findViewById(R.id.detailsText);
        instance.details = text.getText().toString().trim();
    	text = (EditText) findViewById(R.id.tagsText);
    	instance.tags = text.getText().toString().trim();
    }

    public void cancel(View view) {        
    	finish();
    }
}
