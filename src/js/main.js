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
});
//# sourceMappingURL=main.js.map