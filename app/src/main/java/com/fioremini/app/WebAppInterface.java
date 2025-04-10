package com.fioremini.app;

import android.content.Context;
import android.content.res.AssetManager;
import android.webkit.JavascriptInterface;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

public class WebAppInterface {
    Context mContext;

    /** Instantiate the interface and set the context. */
    WebAppInterface(Context c) {
        mContext = c;
    }


    @JavascriptInterface
    public String loadZhogo() {
        String retour;
        try {
            InputStream fis = mContext.getAssets().open("jeux.json");
            retour = new BufferedReader(new InputStreamReader(fis))
                    .lines().parallel().collect(Collectors.joining("\n"));
        } catch (Exception e){
            retour=e.getMessage();
        }
        return retour;
    }


    //
    @JavascriptInterface
    public String loadIntros() {
        String s;
        try {
            InputStream fis = mContext.getAssets().open("intros.json");
            s = new BufferedReader(new InputStreamReader(fis))
                    .lines().parallel().collect(Collectors.joining("\n"));
        } catch (Exception e){
            s=e.getMessage();
        }
        return s;
    }

    @JavascriptInterface
    public String getSvg(String id) {
        String svg;
        try {
            AssetManager assets = mContext.getAssets();
            InputStream fis = assets.open(id + ".xml");
            svg = new BufferedReader(new InputStreamReader(fis))
                    .lines().parallel().collect(Collectors.joining("\n"));
        } catch (Exception e){
            svg=e.getMessage();
        }
        return svg;
    }
}
