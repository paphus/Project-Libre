package com.paphus.sdk.activity;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpChangeUserIconAction;
import com.paphus.sdk.activity.actions.HttpFlagUserAction;
import com.paphus.sdk.activity.actions.HttpGetImageAction;
import com.paphus.sdk.config.UserConfig;
import com.paphus.sdk.config.WebMediumConfig;

/**
 * Activity for viewing a user's details.
 */
public class ViewUserActivity extends CreateUserActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_user);
        resetView();
	}
	
	public void resetView() {
        UserConfig user = MainActivity.viewUser;
        if (user == null) {
        	return;
        }
        
        setTitle(user.name);
        
        TextView text = (TextView) findViewById(R.id.userText);
        text.setText(user.user);
        text = (TextView) findViewById(R.id.nameText);
        if (user.showName) {
        	text.setText(user.name);
        } else {
        	text.setVisibility(View.GONE);
            text = (TextView) findViewById(R.id.nameLabel);
        	text.setVisibility(View.GONE);
        }
        text = (TextView) findViewById(R.id.websiteText);
        if (user.website == null || user.website.length() == 0) {
        	text.setVisibility(View.GONE);
            text = (TextView) findViewById(R.id.websiteLabel);
        	text.setVisibility(View.GONE);        	
        } else {
        	text.setText(user.website);
        }
        text = (TextView) findViewById(R.id.joinedText);
        text.setText(user.joined);
        text = (TextView) findViewById(R.id.connectsText);
        text.setText(user.connects);
        text = (TextView) findViewById(R.id.lastConnectText);
        text.setText(user.lastConnect);
        text = (TextView) findViewById(R.id.botsText);
        text.setText(user.bots);
        text = (TextView) findViewById(R.id.postsText);
        text.setText(user.posts);
        text = (TextView) findViewById(R.id.messagesText);
        text.setText(user.messages);
        text = (TextView) findViewById(R.id.bioText);
        text.setText(user.bio);
        
        HttpGetImageAction.fetchImage(this, MainActivity.viewUser.avatar, (ImageView)findViewById(R.id.imageView));
	}

	
	@Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        MenuInflater menuInflater = getMenuInflater();
        menuInflater.inflate(R.layout.menu_view_user, menu);
        return true;
    }
	
	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {
        for (int index = 0; index < menu.size(); index++) {
    	    menu.getItem(index).setEnabled(true);        	
        }
        if (MainActivity.user == null || MainActivity.user == MainActivity.viewUser) {
    	    menu.findItem(R.id.menuFlag).setEnabled(false);
        }
        if (MainActivity.user != MainActivity.viewUser) {
    	    menu.findItem(R.id.menuChangeIcon).setEnabled(false);
        }
	    return true;
	}
	
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
         
        switch (item.getItemId())
        {
	    case R.id.menuChangeIcon:
	    	changeIcon();
	        return true;
	    case R.id.menuFlag:
	    	flag();
	        return true;
        default:
            return super.onOptionsItemSelected(item);
        }
    }

	public void flag() {
        if (MainActivity.user == null) {
        	MainActivity.showMessage("You must sign in to flag a user", this);
        	return;
        }
        final EditText text = new EditText(this);
        MainActivity.prompt("Enter reason for flagging the user", this, text, new DialogInterface.OnClickListener() {
	        public void onClick(DialogInterface dialog, int whichButton) {
	            WebMediumConfig instance = MainActivity.instance.credentials();
	            instance.flaggedReason = text.getText().toString();
	            if (instance.flaggedReason.trim().length() == 0) {
	            	MainActivity.error("You must enter a valid reason for flagging the user", null, ViewUserActivity.this);
	            	return;
	            }
	            
	            HttpAction action = new HttpFlagUserAction(ViewUserActivity.this, MainActivity.viewUser);
	        	action.execute();
	        }
        });
	}

	public void changeIcon() {
		Intent upload = new Intent(Intent.ACTION_GET_CONTENT);
		upload.setType("image/*");
		startActivityForResult(upload, 1);
	}

	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (resultCode != RESULT_OK) {
			return;
		}
		try {
			String file = MainActivity.getFilePathFromURI(this, data.getData());
			HttpAction action = new HttpChangeUserIconAction(this, file, MainActivity.user);
			action.execute().get();
    		if (action.getException() != null) {
    			throw action.getException();
    		}
		} catch (Exception exception) {
			MainActivity.error(exception.getMessage(), exception, this);
			return;
		}
	}

	public void menu(View view) {
		openOptionsMenu();
	}
}
