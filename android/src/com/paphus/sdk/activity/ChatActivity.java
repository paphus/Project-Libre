package com.paphus.sdk.activity;

import java.util.ArrayList;
import java.util.Locale;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.text.Html;
import android.util.Log;
import android.view.GestureDetector;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.TextView.OnEditorActionListener;
import android.widget.Toast;

import com.paphus.sdk.activity.R;
import com.paphus.sdk.activity.actions.HttpAction;
import com.paphus.sdk.activity.actions.HttpChatAction;
import com.paphus.sdk.activity.actions.HttpGetImageAction;
import com.paphus.sdk.config.ChatConfig;
import com.paphus.sdk.config.VoiceConfig;

/**
 * Activity for chatting with a bot.
 * To launch this activity from your app you can use the HttpFetchAction passing the bot id or name as a config, and launch=true.
 */
public class ChatActivity extends Activity implements TextToSpeech.OnInitListener {
    protected static final int RESULT_SPEECH = 1;
    
    protected TextToSpeech tts;
    protected EditText textView;
    public String html = "";
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        setTitle(MainActivity.instance.name);
        
        tts = new TextToSpeech(this, this);
        
        CheckBox checkbox = (CheckBox) findViewById(R.id.speakCheckbox);
        checkbox.setChecked(true);

        textView = (EditText) findViewById(R.id.messageText);
        textView.setOnEditorActionListener(new OnEditorActionListener() {
			
			@Override
			public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
				submitChat();
				return false;
			}
		});

		Spinner emoteSpin = (Spinner) findViewById(R.id.emoteSpin);
		ArrayAdapter adapter = new ArrayAdapter(this,
                android.R.layout.simple_spinner_dropdown_item, EmotionalState.values());
		emoteSpin.setAdapter(adapter);

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
		
		findViewById(R.id.imageView).setOnClickListener(new View.OnClickListener() {			
			@Override
			public void onClick(View v) {
				View scrollView = findViewById(R.id.scrollView);
				if (scrollView.getVisibility() == View.VISIBLE) {
					scrollView.setVisibility(View.GONE);
				} else {
					scrollView.setVisibility(View.VISIBLE);					
				}
			}
		});
		
		GestureDetector.SimpleOnGestureListener listener = new GestureDetector.SimpleOnGestureListener() {
			@Override
			public boolean onDoubleTapEvent(MotionEvent event) {
				if (event.getAction() == MotionEvent.ACTION_UP) {
					View imageLayout = findViewById(R.id.imageView);
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
		
        ChatConfig config = new ChatConfig();
        config.instance = MainActivity.instance.id;
		HttpAction action = new HttpChatAction(ChatActivity.this, config);
		action.execute();
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
        ChatConfig config = new ChatConfig();
        config.instance = MainActivity.instance.id;
        config.conversation = MainActivity.conversation;
        
		EditText v = (EditText) findViewById(R.id.messageText);
		TextView log = (TextView) findViewById(R.id.logText);
		config.message = v.getText().toString().trim();
		if (config.message.equals("")) {
			return;
		}
		this.html = this.html + "<b>You</b><br/>"  + config.message + "<br/>";
		log.setText(Html.fromHtml(this.html));
		
		CheckBox correctionCheckbox = (CheckBox) findViewById(R.id.correctionCheckbox);
		config.correction = correctionCheckbox.isChecked();
		
		CheckBox offensiveCheckbox = (CheckBox) findViewById(R.id.offensiveCheckbox);
		config.offensive = offensiveCheckbox.isChecked();

		Spinner emoteSpin = (Spinner) findViewById(R.id.emoteSpin);
		config.emote = emoteSpin.getSelectedItem().toString();
		
		HttpChatAction action = new HttpChatAction(ChatActivity.this, config);
		action.execute();

		v.setText("");
		correctionCheckbox.setChecked(false);
		offensiveCheckbox.setChecked(false);
	}
	
    /**
     * Disconnect from the conversation.
     */
    public void disconnect(View view) {		
    	finish();
    }
    
    public void minimizeProperties(View view) {
    	findViewById(R.id.properties).setVisibility(View.GONE);
    	findViewById(R.id.maximizePropertiesButton).setVisibility(View.VISIBLE);
    }
    
    public void maximizeProperties(View view) {
    	findViewById(R.id.properties).setVisibility(View.VISIBLE);
    	findViewById(R.id.maximizePropertiesButton).setVisibility(View.GONE);
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
        ChatConfig config = new ChatConfig();
        config.instance = MainActivity.instance.id;
        config.conversation = MainActivity.conversation;
        config.disconnect = true;
        
		HttpChatAction action = new HttpChatAction(ChatActivity.this, config);
		action.execute();
		
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
        	if (voice.language != null && voice.language.length() > 0) {
        		locale = new Locale(MainActivity.voice.language);
        	} else {
        		locale = Locale.US;
        	}
            int result = this.tts.setLanguage(locale);
            
			float pitch = 1;
			if (voice.pitch != null && voice.pitch.length() > 0) {
				try {
					pitch = Float.valueOf(voice.pitch);
				} catch (Exception exception) {}
			}
			float speechRate = 1;
			if (voice.speechRate != null && voice.speechRate.length() > 0) {
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
 
    public void response(String text) {
		TextView responseView = (TextView) findViewById(R.id.responseText);
		responseView.setText(text);
		Spinner emoteSpin = (Spinner) findViewById(R.id.emoteSpin);
		emoteSpin.setSelection(0);

		CheckBox checkbox = (CheckBox) findViewById(R.id.speakCheckbox);
		if (checkbox.isChecked()) {
			this.tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
		}
    }
}
