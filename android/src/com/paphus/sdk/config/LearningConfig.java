package com.paphus.sdk.config;

import java.io.StringWriter;

import org.w3c.dom.Element;


/**
 * DTO for XML voice config.
 */
public class LearningConfig extends Config {
	
	public String learningMode;	
	public String correctionMode;
	public boolean enableComprehension;
	public boolean enableEmoting;
	
	public void parseXML(Element element) {
		super.parseXML(element);
		
		this.learningMode = element.getAttribute("learningMode");
		this.correctionMode = element.getAttribute("correctionMode");
		this.enableComprehension = Boolean.valueOf(element.getAttribute("enableComprehension"));
		this.enableEmoting = Boolean.valueOf(element.getAttribute("enableEmoting"));
	}

	
	public String toXML() {
		StringWriter writer = new StringWriter();
		writer.write("<learning");
		writeCredentials(writer);

		if (this.learningMode != null) {
			writer.write(" learningMode=\"" + this.learningMode + "\"");
		}
		if (this.correctionMode != null) {
			writer.write(" correctionMode=\"" + this.correctionMode + "\"");
		}
		if (this.enableComprehension) {
			writer.write(" enableComprehension=\"" + this.enableComprehension + "\"");
		}
		if (this.enableEmoting) {
			writer.write(" enableEmoting=\"" + this.enableEmoting + "\"");
		}
		
		writer.write("/>");
		return writer.toString();
	}
}