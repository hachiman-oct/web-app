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
});