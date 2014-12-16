/******************************************************************************
 *
 *  Copyright 2014 Paphus Solutions Inc.
 *
 *  Licensed under the Eclipse Public License, Version 1.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.eclipse.org/legal/epl-v10.html
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 ******************************************************************************/

/**
 * Project libre open SDK.
 * This JavaScript SDK lets you access chat bot, live chat, chatroom, and forum services on
 * the Project libre supporting websites, including:
 * - Paphus Live Chat
 * - BOT libre!
 * - LIVE CHAT libre!
 * - FORUMS libre!
 * 
 * This JavaScript script can be used directly, or copied/modified on your own website.
 * 
 * The SDK consist of two main class, SDKConnection and LiveChatConnection.
 * 
 * SDKConnection uses AJAX calls to provide access to the libre REST API.
 * This is used for chat bots, forums, user admin, and domains.
 * 
 * LiveChatConnection uses web sockets to provide access to live chat and chatrooms.
 * Version: 2.0.3-2014-12-16
 */

var SDK = {};

SDK.DOMAIN = "www.botlibre.com";
//SDK.DOMAIN = window.location.host;
SDK.APP = "";
//SDK.APP = "/botlibre";
SDK.PATH = "/rest/botlibre";

SDK.host = SDK.DOMAIN;
SDK.app = SDK.APP;
SDK.url = "http://" + SDK.DOMAIN + SDK.APP;
SDK.rest = SDK.url + SDK.PATH;

SDK.applicationId = null;

SDK.debug = false;
SDK.error = function(message) {
	console.log(message);
}

SDK.currentAudio = null;
SDK.recognition = null;
SDK.recognitionActive = false;
SDK.backgroundAudio = null;

/**
 * Play the audio file given the url.
 */
SDK.play = function(file, channelaudio) {
	SDK.pauseSpeechRecognition();
	var audio = new Audio(file);
	if (SDK.recognitionActive) {
		audio.addEventListener('ended', function() {
			SDK.startSpeechRecognition();
		}, false);
	}
	if (channelaudio == false) {
		audio.play();
		return audio;
	}
	if (SDK.currentAudio != null && !SDK.currentAudio.ended) {
		SDK.currentAudio.addEventListener('pause', function() {
			SDK.currentAudio = audio;
			audio.play();
		}, false);
		SDK.currentAudio.pause();
	} else {
		SDK.currentAudio = audio;
		audio.play();
	}
	return audio;
}

/**
 * Play the chime sound.
 */
SDK.playChime = true;
SDK.chime = function() {
	if (SDK.playChime) {
		this.play(SDK.url + '/chime.wav');
		SDK.playChime = false;
		var timer = setInterval(function () {
			SDK.playChime = true;
			clearInterval(timer);
		}, 1000);
	}
}

/**
 * Convert the text to speech and play it as an audio file.
 * The voice is optional and can be any voice supported by the server (see the voice page for a list of voices).
 */
SDK.tts = function(text, voice) {
	try {
		var url = SDK.rest + '/form-speak?&text=';
		url = url + encodeURIComponent(text);
		if (voice != null) {
			url = url + '&voice=' + voice;
		}

		var request = new XMLHttpRequest();
		var self = this;
		request.onreadystatechange = function() {
			if (request.readyState != 4) return;
			if (request.status != 200) {
				console.log('Error: Speech web request failed');
				return;
			}
			self.play(SDK.url + "/" + request.responseText);
		}
		
		request.open('GET', url, true);
		request.send();
	} catch (error) {
		console.log('Error: Speech web request failed');
	}
}

/**
 * Insert the text into the input field.
 */
SDK.insertAtCaret = function(element, text) {
    if (document.selection) {
        element.focus();
        var sel = document.selection.createRange();
        sel.text = text;
        element.focus();
    } else if (element.selectionStart || element.selectionStart == 0) {
        var startPos = element.selectionStart;
        var endPos = element.selectionEnd;
        var scrollTop = element.scrollTop;
        element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
        element.focus();
        element.selectionStart = startPos + text.length;
        element.selectionEnd = startPos + text.length;
        element.scrollTop = scrollTop;
    } else {
        element.value += text;
        element.focus();
    }
}

/**
 * Fix innerHTML for IE and Safari.
 */
SDK.innerHTML = function(element) {
	var html = element.innerHTML;
	if (html == null) {
		var div = document.createElement("div");
		div.appendChild(element);
		html = div.innerHTML;
	}
	return html;
}

/**
 * Enable speech recognition if supported by the browser, and insert the voice to text to the input field.
 * Optionally call click() on the button.
 */
SDK.registerSpeechRecognition = function(input, button) {
	if (SDK.recognition == null) {
		if ('webkitSpeechRecognition' in window) {
			SDK.recognition = new webkitSpeechRecognition();
			SDK.recognition.continuous = true;
			SDK.recognition.onresult = function (event) {
			    for (var i = event.resultIndex; i < event.results.length; ++i) {
			        if (event.results[i].isFinal) {
			        	SDK.insertAtCaret(input, event.results[i][0].transcript);	        	
			        }
			    }
			    if (button != null) {
			    	button.click();
				}
			};
		} else {
			return;
		}
		/*if ('speechSynthesis' in window) {
			console.log('speechSynthesis');
			console.log(speechSynthesis.getVoices());
		    speechSynthesis.speak(new SpeechSynthesisUtterance('Hello World'));
		    speechSynthesis.onvoiceschanged = function() {
	    		console.log(speechSynthesis.getVoices());
	    		var voices = speechSynthesis.getVoices();
		    	for (i = 0; i < voices.length; i++) {
		    		console.log(voices[i].name);
		    		var msg = new SpeechSynthesisUtterance('Hello World 1 2 3');
		    		msg.voice = voices[i];
				    speechSynthesis.speak(msg);		    		
		    	}
		    };
		}*/
	}
}

SDK.startSpeechRecognition = function() {
	if (SDK.recognition != null) {
		SDK.recognition.start();
		SDK.recognitionActive = true;
	}
}

SDK.pauseSpeechRecognition = function() {
	if (SDK.recognition != null) {
		SDK.recognition.stop();
	}
}

SDK.stopSpeechRecognition = function() {
	if (SDK.recognition != null) {
		SDK.recognition.stop();
		SDK.recognitionActive = false;
	}
}

