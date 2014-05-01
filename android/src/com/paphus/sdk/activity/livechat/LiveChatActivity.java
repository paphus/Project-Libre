package com.paphus.sdk.activity.livechat;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.text.Html;
import android.util.Log;
import android.view.GestureDetector;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.TextView.OnEditorActionListener;
import android.widget.Toast;

import com.paphus.sdk.LiveChatConnection;
import com.paphus.sdk.LiveChatListener;
import com.paphus.sdk.activity.MainActivity;
import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.ViewUserActivity;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpGetImageAction;
import com.paphus.sdk.activity.actions.HttpGetLiveChatUsersAction;
import com.paphus.sdk.config.ChannelConfig;
import com.paphus.sdk.config.UserConfig;
import com.paphus.sdk.config.VoiceConfig;
import com.paphus.sdk.config.WebMediumConfig;

/**
 * Activity for live chat and chatrooms.
 * To launch this activity from your app you can use the HttpFetchAction passing the channel id or name as a config, and launch=true.
 */
public class LiveChatActivity extends Activity implements TextToSpeech.OnInitListener {
    static final int RESULT_SPEECH = 1;
    
    protected TextToSpeech tts;
    protected LiveChatConnection connection;
    protected EditText textView;
    protected boolean speak = true;
    protected boolean chime = false;
    protected MediaPlayer chimePlayer;
    
