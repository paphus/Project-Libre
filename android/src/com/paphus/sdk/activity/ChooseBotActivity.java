package com.paphus.sdk.activity;

import java.util.List;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.ListView;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpFetchAction;
import com.paphus.sdk.config.InstanceConfig;
import com.paphus.sdk.config.WebMediumConfig;

/**
 * Activity for choosing a bot from the search results.
 */
public class ChooseBotActivity extends Activity {
	
	public List<WebMediumConfig> instances;
	public WebMediumConfig instance;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_choosebot);
		
		this.instances = MainActivity.instances;

		ListView list = (ListView) findViewById(R.id.instancesList);
		list.setAdapter(new ImageListAdapter(this, R.layout.image_list, this.instances));
	}
	
	@Override
	public void onResume() {
		this.instances = MainActivity.instances;

		ListView list = (ListView) findViewById(R.id.instancesList);
		list.setAdapter(new ImageListAdapter(this, R.layout.image_list, this.instances));
		
		super.onResume();
	}

	public void selectInstance(View view) {
        ListView list = (ListView) findViewById(R.id.instancesList);
        int index = list.getCheckedItemPosition();
        if (index < 0) {
        	MainActivity.showMessage("Select a bot", this);
        	return;
        }
        this.instance = instances.get(index);
        InstanceConfig config = new InstanceConfig();
        config.id = this.instance.id;
        config.name = this.instance.name;
		
        HttpAction action = new HttpFetchAction(this, config);
    	action.execute();
	}
}