SDK.popupwindow = function(url, title, w, h) {
	var left = (screen.width)-w-10;
	var top = (screen.height)-h-100;
	window.open(url, title, 'scrollbars=yes, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
	return false;
}

/**
 * Credential used to establish a connection.
 * Defines the url, host, app, rest, which are all defaulted and should not need to be changed,
 * Requires an application id.
 * You can obtain your application id from your user details page on the hosting website.
 */
function Credentials() {
	this.host = SDK.host;
	this.app = SDK.app;
	this.url = SDK.url;
	this.rest = SDK.rest;
	this.applicationId = SDK.applicationId;
}

/**
 * Credentials for use with hosted services on the BOT libre website, a free bot hosting service.
 * http://www.botlibre.com
 */
function BOTlibreCredentials()  {
	this.DOMAIN = "www.botlibre.com";
	//this.DOMAIN = window.location.host;
	this.APP = "";
	//this.APP = "/botlibre";
	this.PATH = "/rest/botlibre";
	
	this.host = this.DOMAIN;
	this.app = this.APP;
	this.url = "http://" + this.DOMAIN + this.APP;
	this.rest = this.url + this.PATH;
	this.applicationId = SDK.applicationId;
}

/**
 * Credentials for use with hosted services on the Paphus Live Chat website,
 * a commercial live chat, chatroom, forum, and chat bot, hosting service.
 * http://www.paphuslivechat.com
 */
function PaphusCredentials()  {
	this.DOMAIN = "www.paphuslivechat.com";
	this.APP = "";
	this.PATH = "/rest/livechat";
	
	this.host = this.DOMAIN;
	this.app = this.APP;
	this.url = "http://" + this.DOMAIN + this.APP;
	this.rest = this.url + this.PATH;
	this.applicationId = SDK.applicationId;
}

/**
 * Credentials for use with hosted services on the LIVE CHAT libre website, a free live chat, chatrooms, forum, and chat bots that learn.
 * http://www.livechatlibre.com
 */
function LIVECHATlibreCredentials()  {
	this.DOMAIN = "www.livechatlibre.com";
	this.APP = "";
	this.PATH = "/rest/livechatlibre";
	
	this.host = this.DOMAIN;
	this.app = this.APP;
	this.url = "http://" + this.DOMAIN + this.APP;
	this.rest = this.url + this.PATH;
	this.applicationId = SDK.applicationId;
}

/**
 * Credentials for use with hosted services on the FORUMS libre website, a free embeddable forum hosting service.
 * http://www.forumslibre.com
 */
function FORUMSlibreCredentials()  {
	this.DOMAIN = "www.forumslibre.com";
	this.APP = "";
	this.PATH = "/rest/forumslibre";
	
	this.host = this.DOMAIN;
	this.app = this.APP;
	this.url = "http://" + this.DOMAIN + this.APP;
	this.rest = this.url + this.PATH;
	this.applicationId = SDK.applicationId;
}

/**
 * Listener interface for a LiveChatConnection.
 * This gives asynchronous notification when a channel receives a message, or notice.
 */
function LiveChatListener() {
	/**
	 * A user message was received from the channel.
	 */
	this.message = function(message) {};
	
	/**
	 * An informational message was received from the channel.
	 * Such as a new user joined, private request, etc.
	 */	
	this.info = function(message) {};

	/**
	 * An error message was received from the channel.
	 * This could be an access error, or message failure.
	 */	
	this.error = function(message) {};
	
	/**
	 * Notification that the connection was closed.
	 */
	this.closed = function() {};
	
	/**
	 * The channels users changed (user joined, left, etc.)
	 * This contains a comma separated values (CSV) list of the current channel users.
	 * It can be passed to the SDKConnection.getUsers() API to obtain the UserConfig info for the users.
	 */
	this.updateUsers = function(usersCSV) {};

	/**
	 * The channels users changed (user joined, left, etc.)
	 * This contains a HTML list of the current channel users.
	 * It can be inserted into an HTML document to display the users.
	 */
	this.updateUsersXML = function(usersXML) {};
}

/**
 * The WebLiveChatListener provides an integration between a LiveChatConnection and an HTML document.
 * It updates the document to message received from the connection, and sends messages from the document's form.
 * The HTML document requires the following elements:
 * - chat - <input type='text'> chat text input for sending messages
 * - send - <input type='submit'> button for sending chat input
 * - response - <p> paragraph for last chat message
 * - console - <table> table for chat log, and user log
 * - scroller - <div> div for chat log scroll pane
 * - online - <table> table for chat user list
 */
function WebLiveChatListener() {
	this.switchText = true;
	this.playChime = true;
	this.speak = false;
	this.voice = null;
	this.user = 'anonymous';
	this.connection = null;
	
	/**
	 * A user message was received from the channel.
	 */
	this.message = function(message) {
		var index = message.indexOf(':');
		var speaker = '';
		if (index != -1) {
			speaker = message.substring(0, index + 1);
			response = message.substring(index + 1, message.length);
		} else {
			response = message;
		}
		if (speaker != (this.user + ':')) {
			if (this.user != "anonymous" || speaker.length < "anonymous".length || speaker.substring(0, "anonymous".length) != "anonymous") {
				if (this.playChime) {
					SDK.chime();
				}
				if (this.speak) {
					SDK.tts(response, this.voice);
				}
			}
		}
		document.getElementById('response').innerHTML = message;
		var scroller = document.getElementById('scroller');
		var consolepane = document.getElementById('console');
		if (scroller == null || consolepane == null) {
			return;
		}
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		var tr2 = document.createElement('tr');
		var td2 = document.createElement('td');
		var span = document.createElement('span');
		var span2 = document.createElement('span');
		var chatClass = 'chat-1';
		if (this.switchText) {
			chatClass = 'chat-2';
		}
		span.className = chatClass;
		span.innerHTML = speaker;
		span2.className = chatClass;
		span2.innerHTML = response;
		td.setAttribute('nowrap', 'nowrap');
		td2.className = chatClass;
		td2.setAttribute('align', 'left');
		td2.setAttribute('width', '100%');
		consolepane.appendChild(tr);
		tr.appendChild(td);
		td.appendChild(span);
		tr.appendChild(td2);
		td2.appendChild(span2);
		this.switchText = !this.switchText;
		while (consolepane.childNodes.length > 25) {
			consolepane.removeChild(consolepane.firstChild);
		}
		scroller.scrollTop = scroller.scrollHeight;
		document.getElementById('chat').focus();
	};

	
	/**
	 * An informational message was received from the channel.
	 * Such as a new user joined, private request, etc.
	 */	
	this.info = function(message) {
		if (message == 'Info: pong') {
			document.getElementById('response').innerHTML = message;
			return;
		}
		this.message(message);
	};

	/**
	 * An error message was received from the channel.
	 * This could be an access error, or message failure.
	 */	
	this.error = function(message) {
		this.message(message);
	};
	
	/**
	 * Notification that the connection was closed.
	 */
	this.closed = function() {};
	
	/**
	 * The channels users changed (user joined, left, etc.)
	 * This contains a comma separated values (CSV) list of the current channel users.
	 * It can be passed to the SDKConnection.getUsers() API to obtain the UserConfig info for the users.
	 */
	this.updateUsers = function(usersCSV) {};

	/**
	 * The channels users changed (user joined, left, etc.)
	 * This contains a HTML list of the current channel users.
	 * It can be inserted into an HTML document to display the users.
	 */
	this.updateUsersXML = function(usersXML) {
		var onlineList = document.getElementById('online');
		if (onlineList == null) {
			return;
		}
		if (onlineList.hasChildNodes()) {
			onlineList.removeChild(onlineList.firstChild);
		}
		onlineList.innerHTML = usersXML;
	};

	this.toggleChime = function() {
		this.playChime = !this.playChime;
	}

	this.toggleSpeak = function() {
		this.speak = !this.speak;
	}

	this.toggleKeepAlive = function() {
		this.connection.toggleKeepAlive();
	}
	
	this.sendMessage = function() {
		var message = document.getElementById('chat').value;
		if (message != '') {
			this.connection.sendMessage(message);
			document.getElementById('chat').value = '';
		}
		return false;
	};

	this.ping = function() {
		this.connection.ping();
		document.getElementById('chat').value = '';
		return false;
	};

	this.accept = function() {
		this.connection.accept();
		document.getElementById('chat').value = '';
		return false;
	};

	this.exit = function() {
		this.connection.exit();
		document.getElementById('chat').value = '';
		return false;
	};

	this.boot = function() {
		document.getElementById('chat').value = 'boot: user';
		return false;
	};

	this.whisper = function() {
		document.getElementById('chat').value = 'whisper: user: message';
		return false;
	};

	this.pvt = function() {
		document.getElementById('chat').value = 'private: user';
		return false;
	};

	this.clear = function() {
		document.getElementById('response').innerHTML = '';
		var console = document.getElementById('console');
		if (console != null) {
			console.innerHTML = '';
		}
		return false;
	};
}

/**
 * Shared method for updating an avatar image/video/audio from the chat response.
 */
SDK.updateAvatar = function(response, speak, urlprefix, elementPrefix, channelaudio, afterFunction) {
	if (elementPrefix == null) {
		elementPrefix = "";
	}
	var avatarStatus = document.getElementById(elementPrefix + "avatar-status");
	if (avatarStatus != null) {
		var status = "";
		if (response.emote != null && response.emote != "" && response.emote != "NONE") {
			status = response.emote.toLowerCase();
		}
		if (response.action != null && response.action != "") {
			if (status != "") {
				status = status + " : ";
			}
			status = status + response.action;
		}
		if (response.pose != null && response.pose != "") {
			if (status != "") {
				status = status + " : ";
			}
			status = status + response.pose;
		}
		avatarStatus.innerHTML = status;
	}
	if (response.avatarActionAudio != null) {
		var audio = new Audio(urlprefix + response.avatarActionAudio);
		audio.play();
	}
	if (SDK.backgroundAudio != null) {
		SDK.backgroundAudio.pause();
	}
	if (response.avatarAudio != null) {
		SDK.backgroundAudio = new Audio(urlprefix + response.avatarAudio);
		SDK.backgroundAudio.loop = true;
		SDK.backgroundAudio.play();
	}
	if (response.avatarType != null && response.avatarType.indexOf("video") != -1) {
		var div = document.getElementById(elementPrefix + "avatar-image-div");
		if (div != null) {
			div.style.display = "none";
		}
		div = document.getElementById(elementPrefix + "avatar-video-div");
		if (div != null) {
			div.style.display = "inline-block";
			if (response.avatarBackground != null) {
				div.style.backgroundImage = "url(" + urlprefix + response.avatarBackground + ")";
			}
		}
		var video = document.getElementById(elementPrefix + "avatar-video");
		if (video == null) {
			if (speak) {
				var audio = SDK.play(urlprefix + response.speech, channelaudio);
				audio.onended = afterFunction;
			}
			return;
		}
		var end = function() {
			video.src = urlprefix + response.avatar;
			video.loop = true;
			video.play();
			if (afterFunction != null) {
				afterFunction();
			}
		}
		var talk = function() {
			if (response.avatarTalk != null) {
				if (speak) {
					if (response.speech == null) {
						end();
					} else {
						video.src = urlprefix + response.avatar;
						video.loop = true;
						//var audio = new Audio(urlprefix + response.speech, channelaudio);
						var audio = SDK.play(urlprefix + response.speech, channelaudio);
						console.log("updateAvatar");
						audio.onabort = function() {console.log("abort");}
						audio.oncanplay = function() {
							video.src = urlprefix + response.avatarTalk;
							video.loop = true;
							video.play();
						}
						audio.onerror = function() {
							console.log("error");
							end();
						}
						audio.onloadeddata = function() {console.log("loadeddata");}
						audio.onloadedmetadata = function() {console.log("loadedmetadata");}
						audio.onpause = function() {console.log("pause");}
						audio.onplay = function() {console.log("play");}
						audio.onplaying = function() {console.log("playing");}
						audio.ontimeupdate = function() {console.log("timeupdate");}
						audio.onended = function() {
							end();
						}
						audio.play();
						video.play();
					}
				} else {
					video.src = urlprefix + response.avatarTalk;
					video.loop = false;
					video.play();
					video.onended = function() {
						end();
					}
				}
			} else {
				video.src = urlprefix + response.avatar;
				video.loop = true;
				video.play();
				if (speak) {
					var audio = SDK.play(urlprefix + response.speech, channelaudio);
					audio.onended = afterFunction;
				} else if (afterFunction != null) {
					afterFunction();			
				}
			}
		}
		
		if (response.avatarAction != null) {
			video.src = urlprefix + response.avatarAction;
			video.loop = false;
			video.play();
			video.onended = function() {
				talk();
			}
		} else {
			talk();
		}
	} else {
		var div = document.getElementById(elementPrefix + "avatar-video-div");
		if (div != null) {
			div.style.display = "none";
		}
		div = document.getElementById(elementPrefix + "avatar-image-div");
		if (div != null) {
			div.style.display = "inline-block";
		}
		var img = document.getElementById(elementPrefix + 'avatar');
		if (img != null) {
			img.src = urlprefix + response.avatar;
		}
		img = document.getElementById(elementPrefix + 'avatar2');
		if (img != null) {
			img.src = urlprefix + response.avatar;
		}
		if (speak) {
			var audio = SDK.play(urlprefix + response.speech, channelaudio);
			audio.onended = afterFunction;
		} else if (afterFunction != null) {
			afterFunction();			
		}
	}
}

/**
 * The WebChatbotListener provides an integration between a chat bot conversation through a SDKConnection and an HTML document.
 * It updates the document to messages received from the connection, and sends messages from the document's form.
 * The HTML document requires the following elements:
 * - chat - <input type='text'> chat text input for sending messages
 * - send - <input type='submit'> button for sending chat input
 * - response - <p> paragraph for last chat message
 * - console - <table> table for chat log, and avatar
 * - scroller - <div> div for chat log scroll pane
 * - avatar - <img> img for the bot's avatar (optional)
 * - avatar2 - <img> hover img for the bot's avatar (optional)
 * - avatar-image-div - <div> div for the bot's image (optional)
 * - avatar-video - <video> video for the bot's video (optional)
 * - avatar-video-div - <div> div for the bot's video (optional)
 * - avatar-status - <span> span for the bot's current status (optional)
 * Or you can call createBox() to have the WebChatbotListener create its own components in the current page.
 */
function WebChatbotListener() {
	/** Enable or disable speech. */
	this.speak = true;
	/** A SDK connection must be set, be sure to include your app id. */
	this.connection = null;
	/** The id or name of the bot instance to connect to. */
	this.instance = null;
	/** The name to display for the bot. */
	this.instanceName = "Bot";
	/** The name to display for the user. */
	this.userName = "You";
	/** Allow the background color to be set. */
	this.background = null;
	
	this.switchText = true;
	this.big = false;
	this.conversation = null;
		
	/**
	 * Create an embedding bar and div in the current webpage.
	 */
	this.createBox = function() {
		var backgroundstyle = "";
		var hidden = "hidden";
		var border = "";
		if (this.background != null) {
			backgroundstyle = " style='background-color:" + this.background + "'";
			hidden = "visible";
			border = "border:1px;border-style:solid;border-color:black;";
		}
		var box = document.createElement('div');
		var html =
			"<style>\n"
				+ ".box { position:fixed;bottom:10px;right:10px;z-index:52;margin:2px;display:none;" + border + " }\n"
				+ ".box:hover { border:1px;border-style:solid;border-color:black; }\n"
				+ ".box .boxmenu { visibility:" + hidden + "; }\n"
				+ ".box:hover .boxmenu { visibility:visible; }\n"
				+ "#boxclose, #boxmin, #boxmax { font-size:20px;margin:2px;padding:0px;text-decoration:none; }\n"
				+ "#boxbarmax { font-size:18px;margin:2px;padding:0px;text-decoration:none; }\n"
				+ "#boxclose:hover, #boxmin:hover, #boxmax:hover { color: #fff;background: grey; }\n"
				+ ".boxbar { position:fixed;bottom:2px;right:30px;z-index:52;margin:0;padding:6px;background-color:#009900; }\n"
			+ "</style>\n"
			+ "<div id='box' class='box' " + backgroundstyle + ">"
				+ "<div class='boxmenu'>"
				+ "<span style='float:right'><a id='boxmin' href='#'>&#95;</a><a id='boxmax' href='#'>&square;</a><a id='boxclose' href='#'>&times;</a></span><br/>"
				+ "</div>"

				+ "<div id='avatar-image-div' style='min-height:200px;min-width:200px;'>"
					+ "<img id='avatar' style='max-height:400px;width:200px'/>"
					+ "</div>"
					+ "<div id='avatar-video-div' style='display:none;min-height:200px;min-width:200px;background-size:200px 200px;background-repeat: no-repeat;'>"
					+ "<video id='avatar-video' autoplay preload='auto' style='background:transparent;max-height:400px;width:200px'>"
					+ "Video format not supported by your browser (try Chrome)"
					+ "</video>"
				+ "</div>"
				
				+ "<div>"
					+ "<div style='max-width:200px;max-height:100px;overflow:auto;'>"
						+ "<span id='response'></span><br/>"
					+ "</div>"
					+ "<input id='chat' style='width:192px;margin:2px;padding:0px;' type='text'/>"
				+ "</div>"
			+ "</div>"
			+ "<div id='boxbar' class='boxbar'>"
			+ "<span><a id='boxbarmax' href='#' style='color:white'>" + this.instanceName + "</a></span>"
			+ "</div>";
		
		box.innerHTML = html;
		document.body.appendChild(box);
		
		var self = this;
		document.getElementById("chat").addEventListener("keypress", function(event) {
			if (event.keyCode == 13) {
				self.sendMessage();
				return false;
			}
		});
		document.getElementById("boxclose").addEventListener("click", function() {
			self.closeBox();
			return false;
		});
		document.getElementById("boxmin").addEventListener("click", function() {
			self.minimizeBox();
			return false;
		});
		document.getElementById("boxmax").addEventListener("click", function() {
			self.popup();
			return false;
		});
		document.getElementById("boxbarmax").addEventListener("click", function() {
			self.maximizeBox();
			return false;
		});
	}
	
	/**
	 * Create a live chat bar beside the bot bar.
	 */
	this.createLiveChatBox = function(channel, label) {
		var box = document.createElement('div');
		var html =
			"<style>\n"
				+ ".livechatboxbar { position:fixed;bottom:2px;right:130px;z-index:52;margin:0;padding:6px;background-color:#009900; }\n"
				+ "#livechatboxmax { font-size:18px;margin:2px;padding:0px;text-decoration:none; }\n"
			+ "</style>\n"
			+ "<div id='livechatboxbar' class='livechatboxbar'>"
			+ "<span><a id='livechatboxmax' href='#' style='color:white'>" + label + "</a></span>"
			+ "</div>";
		
		box.innerHTML = html;
		document.body.appendChild(box);
		
		document.getElementById("livechatboxmax").addEventListener("click", function() {
			SDK.popupwindow('livechat?id=' + channel + '&embedded&chat','child', 700, 520);
			return false;
		});
	}
	
	/**
	 * Minimize the embedding div in the current webpage.
	 */
	this.minimizeBox = function() {
		document.getElementById("box").style.display = 'none';
		document.getElementById("boxbar").style.display = 'inline';
		var livechatbot = document.getElementById("livechatboxbar");
		if (livechatbot != null) {
			livechatbot.style.display = 'inline';
		}
		this.exit();
		return false;		
	}
	
	/**
	 * Maximize the embedding div in the current webpage.
	 */
	this.maximizeBox = function() {
		document.getElementById("boxbar").style.display = 'none';
		document.getElementById("box").style.display = 'inline';
		var livechatbot = document.getElementById("livechatboxbar");
		if (livechatbot != null) {
			livechatbot.style.display = 'none';
		}
		this.greet();
		return false;		
	}
	
	/**
	 * Close the embedding div in the current webpage.
	 */
	this.closeBox = function() {
		document.getElementById("boxbar").style.display = 'none';
		document.getElementById("box").style.display = 'none';
		var livechatbot = document.getElementById("livechatboxbar");
		if (livechatbot != null) {
			livechatbot.style.display = 'none';
		}
		this.exit();
		return false;		
	}
	
	/**
	 * Create a popup window chat session with the bot.
	 */
	this.popup = function() {
		var box = document.getElementById("box");
		if (box != null) {
			box.style.display = 'none';
		}
		SDK.popupwindow('chat?id=' + this.instance + '&embedded','child', 600, 420);
		this.exit();
		return false;
	}
	
	/**
	 * A chat message was received from the bot.
	 */
	this.response = function(user, message) {
		document.getElementById('response').innerHTML = message;
		this.message(user, message);
		document.getElementById('chat').focus();
	}
	
	/**
	 * A chat message was received from the bot.
	 */
	this.message = function(user, message) {
		var speaker = user;
		var scroller = document.getElementById('scroller');
		var console = document.getElementById('console');
		if (scroller == null || console == null) {
			return;
		}
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		var tr2 = document.createElement('tr');
		var td2 = document.createElement('td');
		var span = document.createElement('span');
		var span2 = document.createElement('span');
		var chatClass = 'chat-1';
		if (this.switchText) {
			chatClass = 'chat-2';
		}
		span.className = chatClass;
		span.innerHTML = speaker;
		span2.className = chatClass;
		span2.innerHTML = message;
		td.setAttribute('nowrap', 'nowrap');
		td2.className = chatClass;
		td2.setAttribute('align', 'left');
		td2.setAttribute('width', '100%');
		console.appendChild(tr);
		tr.appendChild(td);
		td.appendChild(span);
		tr.appendChild(td2);
		td2.appendChild(span2);
		this.switchText = !this.switchText;
		while (console.childNodes.length > 25) {
			console.removeChild(console.firstChild);
		}
		scroller.scrollTop = scroller.scrollHeight;
	};

	/**
	 * Update the bot's avatar's image/video/audio from the chat response.
	 */
	this.updateAvatar = function(response) {
		var urlprefix = this.connection.credentials.url + "/";
		SDK.updateAvatar(response, this.speak, urlprefix);
	};

	this.toggleSpeak = function() {
		this.speak = !this.speak;
	}
	
	/**
	 * Initialize the bot listener.
	 */
	this.start = function() {
		var self = this;
		this.connection.error = function(message) {
			self.response("Error", message);
		}
	}
	
	/**
	 * Send the bot an empty message to let it greet the user.
	 * This will have the bot respond with any defined greeting it has.
	 */
	this.greet = function() {
		this.start();
		var chat = new ChatConfig();
		chat.instance = this.instance;
		chat.speak = this.speak;
		var self = this;
		this.connection.chat(chat, function(response) {
			self.conversation = response.conversation;
			self.updateAvatar(response);
			if (response.message != null) {
				self.response(self.instanceName, response.message);
			}
		});
		return false;
	};
	
	/**
	 * Send the current text from the chat input as a message to the bot, and process the response.
	 */
	this.sendMessage = function() {
		var message = document.getElementById('chat').value;
		if (message != '') {
			this.message(this.userName, message);
			var chat = new ChatConfig();
			chat.message = message;
			chat.instance = this.instance;
			chat.speak = this.speak;
			chat.conversation = this.conversation;
			var correction = document.getElementById('correction');
			if (correction != null && correction.checked) {
				chat.correction = true;
				correction.checked = false;
			}
			var offensive = document.getElementById('offensive');
			if (offensive != null && offensive.checked) {
				chat.offensive = true;
				offensive.checked = false;
			}
			var emote = document.getElementById('emote');
			if (emote != null && emote.value != null && emote.value != "" && emote.value != "NONE") {
				chat.emote = emote.value.toUpperCase();
				emote.value = "NONE";
			}
			var action = document.getElementById('action');
			if (action != null && action.value != null && action.value != "") {
				chat.action = action.value;
				action.value = "";
			}
			var self = this;
			document.getElementById('response').innerHTML = '<i>thinking</i>';
			document.getElementById('chat').value = '';
			this.connection.chat(chat, function(response) {
				self.conversation = response.conversation;
				self.response(self.instanceName, response.message);
				self.updateAvatar(response);
			});
		}
		return false;
	};

	/**
	 * Exit the conversation.
	 */
	this.exit = function() {
		if (this.conversation == null) {
			return false;
		}
		var chat = new ChatConfig();
		chat.disconnect = true;
		chat.instance = this.instance;
		chat.conversation = this.conversation;
		var self = this;
		this.connection.chat(chat, function(response) {
			self.connection.disconnect();
			self.clear();
			self.conversation = null;
		});
		return false;
	};

	/**
	 * Clear the chat console.
	 */
	this.clear = function() {
		document.getElementById('response').innerHTML = '';
		var console = document.getElementById('console');
		if (console != null) {
			console.innerHTML = '';
		}
		return false;
	};

	this.resizeAvatar = function () {
		var avatar = document.getElementById("avatar");
		var avatarDiv = document.getElementById("avatar-image-div");
		var avatarVideo = document.getElementById("avatar-video");
		var avatarVideoDiv = document.getElementById("avatar-video-div");
		var scroller = document.getElementById("scroller");
		if (!this.big) {
			avatar.style.width = "auto";
			avatar.style.maxWidth = "800px";
			avatar.style.height = "400px";
			avatarVideo.style.maxHeight = "400px";
			avatarVideo.style.width = "400px";
			scroller.style.display = "none";
			avatarVideoDiv.style.minHeight = "400px";
			avatarVideoDiv.style.minWidth = "400px";
			avatarDiv.style.minHeight = "400px";
			avatarDiv.style.minWidth = "400px";
			avatarVideoDiv.style.backgroundSize = "400px 400px";
			this.big = true;
		} else {
			avatar.style.width = "200px";
			avatar.style.maxWidth = "200px";
			avatar.style.height = "auto";
			avatarVideo.style.maxHeight = "200px";
			avatarVideo.style.width = "200px";
			scroller.style.display = "inline-block";
			avatarVideoDiv.style.minHeight = "200px";
			avatarVideoDiv.style.minWidth = "200px";
			avatarDiv.style.minHeight = "200px";
			avatarDiv.style.minWidth = "200px";
			avatarVideoDiv.style.backgroundSize = "200px 200px";
			this.big = false;
		}
		return false;
	}
}

/**
 * The WebAvatar provides access to an avatar and binds it to elements in an HTML document.
 * It lets you use a bot avatar without having a bot.  You can tell the avatar what to say, and what actions and poses to display.
 * The HTML document requires the following elements:
 * - avatar - <img> img for the avatar
 * - avatar-image-div - <div> div for the avatar's image
 * - avatar-video - <video> video for the avatar's video
 * - avatar-video-div - <div> div for the avatar's video
 * Or you can call createBox() to have the WebAvatar create its own components in the current page.
 */
function WebAvatar() {
	/** Enable or disable speech. */
	this.speak = true;
	/** An SDK connection object must be set. */
	this.connection = null;
	/** The id or name of the avatar object to use. */
	this.avatar = null;
	/** The name of the voice to use. */
	this.voice = null;
	/** Allow the background color to be set. */
	this.background = null;
	/** An optional close event. */
	this.onclose = null;
	/** Return if the avatar box is in a closed state. */
	this.closed = true;
	/** Can be used to have multiple avatars in the same page. */
	this.elementPrefix = "WebAvatar-";
	/** Store list of messages to output. */
	this.messages = null;
	/** Function to invoke when processing all messages is complete. */
	this.ended = null;		
	
	/**
	 * Create an embedding bar and div in the current webpage.
	 */
	this.createBox = function() {
		var backgroundstyle = "";
		var hidden = "hidden";
		var border = "";
		if (this.background != null) {
			backgroundstyle = " style='background-color:" + this.background + "'";
			hidden = "visible";
			border = "border:1px;border-style:solid;border-color:black;";
		}
		var box = document.createElement('div');
		var html =
			"<style>\n"
				+ ".avatarbox { position:fixed;bottom:10px;left:10px;z-index:52;margin:2px;" + border + " }\n"
				+ ".avatarbox:hover { border:1px;border-style:solid;border-color:black; }\n"
				+ ".avatarbox .avatarboxmenu { visibility:" + hidden + "; }\n"
				+ ".avatarbox:hover .avatarboxmenu { visibility:visible; }\n"
				+ "#avatarboxclose { font-size:18px;margin:2px;padding:0px;text-decoration:none; }\n"
				+ "#avatarboxclose:hover { color: #fff;background: grey; }\n"
			+ "</style>\n"
			+ "<div id='avatarbox' class='avatarbox' " + backgroundstyle + ">"
				+ "<div class='avatarboxmenu'>"
				+ "<span style='float:right'><a id='avatarboxclose' href='#'>&times;</a></span><br/>"
				+ "</div>"

				+ "<div id='" + this.elementPrefix + "avatar-image-div' style='min-height:200px;min-width:200px;'>"
					+ "<img id='" + this.elementPrefix + "avatar' style='max-height:400px;width:200px'/>"
					+ "</div>"
					+ "<div id='" + this.elementPrefix + "avatar-video-div' style='display:none;min-height:200px;min-width:200px;background-size:200px 200px;background-repeat: no-repeat;'>"
					+ "<video id='" + this.elementPrefix + "avatar-video' autoplay preload='auto' style='background:transparent;max-height:400px;width:200px'>"
					+ "Video format not supported by your browser (try Chrome)"
					+ "</video>"
				+ "</div>"
				
			+ "</div>";
		
		box.innerHTML = html;
		document.body.appendChild(box);
		
		var self = this;
		document.getElementById("avatarboxclose").addEventListener("click", function() {
			self.closeBox();
			return false;
		});
		this.closed = false;
	}
	
	/**
	 * Open the embedding div in the current webpage.
	 */
	this.openBox = function() {
		document.getElementById("avatarbox").style.display = 'inline';
		this.speak = true;
		this.closed = false;
		return false;		
	}
	
	/**
	 * Close the embedding div in the current webpage.
	 */
	this.closeBox = function() {
		document.getElementById("avatarbox").style.display = 'none';
		this.speak = false;
		if (this.onclose != null) {
			this.onclose();
		}
		this.closed = true;
		return false;		
	}

	/**
	 * Update the bot's avatar's image/video/audio from the chat response.
	 */
	this.updateAvatar = function(response, afterFunction) {
		var urlprefix = this.connection.credentials.url + "/";
		SDK.updateAvatar(response, this.speak, urlprefix, this.elementPrefix, false, afterFunction);
	};
	
	/**
	 * Add the message to the avatars message queue.
	 * The messages will be spoken when processMessages() is called.
	 */
	this.addMessage = function(message, emote, action, pose) {
		var config = new AvatarMessage();
		config.message = message;
		config.avatar = this.avatar;
		config.speak = this.speak;
		config.voice = this.voice;
		config.emote = emote;
		config.action = action;
		config.pose = pose;
		if (this.messages == null) {
			this.messages = [];
		}
		this.messages[this.messages.length] = config;
		return false;
	};
	
	/**
	 * Add the message to the avatars message queue.
	 * The messages will be spoken when runMessages() is called.
	 */
	this.processMessages = function(pause) {
		if (this.messages == null || this.messages.length == 0) {
			if (this.ended != null) {
				this.ended();
			}
			return false;
		}
		if (pause == null) {
			pause = 500;
		}
		var self = this;
		var message = this.messages[0];
		this.messages = this.messages.splice(1, this.messages.length);
		this.connection.avatarMessage(message, function(response) {
			self.updateAvatar(response, function() {
				setTimeout(function() {
					self.processMessages(pause);
				}, pause);
			});
		});
		return false;
	}
	
	/**
	 * Have the avatar speak the message with voice and animation.
	 * The function will be called at the end of the speech.
	 */
	this.message = function(message, emote, action, pose, afterFunction) {
		var config = new AvatarMessage();
		config.message = message;
		config.avatar = this.avatar;
		config.speak = this.speak;
		config.voice = this.voice;
		config.emote = emote;
		config.action = action;
		config.pose = pose;
		var self = this;
		this.connection.avatarMessage(config, function(response) {
			self.updateAvatar(response, afterFunction);
		});
		return false;
	};
}

/**
 * Connection class for a Live Chat, or chatroom connection.
 * A live chat connection is different than an SDKConnection as it is asynchronous,
 * and uses web sockets for communication.
 */
function LiveChatConnection() {
	this.channel = null;
	this.user = null;
	this.credentials = new Credentials();
	this.socket = null;
	this.listener = null;
	this.keepAlive = false;
	this.keepAliveInterval = null;
		
	/**
	 * Connection to the live chat server channel.
	 * Validate the user credentials.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 */
	this.connect = function(channel, user) {
		if (this.credentials == null) {
			throw "Mising credentials";
		}
		this.channel = channel;
		this.user = user;
		var host = "ws://" + this.credentials.host + this.credentials.app + "/live/chat";
		if ('WebSocket' in window) {
			this.socket = new WebSocket(host);
		} else if ('MozWebSocket' in window) {
			this.socket = new MozWebSocket(host);
		} else {
			throw 'Error: WebSocket is not supported by this browser.';
		}
		
		this.listener.connection = this;
		var self = this;
		
		this.socket.onopen = function () {
			if (self.channel != null) {
				var appId = self.credentials.applicationId;
				if (appId == null) {
					appId = '';
				}
				if (self.user == null) {
					self.socket.send("connect " + self.channel.id + " " + appId);
				} else if (user.token == null) {
					self.socket.send(
							"connect " + self.channel.id + " " + self.user.user + " " + self.user.password + " " + appId);						
				} else {
					self.socket.send(
							"connect " + self.channel.id + " " + self.user.user + " " + self.user.token + " " + appId);						
				}
			}
			self.setKeepAlive(this.keepAlive);
		};
		
		this.socket.onclose = function () {
			self.listener.message("Info: Closed");
			self.listener.closed();
		};
		
		this.socket.onmessage = function (message) {
	    	user = "";
	    	data = message.data;
	    	text = data;
	    	index = text.indexOf(':');
	    	if (index != -1) {
	    		user = text.substring(0, index);
	    		data = text.substring(index + 2, text.length);
	    	}
			if (user == "Online-xml") {
				self.listener.updateUsersXML(data);
				return;
			}
			if (user == "Online") {
				self.listener.updateUsers(data);
				return;
			}
			
			if (self.keepAlive && user == "Info" && text.contains("pong")) {
				return;
			}
			if (user == "Info") {
				self.listener.info(text);
				return;
			}
			if (user == "Error") {
				self.listener.error(text);
				return;
			}
			self.listener.message(text);
		};
	};

	/**
	 * Sent a text message to the channel.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 * Note, the listener will receive its own messages.
	 */
	this.sendMessage = function(message) {
		this.checkSocket();
		this.socket.send(message);
	};

	/**
	 * Accept a private request.
	 * This is also used by an operator to accept the top of the waiting queue.
	 * This can also be used by a user to chat with the channel bot.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 */
	this.accept = function() {
		this.checkSocket();
		this.socket.send("accept");
	};

	/**
	 * Test the connection.
	 * A pong message will be returned, this message will not be broadcast to the channel.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 */
	this.ping = function() {
		this.checkSocket();
		this.socket.send("ping");
	};

	/**
	 * Exit from the current private channel.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 */
	this.exit = function() {
		this.checkSocket();
		this.socket.send("exit");
	};

	/**
	 * Request a private chat session with a user.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 */
	this.pvt = function(user) {
		this.checkSocket();
		this.socket.send("pvt: " + user);
	};

	/**
	 * Boot a user from the channel.
	 * You must be a channel administrator to boot a user.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 */
	this.boot = function(user) {
		this.checkSocket();
		this.socket.send("boot: " + user);
	};

	/**
	 * Send a private message to a user.
	 * This call is asynchronous, any error or success with be sent as a separate message to the listener.
	 */
	this.whisper = function(user, message) {
		this.checkSocket();
		this.socket.send("whisper:" + user + ": " + message);
	};

	/**
	 * Disconnect from the channel.
	 */
	this.disconnect = function() {
    	this.setKeepAlive(false);
    	if (this.socket != null) {
    		this.socket.disconnect();
    	}
	};
	
	this.checkSocket = function() {
		if (this.socket == null) {
			throw "Not connected";
		}
	};

	this.toggleKeepAlive = function() {
		this.setKeepAlive(!this.keepAlive);
	}

	this.setKeepAlive = function(keepAlive) {
		this.keepAlive = keepAlive;
		if (!keepAlive && this.keepAliveInterval != null) {
			clearInterval(this.keepAliveInterval);
		} else if (keepAlive && this.keepAliveInterval == null) {
			this.keepAliveInterval = setInterval(
					function() {
						this.ping()
					},
					600000);
		}
	}
}

/**
* Connection class for a REST service connection.
* The SDK connection gives you access to the Paphus Live Chat or libre server services using a REST API.
* <p>
* The services include:
* <ul>
* <li> User management (account creation, validation)
* <li> Bot access, chat, and administration
* <li> Forum access, posting, and administration
* <li> Live chat access, chat, and administration
* <li> Domain access, and administration
* </ul>
*/
function SDKConnection() {
	this.user;
	this.domain;
	this.credentials = new Credentials();
	this.debug = SDK.debug;
	this.error = SDK.error;
	
	this.exception;
	
	/**
	 * Validate the user credentials (password, or token).
	 * The user details are returned (with a connection token, password removed).
	 * The user credentials are soted in the connection, and used on subsequent calls.
	 * An SDKException is thrown if the connect failed.
	 */
	this.connect = function(config, processor) {
		var self = this;
		this.fetchUser(config, function(user) {
			self.user = user;
			processor(user);
		});
	}
	
	/**
	 * Connect to the live chat channel and return a LiveChatConnection.
	 * A LiveChatConnection is separate from an SDKConnection and uses web sockets for
	 * asynchronous communication.
	 * The listener will be notified of all messages.
	 */
	this.openLiveChat = function(channel, listener) {
		var connection = new LiveChatConnection();
		connection.credentials = this.credentials;
		connection.listener = listener;
		connection.connect(channel, this.user);
		return connection;
	}
	
	/**
	 * Connect to the domain.
	 * A domain is an isolated content space.
	 * Any browse or query request will be specific to the domain's content.
	 */	
	this.switchDomain = function(config, processor) {
		var self = this;
		this.fetch(config, function(domain) {
			self.domain = domain;
			processor(domain);
		});
	}
	
	/**
	 * Disconnect from the connection.
	 * An SDKConnection does not keep a live connection, but this resets its connected user and domain.
	 */	
	this.disconnect = function() {
		this.user = null;
		this.domain = null;
	}
	
	/**
	 * Fetch the user details for the user credentials.
	 * A token or password is required to validate the user.
	 */	
	this.fetchUser = function(config, processor) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/check-user", config.toXML(), function(xml) {
			if (xml == null) {
				return;
			}
			var user = new UserConfig();
			user.parseXML(xml);
			processor(user);
		});
	}
	
	/**
	 * Fetch the URL for the image from the server.
	 */	
	this.fetchImage = function(image) {
		return this.credentials.url + "/" + image;
	}
	
	/**
	 * Fetch the forum post details for the forum post id.
	 */	
	this.fetchForumPost = function(config, processor) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/check-forum-post", config.toXML(), function(xml) {
			if (xml == null) {
				return;
			}
			var post = new ForumPostConfig();
			post.parseXML(xml);
			processor(post);
		});
	}
	
	/**
	 * Create a new user.
	 */
	this.createUser = function(config, processor) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/create-user", config.toXML(), function(xml) {
			if (xml == null) {
				return null;
			}
			var user = new UserConfig();
			user.parseXML(xml);
			this.user = user;
			processor(user);
		});
	}
	
	/**
	 * Create a new forum post.
	 * You must set the forum id for the post.
	 */
	this.createForumPost = function(config, processor) {
		config.addCredentials(this);
		var xml = POST(this.credentials.rest + "/create-forum-post", config.toXML(), function(xml) {
			if (xml == null) {
				return null;
			}
			var post = new ForumPostConfig();
			post.parseXML(xml);
			processor(post);
		});
	}
	
	/**
	 * Create a reply to a forum post.
	 * You must set the parent id for the post replying to.
	 */
	this.createReply = function(config, processor) {
		config.addCredentials(this);
		var xml = POST(this.credentials.rest + "/create-reply", config.toXML(), function(xml) {
			if (xml == null) {
				return null;
			}
			var reply = new ForumPostConfig();
			reply.parseXML(xml);
			processor(reply);			
		});
	}
	
	/**
	 * Fetch the content details from the server.
	 * The id or name and domain of the object must be set.
	 */
	this.fetch = function(config, processor) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/check-" + config.type, config.toXML(), function(xml) {
			if (xml == null) {
				return null;
			}
			var config = new config.constructor();
			config.parseXML(xml);
			processor(config)
		});
	}
	
	/**
	 * Update the forum post.
	 */
	this.updateForumPost = function(config, processor) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/update-forum-post", config.toXML(), function(xml) {
			if (xml == null) {
				return null;
			}
			var config = new ForumPostConfig();
			config.parseXML(xml);
			processor(config);			
		});
	}
	
	/**
	 * Update the user details.
	 * The password must be passed to allow the update.
	 */
	this.updateUser = function(config) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/update-user", config.toXML(), function(xml) {
			return;
		});
	}
	
	/**
	 * Permanently delete the forum post with the id.
	 */
	this.deleteForumPost = function(config) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/delete-forum-post", config.toXML(), function(xml) {
			return;
		});
	}
	
	/**
	 * Flag the content as offensive, a reason is required.
	 */
	this.flag = function(config) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/flag-" + config.getType(), config.toXML(), function(xml) {
			return;
		});
	}
	
	/**
	 * Flag the forum post as offensive, a reason is required.
	 */
	this.flagForumPost = function(config) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/flag-forum-post", config.toXML(), function(xml) {
			return;
		});
	}
	
	/**
	 * Flag the user post as offensive, a reason is required.
	 */
	this.flagUser = function(config) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/flag-user", config.toXML(), function(xml) {
			return;
		});
	}
	
	/**
	 * Process the bot chat message and return the bot's response.
	 * The ChatConfig should contain the conversation id if part of a conversation.
	 * If a new conversation the conversation id is returned in the response. 
	 */
	this.chat = function(config, processor) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/post-chat", config.toXML(), function(xml) {
			if (xml == null) {
				return null;
			}
			var response = new ChatResponse();
			response.parseXML(xml);
			processor(response);			
		});
	}
	
	/**
	 * Process the avatar message and return the avatar's response.
	 */
	this.avatarMessage = function(config, processor) {
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/avatar-message", config.toXML(), function(xml) {
			if (xml == null) {
				return null;
			}
			var response = new ChatResponse();
			response.parseXML(xml);
			processor(response);			
		});
	}
	
	/**
	 * Return the list of user details for the comma separated values list of user ids.
	 */
	this.fetchUsers = function(usersCSV, processor) {
		var config = new UserConfig();
		config.user = usersCSV;
		config.addCredentials(this);
		this.POST(this.credentials.rest + "/get-users", config.toXML(), function(xml) {
			var users = [];
			if (xml != null) {
				for (var index = 0; index < xml.childNodes.length; index++) {
					var child = xml.childNodes[index];
					var userConfig = new UserConfig();
					userConfig.parseXML(child);
					users[user.length] = userConfig;
				}
			}
			processor(users);
		});
	}
	
	/**
	 * Return the list of forum posts for the forum browse criteria.
	 */
	this.fetchPosts = function(config, processor) {
		config.addCredentials(this);
		var xml = this.POST(this.credentials.rest + "/get-forum-posts", config.toXML(), function(xml) {
			var instances = [];
			if (xml != null) {
				for (var index = 0; index < xml.childNodes.length; index++) {
					var child = xml.childNodes[index];
					var post = new ForumPostConfig();
					post.parseXML(child);
					instances[instances.length] = post;
				}
			}
			processor(instances);
		});
	}
	
	/**
	 * Return the list of categories for the type, and domain.
	 */
	this.fetchCategories = function(config, processor) {
		config.addCredentials(this);
		var xml = this.POST(this.credentials.rest + "/get-categories", config.toXML(), function(xml) {
			var categories = [];
			categories[0] = "";
			if (xml != null) {
				for (var index = 0; index < xml.childNodes.length; index++) {
					categories[categories.length] = (xml.childNodes[index].getAttribute("name"));
				}
			}
			processor(categories);
		});
	}
	
	/**
	 * Return the list of tags for the type, and domain.
	 */
	this.fetchTags = function(config, processor) {
		config.addCredentials(this);
		var xml = this.POST(this.credentials.rest + "/get-tags", config.toXML(), function(xml) {
			var tags = [];
			tags[0] = "";
			if (xml != null) {
				for (var index = 0; index < xml.childNodes.length; index++) {
					tags[tags.length] = (xml.childNodes[index].getAttribute("name"));
				}
			}
			processor(tags);			
		});
	}
	
	/**
	 * Return the users for the content.
	 */
	this.fetchUsers = function(config, processor) {
		config.addCredentials(this);
		var xml = this.POST(this.credentials.rest + "/get-" + config.getType() + "-users", config.toXML(), function(xml) {
			var users = [];
			if (xml != null) {
				for (var index = 0; index < xml.childNodes.length; index++) {
					var user = new UserConfig();
					user.parseXML(xml.childNodes[index]);
					users[users.length] = (user.user);
				}
			}
			processor(users);
			
		});
	}
	
	/**
	 * Return the bot's voice configuration.
	 */
	this.fetchVoice = function(config, processor) {
		config.addCredentials(this);
		xml = (this.credentials.rest + "/get-voice", config.toXML(), function(xml) {
			if (xml == null) {
				return;
			}
			var voice = new VoiceConfig();
			voice.parseXML(xml);
			processor(voice);			
		});
	}
	
	/**
	 * Return the list of content for the browse criteria.
	 * The type defines the content type (one of Bot, Forum, Channel, Domain).
	 */
	this.browse = function(config, processor) {
		config.addCredentials(this);
		var type = "";
		if (config.type == "Bot") {
			type = "/get-instances";
		} else if (config.type == "Forum") {
			type = "/get-forums";
		} else if (config.type == "Channel") {
			type = "/get-channels";
		} else if (config.type == "Domain") {
			type = "/get-domains";
		}
		this.POST(this.credentials.rest + type, config.toXML(), function(xml) {
			var instances = [];
			if (xml != null) {
				for (var index = 0; index < xml.childNodes.length; index++) {
					var instance = null;
					if (config.type == "Bot") {
						instance = new InstanceConfig();
					} else if (config.type == "Forum") {
						instance = new ForumConfig();
					} else if (config.type == "Channel") {
						instance = new ChannelConfig();
					} else if (config.type == "Domain") {
						instance = new DomainConfig();
					}
					instance.parseXML(xml.childNodes[index]);
					instances[instances.length] = (instance);
				}
			}
			processor(instances);
		});
	}

	this.GET = function(url, processor) {	
		if (this.debug) {
			console.log("GET: " + url);
		}
		var xml = null;
		var request = new XMLHttpRequest();
		var debug = this.debug;
		var self = this;
		request.onreadystatechange = function() {
			if (request.readyState != 4) return;
			if (request.status != 200) {
				console.log('Error: SDK GET web request failed');
				if (debug) {
					console.log(request.statusText);
					console.log(request.responseText);
					console.log(request.responseXML);
				}
				self.error(request.responseText);
				return;
			}
			processor(request.responseXML.childNodes[0]);
		}
		
		request.open('GET', url, true);
		request.send();
	}

	this.POST = function(url, xml, processor) {
		if (this.debug) {
			console.log("POST: " + url);
			console.log("XML: " + xml);
		}
		var request = new XMLHttpRequest();
		var debug = this.debug;
		var self = this;
		request.onreadystatechange = function() {
			if (debug) {
				console.log(request.readyState);
				console.log(request.status);
				console.log(request.statusText);
				console.log(request.responseText);
				console.log(request.responseXML);
			}
			if (request.readyState != 4) return;
			if (request.status != 200 && request.status != 204) {
				console.log('Error: SDK POST web request failed');
				if (debug) {
					console.log(request.statusText);
					console.log(request.responseText);
					console.log(request.responseXML);
				}
				self.error(request.responseText);
				return;
			}
			processor(request.responseXML.childNodes[0]);
		};
		
		request.open('POST', url, true);
		request.setRequestHeader("Content-Type", "application/xml");
		request.send(xml);
	}
}

