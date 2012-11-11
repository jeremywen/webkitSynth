/*
  // Oscillator Types
  const unsigned short SINE = 0;
  const unsigned short SQUARE = 1;
  const unsigned short SAWTOOTH = 2;
  const unsigned short TRIANGLE = 3;
  const unsigned short CUSTOM = 4;

  // Filter types
  const unsigned short LOWPASS = 0;
  const unsigned short HIGHPASS = 1;
  const unsigned short BANDPASS = 2;
  const unsigned short LOWSHELF = 3;
  const unsigned short HIGHSHELF = 4;
  const unsigned short PEAKING = 5;
  const unsigned short NOTCH = 6;
  const unsigned short ALLPASS = 7;
*/

var $pitchBars = $("#pitchBars");
var $freqBars = $("#freqBars");
var $gain = $("#gain");
var $seqspeed = $("#seqspeed");
var $pitch = $("#pitch");
var $mpitch = $("#mpitch");
var $ampattack = $("#ampattack");
var $ampdecay = $("#ampdecay");
var $filterattack = $("#filterattack");
var $filterdecay = $("#filterdecay");
var $wave = $("#wave");
var $filterf = $("#filterf");
var $filterq = $("#filterq");
var $filtert = $("#filtert");
var $filterg = $("#filterg");
var $sequencerOff = $("#sequencerOff");
var $sequencerOn = $("#sequencerOn");
var $rndSeq = $("#rndSeq");
var runSeq = false;
var prevOsc;
var seqPos=1;
var seqSpeedInterval = 200;


///////////////////////////////////////////////////////////////////////////////////////////////
//audio setup
///////////////////////////////////////////////////////////////////////////////////////////////
var context = new webkitAudioContext();
var mainOsc = context.createOscillator();
var mainFilter = context.createBiquadFilter();
// mainOsc.connect(mainFilter);
var gainNode = context.createGainNode();
// mainFilter.connect(gainNode);
// gainNode.connect(context.destination);


///////////////////////////////////////////////////////////////////////////////////////////////
//util functions
///////////////////////////////////////////////////////////////////////////////////////////////
function midiToFreq(v){ return 440 * Math.pow(2,((v-69)/12)); }
function freqToMidi(v){ return Math.round(69 + 12*Math.log(v/440)/Math.log(2)); }
function constrain(amt,low,high) { return (amt < low) ? low : ((amt > high) ? high : amt); }

///////////////////////////////////////////////////////////////////////////////////////////////
//sequence bars
///////////////////////////////////////////////////////////////////////////////////////////////
$pitchBars.bars({
  fgColor:"skyBlue",
  bgColor:"#ffffff",
  displayInput:true,
  cols:8,
  width:240,
  height:180,
  min:-64, 
  max:64,
  "change" : function(){}
});


$freqBars.bars({
  fgColor:"skyBlue",
  bgColor:"#ffffff",
  displayInput:true,
  cols:8,
  width:240,
  height:180,
  min:-8000, 
  max:8000,
  "change" : function(){}
});


function randomizeSequencers(){
  $pitchBars.find("input").each(function (){
    $(this).val(Math.floor(Math.random()*128)-64);
  }).trigger("change");

  $freqBars.find("input").each(function (){
    $(this).val(Math.floor(Math.random()*16000)-8000);
  }).trigger("change");
}


///////////////////////////////////////////////////////////////////////////////////////////////
//knobs
///////////////////////////////////////////////////////////////////////////////////////////////
function setSeqSpeed(v) { 
  $seqspeed.val(seqSpeedInterval=v); 
  console.log(v); 
}
$seqspeed.knob({ bgColor:"white", min:0, max:500, cursor:false, angleOffset:-140, angleArc:280, "change" : setSeqSpeed });
setSeqSpeed(140); $seqspeed.trigger("change");


