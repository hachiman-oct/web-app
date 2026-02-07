import { useState, useRef } from 'react'
import { Footer } from '../components/Footer'

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(e.target.value)
    setPlaybackSpeed(speed)
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }

  const seekForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 5
    }
  }

  const seekBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 5
    }
  }

  return (
    <div className="play-audio">
      <h2>🎵 MP3 Player</h2>

      <label htmlFor="audio-file">Choose an MP3 file:</label>
      <input
        type="file"
        id="audio-file"
        accept="audio/mp3,audio/mpeg"
        onChange={handleFileChange}
      />

      {audioFile && (
        <>
          <audio
            ref={audioRef}
            controls
            src={URL.createObjectURL(audioFile)}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                audioRef.current.playbackRate = playbackSpeed
              }
            }}
          >
            Your browser does not support the audio element.
          </audio>

          <div className="seek-buttons">
            <button onClick={seekBackward}>⏪ -5s</button>
            <button onClick={seekForward}>⏩ +5s</button>
          </div>

          <label htmlFor="playback-speed">Playback Speed:</label>
          <select
            id="playback-speed"
            value={playbackSpeed}
            onChange={handleSpeedChange}
          >
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x (Normal)</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2">2x</option>
          </select>
        </>
      )}

      <Footer />
    </div>
  )
}

export default App
