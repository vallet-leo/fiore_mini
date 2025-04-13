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
    public String loadLangs() {
        StringBuilder sb = new StringBuilder("{");

        for(String langFile : getAllI18n()){
            String lang = langFile.split("_")[1].split("\\.")[0];
            String content;
            try {
                InputStream fis = mContext.getAssets().open(langFile);
                content = new BufferedReader(new InputStreamReader(fis))
                        .lines().parallel().collect(Collectors.joining("\n"));
            } catch (Exception e){
                content=e.getMessage();
            }
            sb.append("\"").append(lang).append("\"").append(":");
            sb.append(replacePilcrow(content));
            sb.append(",");
        }
        sb.deleteCharAt(sb.length() - 1);
        sb.append("}");
    return sb.toString();
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


    private String replacePilcrow(String s){
        if (s==null) return "";
        String st = s.replaceAll("¶ ", "¶");

        String[] stArray = st.split("¶");
        StringBuilder sb = new StringBuilder(stArray[0]);
        for (int i=1; i<stArray.length; i++) {
            if (i%2==0){
                sb.append("<span class='capitulum-b'/>&nbsp;");
            } else {
                sb.append("<span class='capitulum-r'/>&nbsp;");
            }
            sb.append(stArray[i]);
        }
        return sb.toString();
    }

    // Return all i18n files. To improve: should return all files found
    private String[] getAllI18n(){
        return new String[]{"i18n_fr.json", "i18n_en.json", "i18n_o.json"};
    }
}