function setOscType(v) { 
  $wave.val(mainOsc.type = v); 
  console.log(v); 
}
$wave.knob({ bgColor:"white", min:0, max:3, cursor:true, angleOffset:-140, angleArc:280, "change" : setOscType });
setOscType(mainOsc.SAWTOOTH); $wave.trigger("change");


function setOscPitch(v) { 
  v = constrain(v,13000);
  $pitch.val(mainOsc.frequency.value = v); 
  var midiVal = freqToMidi(v);
  if($mpitch.val()!=midiVal){ 
    $mpitch.val(midiVal).trigger("change"); 
  } 
  console.log("osc pitch = "+v); 
}
$pitch.knob({ bgColor:"white", min:1, max:13000, angleOffset:-140, angleArc:280, "change" : setOscPitch });
setOscPitch(500); $pitch.trigger("change");


function setMPitch(v) { 
  v = constrain(v,1,127);
  $mpitch.val(v); 
  mainOsc.frequency.value = midiToFreq(v); 
  if($pitch.val()!=mainOsc.frequency.value){ 
    $pitch.val(mainOsc.frequency.value).trigger("change"); 
  } 
  console.log(v); 
}
$mpitch.knob({ bgColor:"white", min:1, max:127, angleOffset:-140, angleArc:280, "change" : setMPitch });
setMPitch(36); $mpitch.trigger("change");


function setFilterT(v) { 
  $filtert.val(mainFilter.type = v); 
  console.log(v); 
}
$filtert.knob({ bgColor:"white", min:0, max:7, cursor:true, angleOffset:-140, angleArc:280, "change" : setFilterT });
setFilterT(mainFilter.LOWPASS); $filtert.trigger("change");


function setFilterF(v) { 
  if(v>15000)return;
  $filterf.val(mainFilter.frequency.value = v); 
  console.log("filter f = "+v); 
}
$filterf.knob({ bgColor:"white", min:0, max:15000, angleOffset:-140, angleArc:280, "change" : setFilterF });
setFilterF(2000); $filterf.trigger("change");


function setFilterQ(v) { 
  $filterq.val(v); 
  mainFilter.Q.value = v/10; 
  console.log(v); 
}
$filterq.knob({ bgColor:"white", min:0, max:100, angleOffset:-140, angleArc:280, "change" : setFilterQ });
setFilterQ(0); $filterq.trigger("change");


function setFilterG(v) { 
  $filterg.val(mainFilter.gain.value = v); 
  console.log(v); 
}
$filterg.knob({ bgColor:"white", min:-100, max:100, angleOffset:-140, angleArc:280, "change" : setFilterG });
setFilterG(10); $filterg.trigger("change");


function setGain(v) { 
  $gain.val(v); 
  gainNode.gain.value = v/100; 
  console.log("gainNode.gain.value="+gainNode.gain.value);   
}
$gain.knob({ bgColor:"white", min:0, max:40, angleOffset:-140, angleArc:280, "change" : setGain });
setGain(20); $gain.trigger("change");


$ampattack.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : function(){} });
$ampattack.val(1).trigger("change");

$ampdecay.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : function(){} });
$ampdecay.val(5).trigger("change");

$filterattack.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : function(){} });
$filterattack.val(1).trigger("change");

$filterdecay.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : function(){} });
$filterdecay.val(5).trigger("change");


///////////////////////////////////////////////////////////////////////////////////////////////
//xy pads
///////////////////////////////////////////////////////////////////////////////////////////////
$("#filterfq").xy({
    displayInput:false, displayPrevious:false
  , min : -100, max : 100
  , width : 200, height : 170
  , fgColor:"skyblue", bgColor:"#EEEEEE"
  , change : function (value) {
      value.x = (value[0]+100)/200;
      value.y = (value[1]+100)/200;
      setFilterF(15000*value.x); $filterf.trigger("change");
      setFilterQ(100*value.y); $filterq.trigger("change");
      console.log("change : ", value);
  }
}).css({'border':'5px solid #FFF', 'margin':'15px'});

