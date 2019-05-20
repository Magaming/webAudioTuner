// クロスブラウザ定義
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

let localMediaStream = null;
let localScriptProcessor = null;
let audioContext = new AudioContext();
const bufferSize = 1024;
let recordingFlg = false;

const frequencyElement = document.getElementById('frequency');
const scaleElement = document.getElementById('scale');
const statusElement = document.getElementById('status');

// 音声解析
let audioAnalyser = null;

// 録音バッファ作成（録音中自動で繰り返し呼び出される）
let onAudioProcess = (e) => {
    if (!recordingFlg) return;

    // 波形を解析
    analyseSound();
};

// 解析用処理
let analyseSound = () => {
    var fsDivN = audioContext.sampleRate / audioAnalyser.fftSize;
    var spectrums = new Float32Array(audioAnalyser.frequencyBinCount);
    audioAnalyser.getFloatFrequencyData(spectrums);

    // maxが0なので初期値を-Infinityとする
    let maxSpectrum = Number.NEGATIVE_INFINITY;
    let peakFrequency = fsDivN;

    spectrums.some((data,i) => {

        // frequency
        var f = i * fsDivN;

        // 1kHz以上は必要ないので抜ける
        if(f>1000){
            return true;
        }

        // 一番音量が大きい周波数帯を抽出
        if(maxSpectrum < data){
            maxSpectrum = data;
            peakFrequency = f;
        }
    })

    let smallestDiff = Math.abs(scales["A0"] - peakFrequency)
    let scale = "A0";

    // 一番近いスケール
    for(var key in scales){
        if(Math.abs((scales[key] - peakFrequency) < smallestDiff)){
            smallestDiff = Math.abs(scales[key] - peakFrequency);
            scale = key;
        };
    }

    // 小数点2位で四捨五入
    const viewFrequency = Math.round(peakFrequency * Math.pow(10,2) ) / Math.pow(10,2);
    frequencyElement.innerText = viewFrequency + "Hz";
    scaleElement.innerText = scale;

    // 周波数がスケールの指標より誤差±2%だったらOKと表示する
    const margin = 0.02;
    const lowerFrequency = scales[scale] * (1 - margin);
    const upperFrequency = scales[scale] * (1 + margin);

    if(peakFrequency >= lowerFrequency && peakFrequency <= upperFrequency){
        statusElement.innerText = "OK!"
    }else if(peakFrequency < lowerFrequency){
        statusElement.innerText = "低い"
    }else if(peakFrequency > upperFrequency){
        statusElement.innerText = "高い"
    }

}

// 解析開始
let startRecording = () => {
    recordingFlg = true;
    navigator.getUserMedia({audio: true}, function(stream) {
        
        // 録音関連
        localMediaStream = stream;
        var scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
        localScriptProcessor = scriptProcessor;
        var mediastreamsource = audioContext.createMediaStreamSource(stream);
        mediastreamsource.connect(scriptProcessor);
        scriptProcessor.onaudioprocess = onAudioProcess;
        scriptProcessor.connect(audioContext.destination);

        // 音声解析関連
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 32768;
        audioAnalyser.minDecibels = -80;
        
        mediastreamsource.connect(audioAnalyser);
    },
    function(e) {
        console.log(e);
    });
};

// 解析終了
let endRecording = () => {
    recordingFlg = false;
};

const scales = {
    'A0'	:	27.5	,
    'A#0'	:	29.135	,
    'B0'	:	30.868	,
    'C1'	:	32.703	,
    'C#1'	:	34.648	,
    'D1'	:	36.708	,
    'D#1'	:	38.891	,
    'E1'	:	41.203	,
    'F1'	:	43.654	,
    'F#1'	:	46.249	,
    'G1'	:	48.999	,
    'G#1'	:	51.913	,
    'A1'	:	55	    ,
    'A#1'	:	58.27	,
    'B1'	:	61.735	,
    'C2'	:	65.406	,
    'C#2'	:	69.296	,
    'D2'	:	73.416	,
    'D#2'	:	77.782	,
    'E2'	:	82.407	,
    'F2'	:	87.307	,
    'F#2'	:	92.499	,
    'G2'	:	97.999	,
    'G#2'	:	103.826	,
    'A2'	:	110	    ,
    'A#2'	:	116.541	,
    'B2'	:	123.471	,
    'C3'	:	130.813	,
    'C#3'	:	138.591	,
    'D3'	:	146.832	,
    'D#3'	:	155.563	,
    'E3'	:	164.814	,
    'F3'	:	174.614	,
    'F#3'	:	184.997	,
    'G3'	:	195.998	,
    'G#3'	:	207.652	,
    'A3'	:	220	,
    'A#3'	:	233.082	,
    'B3'	:	246.942	,
    'C4'	:	261.626	,
    'C#4'	:	277.183	,
    'D4'	:	293.665	,
    'D#4'	:	311.127	,
    'E4'	:	329.628	,
    'F'	    :	349.228	,
    'F#4'	:	369.994	,
    'G4'	:	391.995	,
    'G#4'	:	415.305	,
    'A4'	:	440	    ,
    'A#4'	:	466.164	,
    'B4'	:	493.883	,
    'C5'	:	523.251	,
    'C#5'	:	554.365	,
    'D5'	:	587.33	,
    'D#5'	:	622.254	,
    'E5'	:	659.255	,
    'F5'	:	698.456	,
    'F#5'	:	739.989	,
    'G5'	:	783.991	,
    'G#5'	:	830.609	,
    'A5'	:	880	    ,
    'A#5'	:	932.328	,
    'B5'	:	987.767	,
    'C6'	:	1046.502,
    'C#6'	:	1108.731,
    'D6'	:	1174.659,
    'D#6'	:	1244.508,
    'E6'	:	1318.51	,
    'F6'	:	1396.913,
    'F#6'	:	1479.978,
    'G6'	:	1567.982,
    'G#6'	:	1661.219,
    'A6'	:	1760	,
    'A#6'	:	1864.655,
    'B6'	:	1975.533,
    'C7'	:	2093.005,
    'C#7'	:	2217.461,
    'D7'	:	2349.318,
    'D#7'	:	2489.016,
    'E7'	:	2637.02	,
    'F7'	:	2793.826,
    'F#7'	:	2959.955,
    'G7'	:	3135.963,
    'G#7'	:	3322.438,
    'A7'	:	3520	,
    'A#7'	:	3729.31	,
    'B7'	:	3951.066,
    'C8'	:	4186.00	,
}