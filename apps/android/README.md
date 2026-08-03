# QuestDP Android App Shell

QuestDP Android should start as a Trusted Web Activity.

The production start URL is:

```txt
https://quest-dp.com/app/
```

This route keeps the public website landing page intact while making the Android app open directly into the game, login, or onboarding flow.

## Current Status

Implemented in this repository:

- `/app` React route handling.
- Separate app manifest: `/app.webmanifest`.
- App-mode session marker.
- TWA Android Studio project: `apps/android/twa`.
- Debug APK build succeeded:
  `apps/android/twa/app/build/outputs/apk/debug/app-debug.apk`.
- Debug AAB build succeeded:
  `apps/android/twa/app/build/outputs/bundle/debug/app-debug.aab`.

Shipped to Play (versionCode 4, `1.0.3`), so Digital Asset Links, Play signing, and the
release `.aab` flow are all live. Signing uses `QuestDP_Play_Upload_Key/questdp-upload-key.jks`
(kept outside the repo), not the `./android.keystore` path still named in `twa-manifest.json`.

Still open:

- Connected emulator/device install test.
- Purchase verification end-to-end against the `google-play-confirm` Edge Function.

Android Studio is installed on this machine, but the default terminal still points to old Java 8.
Use Android Studio's bundled JDK and SDK explicitly when building from PowerShell:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
```

## Play Requirement Floors

Google Play enforces these as of 2026-08-31. Both were raised together in versionCode 5.

| Setting | Value | Why |
|---|---|---|
| `com.android.billingclient:billing` | 8.3.0 | Play requires >= 8.0.0. Pulled transitively by `androidbrowserhelper:billing:1.2.0` — do not pin it directly. |
| `targetSdkVersion` | 36 | Play requires Android 16 for updates. |
| `minSdkVersion` | 23 | Forced floor: `androidbrowserhelper:billing:1.2.0` declares minSdk 23. Android 5.x is dropped. |

`overrideLibrary` can silence the minSdk merge error, but it ships Billing 8 code onto
devices lacking its APIs — the failure surfaces mid-purchase. Raise `minSdkVersion` instead.

Verify the resolved billing version before any upload:

```bash
./gradlew -q app:dependencies --configuration releaseRuntimeClasspath | grep billingclient
```

## Recommended Packaging

Use Bubblewrap/TWA:

```txt
web app: https://quest-dp.com/app/
manifest: https://quest-dp.com/app.webmanifest
package name: com.questdp.app
```

## Payment Rule

Use Toss Payments on the web only.

Use Google Play Billing inside the Google Play app.

Both payment providers must grant the same Supabase premium entitlement.

```txt
Toss web payment
-> toss-confirm Edge Function
-> Supabase premium entitlement

Google Play app payment
-> Google Play purchase token
-> google-play-confirm Edge Function
-> Supabase premium entitlement
```

## Before Play Upload

- Open `apps/android/twa` in Android Studio.
- Run the debug APK on an emulator or physical Android phone.
- Generate a real upload signing key and keep it safely backed up.
- Build a signed release `.aab`.
- Upload internal testing build.
- Get Play App Signing SHA-256.
- Publish `/.well-known/assetlinks.json` with the real fingerprint.
- Add Google Play Billing products.
- Implement backend purchase verification and acknowledgement.