/**
 * DTO for XML config.
 */
function Config() {
	this.application;
	this.domain;
	this.user;
	this.token;
	this.instance;
	this.type;
	
	this.addCredentials = function(connection) {
		this.application = connection.credentials.applicationId;
		if (connection.user != null) {
			this.user = connection.user.user;
			this.token = connection.user.token;
		}
		if (connection.domain != null) {
			this.domain = connection.domain.id;
		}
	}
	
	this.writeCredentials = function(xml) {
		if (this.user != null && this.user.length > 0) {
			xml = xml + (" user=\"" + this.user + "\"");
		}
		if (this.token != null && this.token.length > 0) {
			xml = xml + (" token=\"" + this.token + "\"");
		}
		if (this.type != null && this.type.length > 0) {
			xml = xml + (" type=\"" + this.type + "\"");
		}
		if (this.instance != null && this.instance.length > 0) {
			xml = xml + (" instance=\"" + this.instance + "\"");
		}
		if (this.application != null && this.application.length > 0) {
			xml = xml + (" application=\"" + this.application + "\"");
		}
		if (this.domain != null && this.domain.length > 0) {
			xml = xml + (" domain=\"" + this.domain + "\"");
		}
		return xml;
	}
}

/**
 * DTO for XML user creation config.
 */
