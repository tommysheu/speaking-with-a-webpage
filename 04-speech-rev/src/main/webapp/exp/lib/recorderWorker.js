//JavaScript Audio Resampler (c) 2011 - Grant Galitz
function Resampler(fromSampleRate, toSampleRate, channels, outputBufferSize, noReturn) {

    this.fromSampleRate = fromSampleRate;
    this.toSampleRate = toSampleRate;
    this.channels = channels | 0;
    this.outputBufferSize = outputBufferSize;
    this.noReturn = !!noReturn;
    this.initialize();
}
Resampler.prototype.initialize = function () {
    //Perform some checks:

    if (this.fromSampleRate > 0 && this.toSampleRate > 0 && this.channels > 0) {
        if (this.fromSampleRate == this.toSampleRate) {
            //Setup a resampler bypass:
            this.resampler = this.bypassResampler;      //Resampler just returns what was passed through.
            this.ratioWeight = 1;
        }
        else {
            //Setup the interpolation resampler:
            this.compileInterpolationFunction();
            this.resampler = this.interpolate;          //Resampler is a custom quality interpolation algorithm.
            this.ratioWeight = this.fromSampleRate / this.toSampleRate;
            this.tailExists = false;
            this.lastWeight = 0;
            this.initializeBuffers();
        }
    }
    else {
        throw(new Error("Invalid settings specified for the resampler."));
    }
}

Resampler.prototype.compileInterpolationFunction = function () {
    var toCompile = "var bufferLength = Math.min(buffer.length, this.outputBufferSize);\
    buffer = filterloop(buffer, bufferLength);\
    if ((bufferLength % " + this.channels + ") == 0) {\
        if (bufferLength > 0) {\
            var ratioWeight = this.ratioWeight;\
            var weight = 0;";
    for (var channel = 0; channel < this.channels; ++channel) {
        toCompile += "var output" + channel + " = 0;"
    }

    toCompile += "var actualPosition = 0;\
            var amountToNext = 0;\
            var alreadyProcessedTail = !this.tailExists;\
            this.tailExists = false;\
            var outputBuffer = this.outputBuffer;\
            var outputOffset = 0;\
            var currentPosition = 0;\
            do {\
                if (alreadyProcessedTail) {\
                    weight = ratioWeight;";
    for (channel = 0; channel < this.channels; ++channel) {
        toCompile += "output" + channel + " = 0;"
    }
    toCompile += "}\
                else {\
                    weight = this.lastWeight;";
    for (channel = 0; channel < this.channels; ++channel) {
        toCompile += "output" + channel + " = this.lastOutput[" + channel + "];"
    }
    toCompile += "alreadyProcessedTail = true;\
                }\
                while (weight > 0 && actualPosition < bufferLength) {\
                    amountToNext = 1 + actualPosition - currentPosition;\
                    if (weight >= amountToNext) {";
    for (channel = 0; channel < this.channels; ++channel) {
        toCompile += "output" + channel + " += buffer[actualPosition++] * amountToNext;"
    }
    toCompile += "currentPosition = actualPosition;\
                        weight -= amountToNext;\
                    }\
                    else {";
    for (channel = 0; channel < this.channels; ++channel) {
        toCompile += "output" + channel + " += buffer[actualPosition" + ((channel > 0) ? (" + " + channel) : "") + "] * weight;"
    }
    toCompile += "currentPosition += weight;\
                        weight = 0;\
                        break;\
                    }\
                }\
                if (weight == 0) {";
    for (channel = 0; channel < this.channels; ++channel) {
        toCompile += "outputBuffer[outputOffset++] = output" + channel + " / ratioWeight;"
    }
    toCompile += "}\
                else {\
                    this.lastWeight = weight;";
    for (channel = 0; channel < this.channels; ++channel) {
        toCompile += "this.lastOutput[" + channel + "] = output" + channel + ";"
    }
    toCompile += "this.tailExists = true;\
                    break;\
                }\
            } while (actualPosition < bufferLength);\
            return this.bufferSlice(outputOffset);\
        }\
        else {\
            return (this.noReturn) ? 0 : [];\
        }\
    }\
    else {\
        throw(new Error(\"Buffer was of incorrect sample length.\"));\
    }";
    //console.log('toCompile', toCompile);
    this.interpolate = Function("buffer", toCompile);
}
Resampler.prototype.bypassResampler = function (buffer) {
    if (this.noReturn) {
        //Set the buffer passed as our own, as we don't need to resample it:
        this.outputBuffer = buffer;
        return buffer.length;
    }
    else {
        //Just return the buffer passsed:
        return buffer;
    }
}
Resampler.prototype.bufferSlice = function (sliceAmount) {
    if (this.noReturn) {
        //If we're going to access the properties directly from this object:
        return sliceAmount;
    }
    else {
        //Typed array and normal array buffer section referencing:
        try {
            return this.outputBuffer.subarray(0, sliceAmount);
        }
        catch (error) {
            try {
                //Regular array pass:
                this.outputBuffer.length = sliceAmount;
                return this.outputBuffer;
            }
            catch (error) {
                //Nightly Firefox 4 used to have the subarray function named as slice:
                return this.outputBuffer.slice(0, sliceAmount);
            }
        }
    }
}
Resampler.prototype.initializeBuffers = function (generateTailCache) {
    //Initialize the internal buffer:
    try {
        this.outputBuffer = new Float32Array(this.outputBufferSize);
        this.lastOutput = new Float32Array(this.channels);
    }
    catch (error) {
        this.outputBuffer = [];
        this.lastOutput = [];
    }
}

