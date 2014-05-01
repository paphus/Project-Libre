package com.paphus.sdk.activity.forum;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.Spinner;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpGetPostsAction;
import com.paphus.sdk.config.BrowseConfig;


/**
 * Browse activity for searching for a forum post.
 */
public class BrowsePostsActivity extends Activity {

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_browse_posts);

		CheckBox checkbox = (CheckBox)findViewById(R.id.imagesCheckBox);
		checkbox.setChecked(MainActivity.showImages);
    	
		Spinner sortSpin = (Spinner) findViewById(R.id.sortSpin);
		ArrayAdapter adapter = new ArrayAdapter(this,
                android.R.layout.simple_spinner_dropdown_item, new String[]{
    				"date",
        			"name",
        			"views",
        			"views today",
        			"views this week",
        			"views this month"
        });
		sortSpin.setAdapter(adapter);

		Spinner tagSpin = (Spinner) findViewById(R.id.tagSpin);
		adapter = new ArrayAdapter(this,
                android.R.layout.simple_spinner_dropdown_item, MainActivity.getAllForumPostTags(this));
		tagSpin.setAdapter(adapter);
	}
	
	public void browse(View view) {
		BrowseConfig config = new BrowseConfig();
		
		config.typeFilter = "Public";
		RadioButton radio = (RadioButton)findViewById(R.id.personalRadio);
		if (radio.isChecked()) {
			config.typeFilter = "Personal";
		}
		Spinner sortSpin = (Spinner)findViewById(R.id.sortSpin);
		config.sort = (String)sortSpin.getSelectedItem();
		Spinner tagSpin = (Spinner)findViewById(R.id.tagSpin);
		config.tag = (String)tagSpin.getSelectedItem();
		EditText filterEdit = (EditText)findViewById(R.id.filterText);
		config.filter = filterEdit.getText().toString();
		CheckBox checkbox = (CheckBox)findViewById(R.id.imagesCheckBox);
		MainActivity.showImages = checkbox.isChecked();

		config.type = getType();
		if (MainActivity.instance != null) {
			config.instance = MainActivity.instance.id;
		}
		
		HttpAction action = new HttpGetPostsAction(this, config);
		action.execute();
	}
	
	public String getType() {		
		return "Post";
	}
}
