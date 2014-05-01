package com.paphus.sdk.activity.forum;

import java.util.List;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.ListView;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpFetchForumPostAction;
import com.paphus.sdk.config.ForumPostConfig;

/**
 * Activity for choosing a forum post from the search results.
 */
public class ChoosePostActivity extends Activity {
	
	public List<ForumPostConfig> instances;
	public ForumPostConfig instance;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_choosepost);
		
		this.instances = MainActivity.posts;

		ListView list = (ListView) findViewById(R.id.instancesList);
		list.setAdapter(new ForumPostImageListAdapter(this, R.layout.forumpost_list, this.instances));
	}
	
	@Override
	public void onResume() {
		this.instances = MainActivity.posts;

		ListView list = (ListView) findViewById(R.id.instancesList);
		list.setAdapter(new ForumPostImageListAdapter(this, R.layout.forumpost_list, this.instances));
		
		super.onResume();
	}

	public void selectInstance(View view) {
        ListView list = (ListView) findViewById(R.id.instancesList);
        int index = list.getCheckedItemPosition();
        if (index < 0) {
        	MainActivity.showMessage("Select a post", this);
        	return;
        }
        this.instance = instances.get(index);
        ForumPostConfig config = new ForumPostConfig();
        config.id = this.instance.id;
		
        HttpAction action = new HttpFetchForumPostAction(this, config);
    	action.execute();
	}
}
