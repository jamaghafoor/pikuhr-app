Pikuhr is a React Native app with a three-page onboarding flow and demo mobile authentication built from the supplied designs.

The illustrations and copy slide together on one screen using a native-driven animation. Next advances a page; Skip (pages 1–2) and Start Now (page 3) open Sign In. Horizontal swipes are also supported. The screen respects reduced motion, safe areas, and larger text.

Sign In and Sign Up accept any nonempty mobile number for the demo. Send OTP opens the shared OTP screen and displays the last three digits of the entered number. Any six-digit numeric code verifies successfully and opens Shopkeeper Details; no SMS or authentication API is called. Back and Change Mobile Number return to the originating form while preserving its number. Each new app launch starts at Sign In after onboarding has been completed; demo verification lasts for the current session.

Shopkeeper Details requires Shopkeeper Name, Shop Name, State, and City before Next opens Home. State appears before City; the city list depends on the selected state, and changing state clears the previous city. The demo includes Maharashtra, Karnataka, Gujarat, Rajasthan, Tamil Nadu, and Uttar Pradesh, with four cities each. Going back to OTP and verifying again preserves the draft details. Profiles are kept only for the current demo session.

Sign In, Sign Up, OTP, and Shopkeeper Details share a keyboard-aware scrolling layout. Opening the keyboard reduces the available form viewport, so the action button and remaining fields can be scrolled into view. Scrolling keeps the keyboard open, and visible buttons respond to the first tap. Forms without a footer include bottom padding above the safe area.

Screen changes use a short, native-driven horizontal slide, reversed for back navigation. The transition keeps the outgoing screen visible until the new screen is in place and switches immediately when the device's reduced-motion setting is enabled.

Android displays the supplied full-screen startup artwork from `android/app/src/main/res/drawable-nodpi/startup_screen.png` while the app loads. Center-crop scaling fills the display without stretching the image or adding borders. The image remains visible for at least 900ms and until the initial screen is ready, then fades into onboarding or Sign In over 220ms (immediately with reduced motion). Android first displays its app-logo screen on a white background, followed by the full-screen startup artwork and then onboarding or Sign In. Android remembers onboarding completion in app preferences. The shared UI and Poppins fonts are also configured for iOS, whose launch storyboard remains a plain background; this startup artwork and persisted onboarding completion are Android-only.

To preview onboarding again in an Android **debug** installation, stop the app and remove only its onboarding preference:

```sh
adb shell am force-stop com.pikuhr
adb shell run-as com.pikuhr rm -f shared_prefs/pikuhr.xml
adb shell am start -n com.pikuhr/.MainActivity
```

Validation commands: `npm test -- --runInBand`, `npm run lint`, and `npx tsc --noEmit`. Use Node 22.11 or newer, as specified in `package.json`.

## Android release APK size

Build the universal release APK with Node 22.11+ and JDK 17:

```sh
cd android
./gradlew :app:assembleRelease
```

The output is `android/app/build/outputs/apk/release/app-release.apk` (relative to the project root). The current build is **22,362,959 bytes (22.36 MB)**, reduced from **57,414,609 bytes (57.41 MB)**. Both include `armeabi-v7a`, `arm64-v8a`, `x86`, and `x86_64`; no processor support was removed.

Release builds enable R8 code optimization and resource shrinking. Native `.so` libraries are compressed in the APK, and unused splash resources were removed. The active images and fonts retain their original quality. Android extracts the device's native libraries during installation, so the APK download size is smaller but installed storage is not reduced by the same amount. The measured size will change as features and dependencies are added. R8's mapping file is generated at `android/app/build/outputs/mapping/release/mapping.txt`; retain the matching file when archiving a release for crash deobfuscation.

For Google Play distribution, use `./gradlew :app:bundleRelease` to generate an App Bundle so Play can deliver only the libraries and resources needed by each device. The current demo build still uses the project's debug signing key.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
