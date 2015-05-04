package com.paphus.sdk.activity.forum;

import android.content.Intent;
import android.view.View;
import android.widget.TextView;

import com.paphus.brainbot.R;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.activity.WebMediumActivity;
import com.paphus.sdk.config.ForumConfig;

/**
 * Activity for viewing a forum's details.
 * To launch this activity from your app you can use the HttpFetchAction passing the forum id or name as a config.
 */
public class ForumActivity extends WebMediumActivity {
	
	public void browsePosts(View view) {
        Intent intent = new Intent(this, BrowsePostsActivity.class);		
        startActivity(intent);
	}
	
	public void newPost(View view) {
		if (MainActivity.user == null) {
			MainActivity.showMessage("You must sign in first", this);
			return;
		}
        Intent intent = new Intent(this, CreateForumPostActivity.class);		
        startActivity(intent);
	}

	public void resetView() {
        setContentView(R.layout.activity_forum);
		
        ForumConfig instance = (ForumConfig)MainActivity.instance;

        super.resetView();

        if (instance.isExternal) {
        	findViewById(R.id.newPostButton).setVisibility(View.GONE);
        	findViewById(R.id.postsButton).setVisibility(View.GONE);
        }

    	TextView text = (TextView) findViewById(R.id.postsLabel);
        if (instance.posts != null && instance.posts.length() > 0) {
	        text.setText(instance.posts + " posts");
        } else {
	        text.setText("");        	
        }
	}
	
	public String getType() {
		return "Forum";
	}
	
}
