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

Shipped to Play (versionCode 5, `1.0.4`), so Digital Asset Links, Play signing, and the
release `.aab` flow are all live. versionCode 5 was installed from the internal test track
and launched clean on a physical phone under targetSdk 36.

Still open:

- Promote versionCode 5 from internal test to production.
- Purchase verification end-to-end against the `google-play-confirm` Edge Function.
- Web push: `enableNotifications` is still `false`, so the build carries no
  `POST_NOTIFICATIONS` permission and web push cannot surface in the installed app.
  Flip it only once the web bundle and the Supabase sender are both live, otherwise a
  push test fails for three possible reasons at once.

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

## Release Build

```powershell
powershell -ExecutionPolicy Bypass -File apps\android\twa\build-release.ps1
```

Builds, checks the output actually carries a signature, and copies it to
`Desktop\QuestDP_Play_Release\questdp-v<name>-code<code>-signed.aab`.

Signing credentials live in `apps/android/twa/keystore.properties` (gitignored; copy
`keystore.properties.example` and fill it from `QuestDP_Play_Upload_Key/upload-key-info.txt`).
The alias is `questdp-upload` and both passwords are 32-char generated strings — copy them,
do not retype. Gradle reads that file as UTF-8 with a BOM strip because the keystore path
contains Hangul; `Properties.load(InputStream)` would decode it as ISO-8859-1 and miss the file.

Confirm the signing certificate matches the last accepted upload before shipping — a
mismatch is rejected by Play:

```powershell
& 'C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe' -printcert -jarfile <aab>
```

Expected SHA-256: `B7:A2:87:78:BB:0C:02:B3:D9:0F:BA:71:A8:7C:CC:E5:1F:0C:80:91:35:41:FC:61:11:92:50:30:A9:19:37:1A`

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

- Bump `versionCode` in `app/build.gradle` — Play rejects a reused one.
- Run `build-release.ps1` (see Release Build above). Android Studio is not needed.
- Upload to the internal test track first, install on a phone, and confirm it launches.
- Promote to production from the internal test track; no rebuild required.

One-time setup, already done and kept here for a fresh machine:

- Upload signing key generated and backed up outside the repo.
- Play App Signing SHA-256 published in `/.well-known/assetlinks.json`.
- Google Play Billing products created.
- Backend purchase verification and acknowledgement implemented.
