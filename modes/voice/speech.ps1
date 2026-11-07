param([ValidateSet('check', 'listen', 'speak')][string]$Operation)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
try {
    Add-Type -AssemblyName System.Speech
    $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
    if ($Operation -eq 'speak') {
        $speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
        try { $speaker.Speak([string]$payload.text) } finally { $speaker.Dispose() }
    } else {
        $installed = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers()
        $info = $installed | Select-Object -First 1
        if ($payload.language) {
            $info = $installed | Where-Object { $_.Culture.Name -eq $payload.language } | Select-Object -First 1
        }
        if (-not $info) { throw 'No matching Windows speech recognizer installed. Install a Windows speech language or set VOICE_LANGUAGE to an installed language.' }
        if ($Operation -eq 'check') { @{ language = $info.Culture.Name } | ConvertTo-Json -Compress; exit 0 }
        $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine($info)
        try {
            # Transcribe freely, then match menu options in TypeScript. Competing
            # menu and dictation grammars were discarding valid dictation results.
            $recognizer.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
            # Allow playback to finish ringing out before opening the microphone.
            Start-Sleep -Milliseconds 400
            $recognizer.SetInputToDefaultAudioDevice()
            $recognizer.BabbleTimeout = [TimeSpan]::FromSeconds(15)
            $recognizer.EndSilenceTimeout = [TimeSpan]::FromMilliseconds(1200)
            [Console]::Out.WriteLine('VOICE_READY')
            [Console]::Out.Flush()
            $result = $recognizer.Recognize([TimeSpan]::FromSeconds(15))
            if ($result) {
                @{ text = $result.Text; confidence = $result.Confidence; language = $info.Culture.Name } | ConvertTo-Json -Compress
            } else {
                @{ text = ''; confidence = 0; language = $info.Culture.Name } | ConvertTo-Json -Compress
            }
        } finally { $recognizer.Dispose() }
    }
} catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }
