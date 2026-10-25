Pikuhr opens directly from the native splash into the Home dashboard from Figma frame `1401:4`. The dashboard uses the original avatar and icons, locally bundled with 3x PNG versions of the original SVGs. Its sample attendance, salary, and advance values match the design.

The fixed bottom bar has Home, Salary, Attendance, and Profile tabs. Screen state and scroll positions are retained when switching tabs. Android Back closes a salary subpage before returning to Home. The home avatar opens Profile, and View Details opens Advance Details.

Salary and Salary Slip follow Figma frames `1401:365` and `1401:598`, with the original locally bundled assets. Month and year selectors update the demo payroll; View Salary Slip preserves that period. Unavailable future periods show an empty state and disable the slip action. Earned salary already includes absence deductions, so net pay subtracts the advance deduction only once.

Attendance follows frame `1401:136` with a real Monday-first calendar, leap years, month/year selection, previous/next navigation, selectable dates, and date-specific check-in, check-out, QR source, and location status. The list button switches to daily records with status filters; summaries and PDF exports use the visible records. Returning to the calendar restores the full-month summary and export. October 2026 starts on 7 October with the supplied seven demo records. Earlier months have deterministic demo history; future dates have no records. No live attendance or GPS verification occurs.

The supplied employee design page has no Profile frame. Profile reuses the Salary Slip employee card and common styling. Employee ID stays fixed; name, designation, store, mobile, email, and city can be edited with validation. Changes persist in Android SharedPreferences or iOS UserDefaults and update Home and later reports. These are local demo edits, with no backend profile API.

Download actions generate actual text/vector PDFs for salary slips, attendance reports, advance statements, and employee details. Android 10+ uses `PdfDocument` and MediaStore to save directly in Downloads/Pikuhr; Android 7-9 use the system Save As picker. iOS uses `UIGraphicsPDFRenderer` and the Files export picker. No storage permission or new dependency is needed. Cancelling does not show a success message, failures remain retryable, and temporary export files are removed. Native module changes require a fresh Android/iOS build rather than a Metro reload; the iOS source is included in the Xcode target.

The earlier onboarding and demo authentication screens remain in the source and retain their tests, but are currently bypassed at launch. No authentication or attendance API is called by the dashboard.

Android retains its existing native splash artwork and minimum 900ms display, then fades into Home once the main app has laid out. The shared UI and Poppins fonts are configured for both platforms; the existing full-screen splash implementation is Android-only.

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
