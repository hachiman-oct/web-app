// MP3 Speed Player main script

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
    const audioPlayer = document.getElementById('audioPlayer') as HTMLAudioElement | null;
    const speedControl = document.getElementById('speedControl') as HTMLSelectElement | null;

    if (!fileInput || !audioPlayer || !speedControl) return;

    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            audioPlayer.src = objectURL;
            audioPlayer.play();
        }
    });

    speedControl.addEventListener('change', function () {
        audioPlayer.playbackRate = parseFloat((this as HTMLSelectElement).value);
    });

    // --- Seek Buttons ---
    const seekConfig = [
        { id: 'rewind60', sec: -60 },
        { id: 'rewind30', sec: -30 },
        { id: 'rewind15', sec: -15 },
        { id: 'forward15', sec: 15 },
        { id: 'forward30', sec: 30 },
        { id: 'forward60', sec: 60 }
    ];
    seekConfig.forEach(cfg => {
        const btn = document.getElementById(cfg.id) as HTMLButtonElement | null;
        if (btn && audioPlayer) {
            btn.addEventListener('click', () => {
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime + cfg.sec);
            });
        }
    });
});