function UserConfig() {
	this.password;
	this.newPassword;
	this.hint;
	this.name;
	this.showName;
	this.email;
	this.website;
	this.bio;
	this.over18;
	this.avatar;
	
	this.connects;
	this.bots;
	this.posts;
	this.messages;
	this.joined;
	this.lastConnect;
	
	this.addCredentials = function(connection) {
		this.application = connection.credentials.applicationId;
		if (connection.domain != null) {
			this.domain = connection.domain.id;
		}
	}

	this.parseXML = function(element) {
		this.user = element.getAttribute("user");
		this.name = element.getAttribute("name");
		this.showName = element.getAttribute("showName");
		this.token = element.getAttribute("token");
		this.email = element.getAttribute("email");
		this.hint = element.getAttribute("hint");
		this.website = element.getAttribute("website");
		this.connects = element.getAttribute("connects");
		this.bots = element.getAttribute("bots");
		this.posts = element.getAttribute("posts");
		this.messages = element.getAttribute("messages");
		this.joined = element.getAttribute("joined");
		this.lastConnect = element.getAttribute("lastConnect");
		
		var node = element.getElementsByTagName("bio")[0];
		if (node != null) {
			this.bio = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("avatar")[0];
		if (node != null) {
			this.avatar = SDK.innerHTML(node);
		}
	}
	
	this.toXML = function() {
		var xml = "<user";
		xml = this.writeCredentials(xml);
		if (this.password != null) {
			xml = xml + (" password=\"" + this.password + "\"");
		}
		if (this.newPassword != null) {
			xml = xml + (" newPassword=\"" + this.newPassword + "\"");
		}
		if (this.hint != null) {
			xml = xml + (" hint=\"" + this.hint + "\"");
		}
		if (this.name != null) {
			xml = xml + (" name=\"" + this.name + "\"");
		}
		if (this.showName) {
			xml = xml + (" showName=\"" + this.showName + "\"");
		}
		if (this.email != null) {
			xml = xml + (" email=\"" + this.email + "\"");
		}
		if (this.website != null) {
			xml = xml + (" website=\"" + this.website + "\"");
		}
		if (this.over18) {
			xml = xml + (" over18=\"" + this.over18 + "\"");
		}
		xml = xml + (">");
		
		if (this.bio != null) {
			xml = xml + ("<bio>");
			xml = xml + (this.bio);
			xml = xml + ("</bio>");
		}
		xml = xml + ("</user>");
		return xml;
	}
		
}
UserConfig.prototype = new Config();
UserConfig.constructor = UserConfig;

/**
 * DTO for XML chat message config.
 */
function ChatConfig() {	
	this.conversation;
	this.speak;
	this.correction;
	this.offensive;
	this.disconnect;
	this.emote;
	this.action;
	this.message;
	
	this.toXML = function() {
		var xml = "<chat";
		xml = this.writeCredentials(xml);
		if (this.conversation != null) {
			xml = xml + (" conversation=\"" + this.conversation + "\"");
		}
		if (this.emote != null) {
			xml = xml + (" emote=\"" + this.emote + "\"");
		}
		if (this.action != null) {
			xml = xml + (" action=\"" + this.action + "\"");
		}
		if (this.speak) {
			xml = xml + (" speak=\"" + this.speak + "\"");
		}
		if (this.correction) {
			xml = xml + (" correction=\"" + this.correction + "\"");
		}
		if (this.offensive) {
			xml = xml + (" offensive=\"" + this.offensive + "\"");
		}
		if (this.disconnect) {
			xml = xml + (" disconnect=\"" + this.disconnect + "\"");
		}
		xml = xml + (">");
		
		if (this.message != null) {
			xml = xml + ("<message>");
			xml = xml + (this.message);
			xml = xml + ("</message>");
		}
		xml = xml + ("</chat>");
		return xml;
	}
}
ChatConfig.prototype = new Config();
ChatConfig.constructor = ChatConfig;

/**
 * DTO for XML chat response config.
 */
function ChatResponse() {	
	this.conversation;
	this.avatar;
	this.avatarType;
	this.avatarTalk;
	this.avatarTalkType;
	this.avatarAction;
	this.avatarActionType;
	this.avatarActionAudio;
	this.avatarActionAudioType;
	this.avatarAudio;
	this.avatarAudioType;
	this.avatarBackground;
	this.speech;
	this.message;
	this.emote;
	this.action;
	this.pose;


	this.parseXML = function(element) {
		this.conversation = element.getAttribute("conversation");
		this.avatar = element.getAttribute("avatar");
		this.avatarType = element.getAttribute("avatarType");
		this.avatarTalk = element.getAttribute("avatarTalk");
		this.avatarTalkType = element.getAttribute("avatarTalkType");
		this.avatarAction = element.getAttribute("avatarAction");
		this.avatarActionType = element.getAttribute("avatarActionType");
		this.avatarActionAudio = element.getAttribute("avatarActionAudio");
		this.avatarActionAudioType = element.getAttribute("avatarActionAudioType");
		this.avatarAudio = element.getAttribute("avatarAudio");
		this.avatarAudioType = element.getAttribute("avatarAudioType");
		this.avatarBackground = element.getAttribute("avatarBackground");
		this.emote = element.getAttribute("emote");
		this.action = element.getAttribute("action");
		this.pose = element.getAttribute("pose");
		this.speech = element.getAttribute("speech");

		var node = element.getElementsByTagName("message")[0];
		if (node != null) {
			this.message = SDK.innerHTML(node);
			if (this.message == null) {
				var div = document.createElement("div");
				div.appendChild(node);
				this.message = div.innerHTML;
			}
			var index = this.message.indexOf("&lt;");
			var index2 = this.message.indexOf("&gt;")
			if (index != -1 && index2 > index) {
				this.message = this.message.replace(/&lt;/g, "<");
				this.message = this.message.replace(/&gt;/g, ">");
			}
		}
	}
}
ChatResponse.prototype = new Config();
ChatResponse.constructor = ChatResponse;

/**
 * DTO for XML avatar message config.
 */
function AvatarMessage() {	
	this.avatar;
	this.speak;
	this.voice;
	this.message;
	this.emote;
	this.action;
	this.pose;
	
	this.toXML = function() {
		var xml = "<avatar-message";
		xml = this.writeCredentials(xml);
		if (this.avatar != null) {
			xml = xml + (" avatar=\"" + this.avatar + "\"");
		}
		if (this.emote != null) {
			xml = xml + (" emote=\"" + this.emote + "\"");
		}
		if (this.action != null) {
			xml = xml + (" action=\"" + this.action + "\"");
		}
		if (this.pose != null) {
			xml = xml + (" pose=\"" + this.pose + "\"");
		}
		if (this.voice != null) {
			xml = xml + (" voice=\"" + this.voice + "\"");
		}
		if (this.speak) {
			xml = xml + (" speak=\"" + this.speak + "\"");
		}
		xml = xml + (">");
		
		if (this.message != null) {
			xml = xml + ("<message>");
			xml = xml + (this.message);
			xml = xml + ("</message>");
		}
		xml = xml + ("</avatar-message>");
		return xml;
	}
}
AvatarMessage.prototype = new Config();
AvatarMessage.constructor = AvatarMessage;

/**
 * DTO for XML browse options.
 */
function BrowseConfig() {
	this.type;
	this.typeFilter;
	this.category;
	this.tag;
	this.filter;
	this.sort;
	
	this.toXML = function() {
		var xml = "<browse";
		xml = this.writeCredentials(xml);
		xml = xml + (" type=\"" + this.type + "\"");
		if (this.typeFilter != null) {
			xml = xml + (" typeFilter=\"" + this.typeFilter + "\"");
		}
		if (this.sort != null) {
			xml = xml + (" sort=\"" + this.sort + "\"");
		}
		if ((this.category != null) && this.category != "") {
			xml = xml + (" category=\"" + this.category + "\"");
		}
		if ((this.tag != null) && this.tag != "") {
			xml = xml + (" tag=\"" + this.tag + "\"");
		}
		if ((this.filter != null) && this.filter != "") {
			xml = xml + (" filter=\"" + this.filter + "\"");
		}
		xml = xml + ("/>");
		return xml;
	}
}
BrowseConfig.prototype = new Config();
BrowseConfig.constructor = BrowseConfig;

/**
 * DTO for XML web medium config.
 */
function WebMediumConfig() {
	this.id;
	this.name;
	this.isAdmin;
	this.isAdult;
	this.isPrivate;
	this.isHidden;
	this.accessMode;
	this.isFlagged;
	this.description;
	this.details;
	this.disclaimer;
	this.tags;
	this.categories;
	this.flaggedReason;
	this.creator;
	this.creationDate;
	this.lastConnectedUser;
	this.license;
	this.avatar;
	this.connects;
	this.dailyConnects;
	this.weeklyConnects;
	this.monthlyConnects;

	this.writeWebMediumXML = function(xml) {
		xml = xml + this.writeCredentials(xml);
		if (this.id != null) {
			xml = xml + (" id=\"" + this.id + "\"");
		}
		if (this.name != null) {
			xml = xml + (" name=\"" + this.name + "\"");
		}
		if (this.isPrivate) {
			xml = xml + (" isPrivate=\"true\"");
		}
		if (this.isHidden) {
			xml = xml + (" isHidden=\"true\"");
		}
		if (this.accessMode != null && this.accessMode != "") {
			xml = xml + (" accessMode=\"" + this.accessMode + "\"");
		}
		if (this.isAdult) {
			xml = xml + (" isAdult=\"true\"");
		}
		if (this.isFlagged) {
			xml = xml + (" isFlagged=\"true\"");
		}
		xml = xml + (">");
		if (this.description != null) {
			xml = xml + ("<description>");
			xml = xml + (this.description);
			xml = xml + ("</description>");
		}
		if (this.details != null) {
			xml = xml + ("<details>");
			xml = xml + (this.details);
			xml = xml + ("</details>");
		}
		if (this.disclaimer != null) {
			xml = xml + ("<disclaimer>");
			xml = xml + (this.disclaimer);
			xml = xml + ("</disclaimer>");
		}
		if (this.categories != null) {
			xml = xml + ("<categories>");
			xml = xml + (this.categories);
			xml = xml + ("</categories>");
		}
		if (this.tags != null) {
			xml = xml + ("<tags>");
			xml = xml + (this.tags);
			xml = xml + ("</tags>");
		}
		if (this.license != null) {
			xml = xml + ("<license>");
			xml = xml + (this.license);
			xml = xml + ("</license>");
		}
		if (this.flaggedReason != null) {
			xml = xml + ("<flaggedReason>");
			xml = xml + (this.flaggedReason);
			xml = xml + ("</flaggedReason>");
		}
	}
	
	this.parseWebMediumXML = function(element) {
		this.id = element.getAttribute("id");
		this.name = element.getAttribute("name");
		this.creationDate = element.getAttribute("creationDate");
		this.isPrivate = element.getAttribute("isPrivate");
		this.isHidden = element.getAttribute("isHidden");
		this.accessMode = element.getAttribute("accessMode");
		this.isAdmin = element.getAttribute("isAdmin");
		this.isAdult = element.getAttribute("isAdult");
		this.isFlagged = element.getAttribute("isFlagged");
		this.creator = element.getAttribute("creator");
		this.creationDate = element.getAttribute("creationDate");
		this.connects = element.getAttribute("connects");
		this.dailyConnects = element.getAttribute("dailyConnects");
		this.weeklyConnects = element.getAttribute("weeklyConnects");
		this.monthlyConnects = element.getAttribute("monthlyConnects");
		
		var node = element.getElementsByTagName("description")[0];
		if (node != null) {
			this.description = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("details")[0];
		if (node != null) {
			this.details = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("disclaimer")[0];
		if (node != null) {
			this.disclaimer = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("categories")[0];
		if (node != null) {
			this.categories = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("tags")[0];
		if (node != null) {
			this.tags = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("flaggedReason")[0];
		if (node != null) {
			this.flaggedReason = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("lastConnectedUser")[0];
		if (node != null) {
			this.lastConnectedUser = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("license")[0];
		if (node != null) {
			this.license = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("avatar")[0];
		if (node != null) {
			this.avatar = SDK.innerHTML(node);
		}
	}
}
WebMediumConfig.prototype = new Config();
WebMediumConfig.constructor = WebMediumConfig;

/**
 * DTO for XML channel config.
 */
function ChannelConfig() {
	this.type;
	this.messages;
	this.usersOnline;
	this.adminsOnline;
	
	this.type = "channel";
	
	this.credentials = function() {
		var config = new ChannelConfig();
		config.id = this.id;
		return config;
	}
	
	this.toXML = function() {
		var xml = "<channel";
		if (this.type != null && this.type != "") {
			xml = xml + (" type=\"" + this.type + "\"");
		}
		this.writeWebMediumXML(writer);
		xml = xml + ("</channel>");
		return xml;
	}
	
	this.parseXML = function(element) {
		this.parseWebMediumXML(element);
		this.type = element.getAttribute("type");
		this.messages = element.getAttribute("messages");
		this.usersOnline = element.getAttribute("usersOnline");
		this.adminsOnline = element.getAttribute("adminsOnline");
	}
}
ChannelConfig.prototype = new WebMediumConfig();
ChannelConfig.constructor = ChannelConfig;

/**
 * DTO for XML content config.
 */
function ContentConfig() {	
	this.type;	
	
	this.parseXML = function(element) {		
		this.type = element.getAttribute("type");
	}

	
	this.toXML = function() {
		var xml = "<content";
		xml = this.writeCredentials(xml);

		if (this.type != null) {
			xml = xml + (" type=\"" + this.type + "\"");
		}
		
		xml = xml + ("/>");
		return xml;
	}
}
ContentConfig.prototype = new Config();
ContentConfig.constructor = ContentConfig;

/**
 * DTO for XML domain config.
 */
function DomainConfig() {
	this.creationMode;
	
	this.type = "domain";
	
	this.credentials = function() {
		var config = new DomainConfig();
		config.id = this.id;
		return config;
	}
	
	this.toXML = function() {
		var xml = "<domain";
		if (this.creationMode != null && this.creationMode != "") {
			xml = xml + (" creationMode=\"" + this.creationMode + "\"");
		}
		this.writeWebMediumXML(writer);
		xml = xml + ("</domain>");
		return xml;
	}
	
	this.parseXML = function(element) {
		this.parseWebMediumXML(element);
		this.creationMode = element.getAttribute("creationMode");
	}
}
DomainConfig.prototype = new WebMediumConfig();
DomainConfig.constructor = DomainConfig;

/**
 * DTO for XML forum config.
 */
function ForumConfig() {
	this.replyAccessMode;
	this.postAccessMode;
	this.posts;
	
	this.type = "forum";
	
	this.credentials = function() {
		var config = new ForumConfig();
		config.id = this.id;
		return config;
	}
	
	this.toXML = function() {
		var xml = xml + ("<forum");
		if (this.replyAccessMode != null && !this.replyAccessMode == "") {
			xml = xml + (" replyAccessMode=\"" + this.replyAccessMode + "\"");
		}
		if (this.postAccessMode != null && !this.postAccessMode == "") {
			xml = xml + (" postAccessMode=\"" + this.postAccessMode + "\"");
		}
		xml = this.writeWebMediumXML(xml);
		xml = xml + ("</forum>");
		return xml;
	}
	
	this.parseXML = function(element) {
		this.parseWebMediumXML(element);
		this.replyAccessMode = element.getAttribute("replyAccessMode");
		this.postAccessMode = element.getAttribute("postAccessMode");
		this.posts = element.getAttribute("posts");
	}
}
ForumConfig.prototype = new WebMediumConfig();
ForumConfig.constructor = ForumConfig;

/**
 * DTO for XML forum post config.
 */
function ForumPostConfig() {	
	this.id;
	this.topic;
	this.summary;
	this.details;
	this.detailsText;
	this.forum;
	this.tags;
	this.isAdmin;
	this.isFlagged;
	this.flaggedReason;
	this.isFeatured;
	this.creator;
	this.creationDate;
	this.views;
	this.dailyViews;
	this.weeklyViews;
	this.monthlyViews;
	this.replyCount;
	this.parent;
	this.avatar;
	this.replies;
	
	this.toXML = function() {
		var xml = "<forum-post";
		xml = this.writeCredentials(xml);
		if (this.id != null) {
			xml = xml + (" id=\"" + this.id + "\"");
		}
		if (this.parent != null) {
			xml = xml + (" parent=\"" + this.parent + "\"");
		}
		if (this.forum != null) {
			xml = xml + (" forum=\"" + this.forum + "\"");
		}
		if (this.isFeatured) {
			xml = xml + (" isFeatured=\"true\"");
		}
		xml = xml + (">");
		if (this.topic != null) {
			xml = xml + ("<topic>");
			xml = xml + (this.topic);
			xml = xml + ("</topic>");
		}
		if (this.details != null) {
			var text = this.details;
			text = text.replace("<", "&lt;");
			text = text.replace(">", "&gt;");
			xml = xml + ("<details>");
			xml = xml + (text);
			xml = xml + ("</details>");
		}
		if (this.tags != null) {
			xml = xml + ("<tags>");
			xml = xml + (this.tags);
			xml = xml + ("</tags>");
		}
		xml = xml + ("</forum-post>");
	}
	
	this.parseXML = function(element) {
		this.id = element.getAttribute("id");
		this.parent = element.getAttribute("parent");
		this.forum = element.getAttribute("forum");
		this.views = element.getAttribute("views");
		this.dailyViews = element.getAttribute("dailyViews");
		this.weeklyViews = element.getAttribute("weeklyViews");
		this.monthlyViews = element.getAttribute("monthlyViews");
		this.isAdmin = element.getAttribute("isAdmin");
		this.replyCount = element.getAttribute("replyCount");
		this.isFlagged = element.getAttribute("isFlagged");
		this.isFeatured = element.getAttribute("isFeatured");
		this.creator = element.getAttribute("creator");
		this.creationDate = element.getAttribute("creationDate");
		
		var node = element.getElementsByTagName("summary")[0];
		if (node != null) {
			this.summary = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("details")[0];
		if (node != null) {
			this.details = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("detailsText")[0];
		if (node != null) {
			this.detailsText = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("topic")[0];
		if (node != null) {
			this.topic = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("tags")[0];
		if (node != null) {
			this.tags = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("flaggedReason")[0];
		if (node != null) {
			this.flaggedReason = SDK.innerHTML(node);
		}
		node = element.getElementsByTagName("avatar")[0];
		if (node != null) {
			this.avatar = SDK.innerHTML(node);
		}
		var nodes = element.getElementsByTagName("replies");
		if (nodes != null && nodes.length > 0) {
			this.replies = [];
			for (var index = 0; index < nodes.length; index++) {
				var reply = nodes[index];
				var config = new ForumPostConfig();
				config.parseXML(reply);
				this.replies[replies.length] = (config);
			}
		}
	}
}
ForumPostConfig.prototype = new Config();
ForumPostConfig.constructor = ForumPostConfig;

/**
 * DTO for XML bot instance config.
 */
function InstanceConfig() {
	this.size;
	this.allowForking;
	this.template;
	
	this.type = "instance";
	
	this.credentials = function() {
		var config = new InstanceConfig();
		config.id = this.id;
		return config;
	}
	
	this.toXML = function() {
		var xml = "<instance";
		if (this.allowForking) {
			xml = xml + (" allowForking=\"true\"");
		}
		this.writeWebMediumXML(writer);
		if (this.template != null) {
			xml = xml + ("<template>");
			xml = xml + (this.template);
			xml = xml + ("</template>");
		}
		xml = xml + ("</instance>");
		return xml;
	}
	
	this.parseXML = function(element) {
		this.parseWebMediumXML(element);
		this.allowForking = element.getAttribute("allowForking");
		this.size = element.getAttribute("size");
		
		var node = element.getElementsByTagName("template")[0];
		if (node != null) {
			this.template = SDK.innerHTML(node);
		}
	}
}
InstanceConfig.prototype = new WebMediumConfig();
InstanceConfig.constructor = InstanceConfig;

/**
 * DTO for XML voice config.
 */
function VoiceConfig() {	
	this.language;	
	this.pitch;
	this.speechRate;
	
	this.parseXML = function (element) {		
		this.language = element.getAttribute("language");
		this.pitch = element.getAttribute("pitch");
		this.speechRate = element.getAttribute("speechRate");
	}

	
	this.toXML = function() {
		var xml = "<voice";
		xml = this.writeCredentials(xml);

		if (this.language != null) {
			xml = xml + (" language=\"" + this.language + "\"");
		}
		if (this.pitch != null) {
			xml = xml + (" pitch=\"" + this.pitch + "\"");
		}
		if (this.speechRate != null) {
			xml = xml + (" speechRate=\"" + this.speechRate + "\"");
		}
		
		xml = xml + ("/>");
		return xml;
	}
}
VoiceConfig.prototype = new Config();
VoiceConfig.constructor = VoiceConfig;