var recLength = 0,
  recBuffers = [],
  sampleRate,
  resampler;

// add by tommy 2017/10/20
var recLength2 = 0,
  recBuffers2 = [];

this.onmessage = function(e){

  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':

      record(e.data.buffer);
      break;
    case 'exportWAV':
      exportWAV(e.data.type);
      break;
    case 'exportRAW':
      exportRAW(e.data.type);
      break;
    case 'export16kMono':
      export16kMono(e.data.type);
      break;
    case 'getBuffer':
      getBuffer();
      break;
    case 'log' :
        getInfo();
        break;
    case 'clear':
      clear();
      break;
    case 'clear2':
      clear2();
      break;
  }
};

function getInfo(){
    //console.log(resampler);
}

function init(config){
  sampleRate = config.sampleRate;
  //resampler = new Resampler(sampleRate, 16000, 1, 50*1024);
  resampler = new Resampler(sampleRate, 16000, 1, 100*1024);
  g_bFirst = 1;
  //resampler = new Resampler(sampleRate, 8000, 1, 50*1024);

}

function record(inputBuffer){
  recBuffers.push(inputBuffer[0]);
  recLength += inputBuffer[0].length;
  //console.log('onaudioprocess - record - inputLength/recLength: ' + inputBuffer[0].length + '/' + recLength);
  // add by tommy 2017/10/20  
  recBuffers2.push(inputBuffer[0]);
  recLength2 += inputBuffer[0].length;
}

function exportWAV(type){
  // modify by tommy 2017/10/20  
  //var interleaved = mergeBuffers(recBuffers, recLength);
  var interleaved = mergeBuffers2(recBuffers2, recLength2);
  var dataview = encodeWAV(interleaved);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function exportRAW(type){
  var buffer = mergeBuffers(recBuffers, recLength);
  var dataview = encodeRAW(buffer);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function export16kMono(type){
  //console.log('setInterval - export16kMono - recLength: ' + recLength);
  var buffer = mergeBuffers(recBuffers, recLength);
  //console.log('setInterval - export16kMono - recLength: completed');
  var samples = resampler.resampler(buffer);
  var dataview = encodeRAW(samples);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

// FIXME: doesn't work yet
function exportSpeex(type){
  var buffer = mergeBuffers(recBuffers, recLength);
  var speexData = Speex.process(buffer);
  var audioBlob = new Blob([speexData], { type: type });
  this.postMessage(audioBlob);
}

function getBuffer() {
  var buffers = [];
  buffers.push( mergeBuffers(recBuffers, recLength) );
  this.postMessage(buffers);
}

function clear(){
  recLength = 0;
  recBuffers = [];
}

// add by tommy 2017/10/20
function clear2(){
  recLength2 = 0;
  recBuffers2 = [];
}

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  clear();
  return result;
}

// add by tommy 2017/10/20
function mergeBuffers2(recBuffers2, recLength2){
  var result = new Float32Array(recLength2);
  var offset = 0;
  for (var i = 0; i < recBuffers2.length; i++){
    result.set(recBuffers2[i], offset);
    offset += recBuffers2[i].length;
  }
  clear2();
  return result;
}

function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function mix(inputL, inputR){
  var length = inputL.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex] + inputR[inputIndex];
    inputIndex++;
  }
  return result;
}


function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  // modify by tommy 2017/10/23 for header compatible with Microsoft Edge browser
  //view.setUint32(4, 32 + samples.length * 2, true);
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  // modify by tommy 2017/10/20
  //view.setUint16(22, 2, true);
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  // modify by tommy 2017/10/20
  //view.setUint32(28, sampleRate * 4, true);
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  // modify by tommy 2017/10/20
  //view.setUint16(32, 4, true);
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}

function encodeRAW(samples){
  var buffer = new ArrayBuffer(samples.length * 2);
  var view = new DataView(buffer);
  floatTo16BitPCM(view, 0, samples);
  return view;
}

var NZEROS = 3;
var NPOLES = 3;
var GAIN   = 12.79093133;

var xv=[], yv=[];
for(var i=0; i<NZEROS+1; i++){
    xv.push(0.0);
}

for(var i=0; i<NPOLES+1; i++){
    yv.push(0.0);
}

var g_bFirst = 1;

function filterloop( psInput , num_length){
    var i;
    var psOutput = [];

    for(i=0; i<num_length; i++){
        psOutput.push(0);
    }

    if( g_bFirst ){
        for (i=0; i<NZEROS; i++)    xv[i+1] = 0;
        for (i=0; i<NPOLES; i++)    yv[i+1] = 0;
        g_bFirst = 0;
    }

    for (i=0; i<num_length; i++)
    {
        xv[0] = xv[1]; xv[1] = xv[2]; xv[2] = xv[3];
        xv[3] = psInput[i] / GAIN;
        yv[0] = yv[1]; yv[1] = yv[2]; yv[2] = yv[3];
        yv[3] =   (xv[0] + xv[3]) + 3 * (xv[1] + xv[2])
			+ (  0.0821407799 * yv[0]) + ( -0.5010175047 * yv[1])
			+ (  0.7934336046 * yv[2]);
        psOutput[i] = yv[3];
    }
    return psOutput;
}
