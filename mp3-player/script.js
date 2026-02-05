"use strict";
// MP3 Speed Player main script
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const audioPlayer = document.getElementById('audioPlayer');
    const speedControl = document.getElementById('speedControl');
    if (!fileInput || !audioPlayer || !speedControl)
        return;
    fileInput.addEventListener('change', () => {
        var _a;
        const file = (_a = fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            audioPlayer.src = objectURL;
            audioPlayer.play();
        }
    });
    speedControl.addEventListener('change', function () {
        audioPlayer.playbackRate = parseFloat(this.value);
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
        const btn = document.getElementById(cfg.id);
        if (btn && audioPlayer) {
            btn.addEventListener('click', () => {
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime + cfg.sec);
            });
        }
    });
});
//# sourceMappingURL=main.js.map