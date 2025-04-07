# Fiore Mini Android App

This is a simple Android WebView app that displays the Fiore Mini web application in a native Android container.

## Project Structure

The project follows the standard Android project structure:

- `app/src/main/java/com/fioremini/app/MainActivity.java`: The main activity that hosts the WebView
- `app/src/main/res/layout/activity_main.xml`: The layout file for the main activity
- `app/src/main/AndroidManifest.xml`: The Android manifest file
- `app/src/main/assets/www/`: Directory containing the web app files

## Building the App

### Prerequisites

- Android Studio 4.0 or higher
- JDK 8 or higher
- Android SDK with API level 33 or higher

### Steps to Build

1. Open the project in Android Studio
2. Build the project using Android Studio or Gradle

```
./gradlew assembleDebug
```

3. The APK file will be generated in `app/build/outputs/apk/debug/`