    public String html = "";
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_livechat);

        TextView text = (TextView) findViewById(R.id.nameLabel);
        text.setText(MainActivity.instance.name);
        
        this.tts = new TextToSpeech(this, this);

        this.textView = (EditText) findViewById(R.id.messageText);
        this.textView.setOnEditorActionListener(new OnEditorActionListener() {			
			@Override
			public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
				submitChat();
				return false;
			}
		});

		ImageButton  button = (ImageButton) findViewById(R.id.speakButton);
		button.setOnClickListener(new View.OnClickListener() { 
            @Override
            public void onClick(View v) { 
                Intent intent = new Intent(
                        RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
 
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, "en-US");
 
                try {
                    startActivityForResult(intent, RESULT_SPEECH);
                    textView.setText("");
                } catch (ActivityNotFoundException a) {
                    Toast t = Toast.makeText(getApplicationContext(),
                            "Your device doesn't support Speech to Text",
                            Toast.LENGTH_SHORT);
                    t.show();
                }
            }
        });

		final ListView list = (ListView) findViewById(R.id.usersList);
		list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
		   public void onItemClick(AdapterView<?> adapter, View view, int position, long arg) {
				UserConfig userConfig = (UserConfig)list.getItemAtPosition(position);
				System.out.println(userConfig);
				System.out.println(position);
				if (userConfig != null) {
					setText(userConfig.user + ": ");
				}
			}
		});
		
		GestureDetector.SimpleOnGestureListener listener = new GestureDetector.SimpleOnGestureListener() {
			@Override
			public boolean onDoubleTapEvent(MotionEvent event) {
				if (event.getAction() == MotionEvent.ACTION_UP) {
					View imageLayout = findViewById(R.id.usersList);
					if (imageLayout.getVisibility() == View.VISIBLE) {
						imageLayout.setVisibility(View.GONE);
					} else {
						imageLayout.setVisibility(View.VISIBLE);					
					}
					return true;
				}
				return false;
			}
		};
		final GestureDetector detector = new GestureDetector(this, listener);
		findViewById(R.id.scrollView).setOnTouchListener(new View.OnTouchListener() {			
			@Override
			public boolean onTouch(View v, MotionEvent event) {
				return detector.onTouchEvent(event);
			}
		});
		
        HttpGetImageAction.fetchImage(this, MainActivity.instance.avatar, (ImageView)findViewById(R.id.imageView));

		try {
			this.connection = new LiveChatConnection(MainActivity.connection.getCredentials(),
					new LiveChatListener() {						
						@Override
						public void message(String message) {
							response(message);							
						}
						
						@Override
						public void info(String message) {
							response(message);							
						}
						
						@Override
						public void error(String message) {
							response(message);							
						}
					    
					    public void updateUsers(String csv) {
							HttpAction action = new HttpGetLiveChatUsersAction(LiveChatActivity.this, csv);
							action.execute();
							return;
					    }
						
						@Override
						public void closed() {	}		
					});
			this.connection.connect((ChannelConfig)MainActivity.instance, MainActivity.user);
		} catch (Exception exception) {
			MainActivity.error(exception.getMessage(), exception, this);
		}
	}
	
	@Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
 
        switch (requestCode) {
        case RESULT_SPEECH: {
            if (resultCode == RESULT_OK && null != data) {
 
                ArrayList<String> text = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
 
                textView.setText(text.get(0));
                submitChat();
            }
            break;
        }
 
        }
    }

	public void submitChat() {
		EditText v = (EditText) findViewById(R.id.messageText);
		String input = v.getText().toString().trim();
		if (input.equals("")) {
			return;
		}
		
		this.connection.sendMessage(input);
		
		v.setText("");
	}

	public void setText(String text) {
		EditText edit = (EditText) findViewById(R.id.messageText);
		edit.setText(text);
	}

	public void sendMessage(String text) {
		this.connection.sendMessage(text);
	}

	public void whisper(UserConfig user) {
		if (user == null) {
			setText("whisper: ");
		} else {
			setText("whisper: " + user.user + ": ");			
		}
	}

	public void boot(UserConfig user) {
		if (user == null) {
			setText("boot: ");
		} else {
			setText("boot: " + user.user);
			this.connection.boot(user.user);
		}
		setText("");
	}

	public void pvt(UserConfig user) {
		if (user == null) {
			setText("private: ");
		} else {
			setText("private: " + user.user);
			this.connection.pvt(user.user);
		}
		setText("");
	}
    
    /**
     * Clear the log.
     */
    public void clear(View view) {
    	TextView log = (TextView) findViewById(R.id.logText);
		log.setText("");
    }
 
    @Override
    public void onDestroy() {    	
		if (this.connection != null) {
			try {
				this.connection.disconnect();
			} catch (Exception exception) { }
		}
		
        if (this.tts != null) {
        	this.tts.stop();
        	this.tts.shutdown();
        }
        super.onDestroy();
    }
 
    @Override
    public void onInit(int status) {
 
        if (status == TextToSpeech.SUCCESS) {
 
        	Locale locale = null;
        	VoiceConfig voice = MainActivity.voice;
        	if (voice != null && voice.language != null && voice.language.length() > 0) {
        		locale = new Locale(MainActivity.voice.language);
        	} else {
        		locale = Locale.US;
        	}
            int result = this.tts.setLanguage(locale);
            
			float pitch = 1;
			if (voice != null && voice.pitch != null && voice.pitch.length() > 0) {
				try {
					pitch = Float.valueOf(voice.pitch);
				} catch (Exception exception) {}
			}
			float speechRate = 1;
			if (voice != null && voice.speechRate != null && voice.speechRate.length() > 0) {
				try {
					speechRate = Float.valueOf(voice.speechRate);
				} catch (Exception exception) {}
			}
        	this.tts.setPitch(pitch);
        	this.tts.setSpeechRate(speechRate);
 
            if (result == TextToSpeech.LANG_MISSING_DATA
                    || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("TTS", "This Language is not supported");
            }
 
        } else {
            Log.e("TTS", "Initilization Failed!");
        }
 
    }
 
    public void chime() {
    	if (this.chimePlayer == null) {
    		this.chimePlayer = MediaPlayer.create(this, R.raw.chime);
    	}
    	this.chimePlayer.start();
    }

	public void viewUser(UserConfig user) {
		if (user == null) {
        	MainActivity.showMessage("Select user", this);
			return;
		}
		MainActivity.viewUser = user;
		
        Intent intent = new Intent(this, ViewUserActivity.class);
        startActivity(intent);
	}
    
    public void toggleKeepAlive() {
    	this.connection.setKeepAlive(!this.connection.isKeepAlive());
    }
    
    public void clearLog() {
    	this.html = "";
    	
		TextView log = (TextView) findViewById(R.id.logText);
    	log.setText("");
    }
    
    public void response(String text) {
    	String user = "";
    	String message = text;
    	int index = text.indexOf(':');
    	if (index != -1) {
    		user = text.substring(0, index);
    		message = text.substring(index + 2, text.length());
    	}
		if (user.equals("Online")) {
			HttpAction action = new HttpGetLiveChatUsersAction(this, message);
			action.execute();
			return;
		}
		
		TextView responseView = (TextView) findViewById(R.id.responseText);
		responseView.setText(text);
		    	
		TextView log = (TextView) findViewById(R.id.logText);
		this.html = this.html + "<b>" + user + "</b><br/>"  + message + "<br/>";
		log.setText(Html.fromHtml(this.html));
		
		final ScrollView scroll = (ScrollView) findViewById(R.id.scrollView);
		scroll.post(new Runnable() {
		    public void run() {
		    	scroll.fullScroll(View.FOCUS_DOWN);
		    }
		});
				
		boolean speak = this.speak;
		boolean chime = this.chime;
		if (user.equals("Error") || user.equals("Info")) {
			speak = false;
		} else if (MainActivity.user == null) {
			if (user.startsWith("anonymous")) {
				speak = false;
				chime = false;
			}
		} else {
			if (user.equals(MainActivity.user.user)) {
				speak = false;
				chime = false;
			}			
		}
		if (speak) {
			this.tts.speak(message, TextToSpeech.QUEUE_FLUSH, null);
		} else if (chime) {
			chime();
		}
    }
    
    public void setUsers(List<UserConfig> users) {
		ListView list = (ListView) findViewById(R.id.usersList);
		list.setAdapter(new UserListAdapter(this, R.id.usersList, users));
    }

	public void menu(View view) {
		openOptionsMenu();
	}
	
	@Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        MenuInflater menuInflater = getMenuInflater();
        menuInflater.inflate(R.layout.menu_livechat, menu);
        return true;
    }
	
	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {
        WebMediumConfig instance = MainActivity.instance;
        
        boolean isAdmin = (MainActivity.user != null) && instance.isAdmin;
        if (!isAdmin) {
    	    menu.getItem(4).setEnabled(false);
        }
        if (this.speak) {
    	    menu.findItem(R.id.menuSpeak).setChecked(true);        	
        }
	    return true;
	}
	
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
		ListView list = (ListView) findViewById(R.id.usersList);
		UserConfig user = (UserConfig)list.getItemAtPosition(list.getCheckedItemPosition());
        switch (item.getItemId())
        {        
	    case R.id.menuPing:
	    	this.connection.ping();
	        return true;
        case R.id.menuWhisper:
        	whisper(user);
            return true;
        case R.id.menuPrivate:
        	pvt(user);
            return true;
        case R.id.menuAccept:
	    	this.connection.accept();
            return true;
        case R.id.menuBoot:
        	boot(user);
            return true;
        case R.id.menuClear:
        	clearLog();
            return true;
        case R.id.menuExit:
	    	this.connection.exit();
            return true;
        case R.id.menuViewUser:
	    	viewUser(user);
            return true;
        case R.id.menuSpeak:
        	this.speak = !this.speak;
        	item.setChecked(this.speak);
            return true;
        case R.id.menuChime:
        	this.chime = !this.chime;
        	item.setChecked(this.chime);
            return true;
        case R.id.menuKeepAlive:
        	toggleKeepAlive();
        	item.setChecked(this.connection.isKeepAlive());
            return true;
        default:
            return super.onOptionsItemSelected(item);
        }
    }
}