$("#filterfg").xy({
    displayInput:false, displayPrevious:false
  , min : -100, max : 100
  , width : 200, height : 170
  , fgColor:"skyblue", bgColor:"#EEEEEE"
  , change : function (value) {
      value.x = (value[0]+100)/200;
      value.y = (value[1]+100)/200;
      setFilterF(15000*value.x); $filterf.trigger("change");
      setFilterG(100*value.y-50); $filterg.trigger("change");
      console.log("change : ", value);
  }
}).css({'border':'5px solid #FFF', 'margin':'15px'});

$("#filterqg").xy({
    displayInput:false, displayPrevious:false
  , min : -100, max : 100
  , width : 200, height : 170
  , fgColor:"skyblue", bgColor:"#EEEEEE"
  , change : function (value) {
      value.x = (value[0]+100)/200;
      value.y = (value[1]+100)/200;
      setFilterQ(100*value.x); $filterq.trigger("change");
      setFilterG(100*value.y-50); $filterg.trigger("change");
      console.log("change : ", value);
  }
}).css({'border':'5px solid #FFF', 'margin':'15px'});



///////////////////////////////////////////////////////////////////////////////////////////////
//top buttons
///////////////////////////////////////////////////////////////////////////////////////////////
function triggerOnce(){
  var currTime = context.currentTime;
  prevOsc && prevOsc.noteOff(0);

  var oscillatorTrig = prevOsc = context.createOscillator();
  oscillatorTrig.type = mainOsc.type;
  oscillatorTrig.frequency.value = mainOsc.frequency.value;
  
  var filterTrig = context.createBiquadFilter();
  filterTrig.type = mainFilter.type;
  filterTrig.frequency.value = mainFilter.frequency.value;
  filterTrig.Q.value = mainFilter.Q.value;
  filterTrig.gain.value = mainFilter.gain.value;
  oscillatorTrig.connect(filterTrig);

  var gainNodeTrig = context.createGainNode();
  gainNodeTrig.gain.cancelScheduledValues( currTime );
  gainNodeTrig.gain.setValueAtTime(gainNode.gain.value, currTime);
  filterTrig.connect(gainNodeTrig);
  gainNodeTrig.connect(context.destination);

  var timeAtAttack = currTime + ($ampattack.val()/100);
  gainNodeTrig.gain.linearRampToValueAtTime(parseInt($gain.val(),10)/100, timeAtAttack);
  gainNodeTrig.gain.linearRampToValueAtTime(0, timeAtAttack + ($ampdecay.val()/100));
  
  timeAtAttack = currTime + ($filterattack.val()/100);
  filterTrig.frequency.linearRampToValueAtTime(parseInt($filterf.val(),10), timeAtAttack);
  filterTrig.frequency.linearRampToValueAtTime(0, timeAtAttack + ($filterdecay.val()/100));

  oscillatorTrig.noteOn(0);   
}

function runSequencers(){
  if(!runSeq){console.log("stop");return;}
  triggerOnce();

  var pSeqVal = (parseInt($("#p"+seqPos).attr("value"),10));
  var fSeqVal = (parseInt($("#f"+seqPos).attr("value"),10));

  mainOsc.frequency.value = midiToFreq(constrain(parseInt($mpitch.val(),10) + pSeqVal,1,127));
  mainFilter.frequency.value = parseInt($filterf.val(),10) + fSeqVal;
  
  seqPos==8?seqPos=1:seqPos++;
  setTimeout(runSequencers,seqSpeedInterval);
}

$sequencerOn.click(function(){
  $(this).parent().addClass("active");
  $sequencerOff.parent().removeClass("active");
  runSeq = true;
  runSequencers();
});

$sequencerOff.click(function(){
  $sequencerOn.parent().removeClass("active");
  $(this).parent().addClass("active");
  runSeq = false;
  mainOsc = context.createOscillator();
  setOscType($wave.val());
  setMPitch($mpitch.val());
});

randomizeSequencers();
$rndSeq.click(randomizeSequencers)
$sequencerOn.click();
