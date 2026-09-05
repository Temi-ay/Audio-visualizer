const music = document.getElementById("Music");
const startBtn = document.getElementById("playButton");
const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");



fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  music.src = URL.createObjectURL(file);
  music.load();
  console.log("File Loaded", file.name)
});

let audioCtx = null;
let analyser = null;
let dataArray = null;
let bufferLength = 0;


startBtn.addEventListener("click", async () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(music);
    analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength)
    startVisualizer();
  }

  if(audioCtx.state === "suspended") await audioCtx.resume();

  if (music.paused) {
    music.play();
    startBtn.textContent = "Pause";
  } else {
    music.pause();
    startBtn.textContent = "Play";
  }
});

function startVisualizer(){
  function update(){
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const y = canvas.height - barHeight;
      ctx.fillStyle = `hsl(${barHeight + 180}, 100%, 50%)`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      x += barWidth;
    }

    requestAnimationFrame(update);
  }
  update();
}