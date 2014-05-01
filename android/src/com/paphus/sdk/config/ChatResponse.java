package com.paphus.sdk.config;

import org.w3c.dom.Element;
import org.w3c.dom.Node;


/**
 * DTO for XML chat config.
 */
public class ChatResponse extends Config {
	
	public String conversation;
	public String avatar;
	public String message;


	public void parseXML(Element element) {
		this.conversation = element.getAttribute("conversation");
		this.avatar = element.getAttribute("avatar");

		Node node = element.getElementsByTagName("message").item(0);
		if (node != null) {
			this.message = node.getTextContent();
		}
	}
}