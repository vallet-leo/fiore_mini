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
2. Run the `copy_web_assets.bat` script to copy the web app files to the assets directory
3. Build the project using Android Studio or Gradle

```
./gradlew assembleDebug
```

4. The APK file will be generated in `app/build/outputs/apk/debug/`

## Running the App

1. Install the APK on an Android device or emulator
2. Launch the app from the device's app drawer

## Features

- Displays the Fiore Mini web app in a native Android container
- Supports JavaScript and local storage
- Handles back button navigation within the WebView
- Works offline as all assets are bundled with the app

## Customization

You can customize the app by modifying the following files:

- `app/src/main/res/values/strings.xml`: Change the app name
- `app/src/main/res/values/styles.xml`: Customize the app theme
- `app/src/main/AndroidManifest.xml`: Add additional permissions or features