package com.paphus.sdk.activity.actions;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.lang.ref.SoftReference;
import java.net.URL;
import java.util.Hashtable;
import java.util.Map;

import com.paphus.sdk.activity.MainActivity;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.widget.ImageView;

public class HttpGetImageAction extends HttpAction {
	public static int MAX_HEIGHT = 300;
	public static int MAX_WIDTH = 300;
	
	static File cacheDir;	
	static Map<String, SoftReference<Bitmap>> imageCache = new Hashtable<String, SoftReference<Bitmap>>();
	
	String image;
	Bitmap bmp;
	ImageView view;
	
	public static void clearFileCache(Context context) {
		try {
        File[] files= getFileCacheDir(context).listFiles();
	        if (files == null) {
	            return;
	        }
	        for (File file : files) {
	            file.delete();
	        }
		} catch (Exception failed) {
			failed.printStackTrace();
		}
    }
	
    public static File getFileCacheDir(Context context) {
    	if (cacheDir == null) {
    		try {
		        if (android.os.Environment.getExternalStorageState().equals(android.os.Environment.MEDIA_MOUNTED)) {
		            cacheDir = new File(android.os.Environment.getExternalStorageDirectory().toString() + "/botlibre");
		        } else {
		            cacheDir = context.getCacheDir();
		        }
		        if (!cacheDir.exists()) {
		            cacheDir.mkdirs();
		        }
    		} catch (Exception failed) {
    			failed.printStackTrace();
    			return null;
    		}
    	}
    	return cacheDir;
    }
    
    public static File getFile(String filename, Context context) {
    	File dir = getFileCacheDir(context);
    	if (dir == null) {
    		return null;
    	}
    	
    	File file = new File(dir.getAbsolutePath() + "/" + filename);
    	dir = new File(file.getParent());
    	if (!dir.exists()) {
    		dir.mkdir();
    	}
    	return file;
    }
	
	public static void fetchImage(Activity activity, String image, ImageView view) {
		if (image == null) {
			return;
		}
		SoftReference<Bitmap> ref = imageCache.get(image);
		if (ref != null) {
			Bitmap bmp = ref.get();
			if (bmp != null) {
				view.setImageBitmap(bmp);
		        return;
			}
		}
        HttpGetImageAction action = new HttpGetImageAction(activity, image, view);
    	try {
    		action.execute().get();
    		action.postExecute();
    		if (action.getException() != null) {
    			throw action.getException();
    		}
    	} catch (Exception exception) {
    		if (MainActivity.DEBUG) {
    			exception.printStackTrace();
    		}
    		return;
    	}
	}
	
	public HttpGetImageAction(Activity activity, String image, ImageView view) {
		super(activity);
		this.image = image;
		this.view = view;
	}

	@Override
	protected String doInBackground(Void... params) {
        try {
	        URL url = MainActivity.connection.fetchImage(this.image);
		    
		    /*BitmapFactory.Options options = new BitmapFactory.Options();
		    options.inJustDecodeBounds = true;
		    long start = System.currentTimeMillis();
		    InputStream stream = url.openConnection().getInputStream();
		    BitmapFactory.decodeStream(stream, null, options);
		    stream.close();
		    System.out.println("decodeStream1:" + (System.currentTimeMillis() - start));

	        int height = options.outHeight;
	        int width = options.outWidth;
	        options.inPreferredConfig = Bitmap.Config.RGB_565;
	        int inSampleSize = 1;

	        if (height > MAX_HEIGHT) {
	            inSampleSize = Math.round((float)height / (float)MAX_HEIGHT);
	        }

	        int expectedWidth = width / inSampleSize;

	        if (expectedWidth > MAX_WIDTH) {
	            inSampleSize = Math.round((float)width / (float)MAX_WIDTH);
	        }

		    options.inSampleSize = inSampleSize;
		    options.inJustDecodeBounds = false;

		    start = System.currentTimeMillis();
		    stream = url.openConnection().getInputStream();
		    BitmapFactory.decodeStream(stream, null, options).recycle();
		    stream.close();
		    System.out.println("decodeStream2:" + (System.currentTimeMillis() - start));

		    start = System.currentTimeMillis();
		    stream = url.openConnection().getInputStream();
		    BitmapFactory.decodeStream(stream).recycle();
		    stream.close();
		    System.out.println("decodeStream-full:" + (System.currentTimeMillis() - start));*/

		    File file = getFile(this.image, this.activity);
		    if (!file.exists()) {
		    	file.createNewFile();
		    	FileOutputStream outputStream = new FileOutputStream(file);
			    InputStream stream = url.openConnection().getInputStream();
		    	byte[] bytes= new byte[1024];
		    	int count = 0;
	            while (count != -1) {
	            	count = stream.read(bytes, 0, 1024);
		            if (count == -1) {
		            	break;
		            }
		            outputStream.write(bytes, 0, count);
	            }
	            stream.close();
	            outputStream.close();
		    }

		    BitmapFactory.Options options = new BitmapFactory.Options();
		    options.inJustDecodeBounds = true;
		    InputStream stream = new FileInputStream(getFile(this.image, this.activity));
		    BitmapFactory.decodeStream(stream, null, options);
		    stream.close();

	        int height = options.outHeight;
	        int width = options.outWidth;
	        options.inPreferredConfig = Bitmap.Config.RGB_565;
	        int inSampleSize = 1;
	        if (height > MAX_HEIGHT) {
	            inSampleSize = Math.round((float)height / (float)MAX_HEIGHT);
	        }
	        int expectedWidth = width / inSampleSize;
	        if (expectedWidth > MAX_WIDTH) {
	            inSampleSize = Math.round((float)width / (float)MAX_WIDTH);
	        }
		    options.inSampleSize = inSampleSize;
		    options.inJustDecodeBounds = false;

		    stream = new FileInputStream(getFile(this.image, this.activity));
		    this.bmp = BitmapFactory.decodeStream(stream, null, options);
		    stream.close();
			    
	        imageCache.put(this.image, new SoftReference<Bitmap>(this.bmp));
	        return "";
        } catch (Exception exception) {
    		if (MainActivity.DEBUG) {
    			exception.printStackTrace();
    		}
        }
        return null;
	}

	protected void postExecute() {
        this.view.setImageBitmap(this.bmp);
	}
}