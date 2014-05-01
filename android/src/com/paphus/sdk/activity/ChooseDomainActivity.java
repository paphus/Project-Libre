package com.paphus.sdk.activity;

import android.view.View;
import android.widget.ListView;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpFetchAction;
import com.paphus.sdk.config.DomainConfig;

/**
 * Activity for choosing a domain from the search results.
 */
public class ChooseDomainActivity extends ChooseBotActivity {

	public void selectInstance(View view) {
        ListView list = (ListView) findViewById(R.id.instancesList);
        int index = list.getCheckedItemPosition();
        if (index < 0) {
        	MainActivity.showMessage("Select a domain", this);
        	return;
        }
        this.instance = instances.get(index);
        DomainConfig config = new DomainConfig();
        config.id = this.instance.id;
		
        HttpAction action = new HttpFetchAction(this, config);
    	action.execute();
	}
}
