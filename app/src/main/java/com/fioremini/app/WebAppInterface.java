package com.fioremini.app;

import android.content.Context;
import android.webkit.JavascriptInterface;

import java.io.InputStream;

public class WebAppInterface {
    Context mContext;

    /** Instantiate the interface and set the context. */
    WebAppInterface(Context c) {
        mContext = c;
    }

    /** Show a toast from the web page. */
    @JavascriptInterface
    public String loadZhogo() {
        String retour = "Test";
        try {
            InputStream fis = mContext.getAssets().open("jeux.json");
            retour = new String(fis.readAllBytes());
        } catch (Exception e){
            retour=e.getMessage();
        }
        return retour;
    }
}
