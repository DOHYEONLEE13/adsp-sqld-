# QuestDP 릴리스 빌드
#
# 실행:
#   powershell -ExecutionPolicy Bypass -File .\build-release.ps1
#
# 서명된 .aab 를 만들어 QuestDP_Play_Release 폴더에 넣습니다.
# 비밀번호는 keystore.properties 에서 Gradle 이 직접 읽습니다.

$ErrorActionPreference = 'Stop'
$projectDir = $PSScriptRoot
$releaseDir = 'C:\Users\이도현\Desktop\QuestDP_Play_Release'

$propsPath = Join-Path $projectDir 'keystore.properties'
if (-not (Test-Path $propsPath)) {
    Write-Host ''
    Write-Host '[중단] keystore.properties 파일이 없습니다.' -ForegroundColor Red
    Write-Host ''
    Write-Host '해결 방법:'
    Write-Host "  1. $projectDir 폴더의"
    Write-Host '     keystore.properties.example 을 복사해서'
    Write-Host '     keystore.properties 라는 이름으로 저장하세요.'
    Write-Host '  2. 메모장으로 열어서 네 값을 채우세요.'
    Write-Host '     값은 QuestDP_Play_Upload_Key\upload-key-info.txt 에 적혀 있습니다.'
    Write-Host ''
    exit 1
}

$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Write-Host '앱 파일을 만드는 중입니다. 1~3분 걸립니다...' -ForegroundColor Cyan
Set-Location $projectDir
& .\gradlew.bat bundleRelease --no-daemon
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host '[중단] 빌드가 실패했습니다. 위 오류 메시지를 확인하세요.' -ForegroundColor Red
    exit 1
}

$aab = Join-Path $projectDir 'app\build\outputs\bundle\release\app-release.aab'
if (-not (Test-Path $aab)) {
    Write-Host '[중단] 빌드는 끝났는데 .aab 파일을 찾을 수 없습니다.' -ForegroundColor Red
    exit 1
}

# 서명이 실제로 들어갔는지 확인. keystore.properties 값이 틀리면 여기서 걸린다.
$verify = & "$env:JAVA_HOME\bin\jarsigner.exe" -verify $aab
if ($LASTEXITCODE -ne 0 -or ($verify -join ' ') -notmatch 'jar verified') {
    Write-Host ''
    Write-Host '[중단] 만들어진 파일에 서명이 없습니다.' -ForegroundColor Red
    Write-Host 'keystore.properties 의 비밀번호나 alias 가 틀렸을 가능성이 높습니다.' -ForegroundColor Red
    Write-Host 'Play Console 은 서명 없는 파일을 거부하므로 업로드하지 마세요.' -ForegroundColor Red
    exit 1
}

$gradleText = Get-Content (Join-Path $projectDir 'app\build.gradle') -Raw
$versionName = [regex]::Match($gradleText, 'versionName\s+"([^"]+)"').Groups[1].Value
$versionCode = [regex]::Match($gradleText, 'versionCode\s+(\d+)').Groups[1].Value

if (-not (Test-Path $releaseDir)) { New-Item -ItemType Directory -Path $releaseDir | Out-Null }
$dest = Join-Path $releaseDir "questdp-v$versionName-code$versionCode-signed.aab"
Copy-Item $aab $dest -Force

Write-Host ''
Write-Host '완료되었습니다. 서명까지 끝난 파일입니다.' -ForegroundColor Green
Write-Host ''
Write-Host "  $dest"
Write-Host ''
Write-Host '이 파일을 Play Console 에 업로드하세요.'
Write-Host ''
