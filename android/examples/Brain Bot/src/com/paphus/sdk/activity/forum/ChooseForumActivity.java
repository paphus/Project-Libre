package com.paphus.sdk.activity.forum;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;

import com.paphus.brainbot.R;
import com.paphus.sdk.activity.ChooseBotActivity;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpFetchAction;
import com.paphus.sdk.config.ForumConfig;

/**
 * Activity for choosing a forum from the search results.
 */
public class ChooseForumActivity extends ChooseBotActivity {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		((Button)findViewById(R.id.chatButton)).setText("Posts");
	}
	
	public void selectInstance(View view) {
        ListView list = (ListView) findViewById(R.id.instancesList);
        int index = list.getCheckedItemPosition();
        if (index < 0) {
        	MainActivity.showMessage("Select a forum", this);
        	return;
        }
        this.instance = this.instances.get(index);
        ForumConfig config = new ForumConfig();
        config.id = this.instance.id;
		
        HttpAction action = new HttpFetchAction(this, config);
    	action.execute();
	}

	public void chat(View view) {
        ListView list = (ListView) findViewById(R.id.instancesList);
        int index = list.getCheckedItemPosition();
        if (index < 0) {
        	MainActivity.showMessage("Select a forum", this);
        	return;
        }
        this.instance = instances.get(index);
        ForumConfig config = new ForumConfig();
        config.id = this.instance.id;
        config.name = this.instance.name;
		
        HttpAction action = new HttpFetchAction(this, config, true);
    	action.execute();
	}
}
