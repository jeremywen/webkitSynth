var osc = {
  0: "sine",
  1: "square",
  2: "sawtooth",
  3: "triangle",
  4: "custom"
 }
var filters = {
  0: "lowpass",
  1: "highpass",
  2: "bandpass",
  3: "lowshelf",
  4: "highshelf",
  5: "peaking",
  6: "notch",
  7: "allpass"
 }

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
var $pitchBar = $(".pitchBar")
var runSeq = false;
var prevOsc;
var seqPos = 0;
var seqSpeedInterval = 200;
var seqLength = 8;
var maxFilterFreq = 15000;
var maxMidiPitch = 127;

///////////////////////////////////////////////////////////////////////////////////////////////
//audio setup
///////////////////////////////////////////////////////////////////////////////////////////////
var context = new webkitAudioContext();
var mainOsc = context.createOscillator();
var mainFilter = context.createBiquadFilter();
var gainNode = context.createGain();


function runSequencers(){
  if(!runSeq){console.log("stop");return;}
  triggerOnce();

  var pSeqVal = parseInt($pitchBars.children().eq(seqPos).attr("value"), 10);
  var fSeqVal = parseInt($freqBars.children().eq(seqPos).attr("value"), 10);
  //console.log("seqPos=%o, pSeqVal=%o, fSeqVal=%o",seqPos,pSeqVal,fSeqVal);

  mainOsc.frequency.value = midiToFreq(constrain(parseInt($mpitch.val(),10) + pSeqVal,1,maxMidiPitch));
  mainFilter.frequency.value = constrain(parseInt($filterf.val(),10) + fSeqVal,0,maxFilterFreq);
  
  (seqPos == (seqLength-1)) ? seqPos=0 : seqPos++;
  setTimeout(runSequencers,seqSpeedInterval);
}


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

  var gainNodeTrig = context.createGain();
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


///////////////////////////////////////////////////////////////////////////////////////////////
// sequencer bars
///////////////////////////////////////////////////////////////////////////////////////////////
$pitchBars.bars({
  fgColor:"skyBlue",
  bgColor:"#ffffff",
  displayInput:true,
  cols:8,
  width:240,
  height:180,
  min:-(maxMidiPitch/2), 
  max:(maxMidiPitch/2),
  change:function(v){
    var barIdx = parseInt(Object.keys(v)[0],10);
    $pitchBars.children().eq(barIdx).attr("value", v[barIdx]);
  }
});


$freqBars.bars({
  fgColor:"skyBlue",
  bgColor:"#ffffff",
  displayInput:true,
  cols:8,
  width:240,
  height:180,
  min:-(maxFilterFreq/2), 
  max:(maxFilterFreq/2),
  change:function(v){
    var barIdx = parseInt(Object.keys(v)[0],10);
    $freqBars.children().eq(barIdx).attr("value", v[barIdx]);
  }
});


function randomizeSequencers(){
  $pitchBars.find("input").each(function (){
    $(this).val(Math.floor(Math.random()*maxMidiPitch)-(maxMidiPitch/2));
  }).trigger("change");

  $freqBars.find("input").each(function (){
    $(this).val(Math.floor(Math.random()*maxFilterFreq)-(maxFilterFreq/2));
  }).trigger("change");
}


///////////////////////////////////////////////////////////////////////////////////////////////
// knobs
///////////////////////////////////////////////////////////////////////////////////////////////
function setSeqSpeed(v) { 
  $seqspeed.val(seqSpeedInterval=v); 
  console.log(v); 
}
$seqspeed.knob({ bgColor:"white", min:0, max:500, cursor:false, angleOffset:-140, angleArc:280, "change" : setSeqSpeed });
setSeqSpeed(140); $seqspeed.trigger("change");


function setOscType(v) { 
  $wave.val(mainOsc.type = osc[v]); 
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
  v = constrain(v,1,maxMidiPitch);
  $mpitch.val(v); 
  mainOsc.frequency.value = midiToFreq(v); 
  if($pitch.val()!=mainOsc.frequency.value){ 
    $pitch.val(mainOsc.frequency.value).trigger("change"); 
  } 
  console.log(v); 
}
$mpitch.knob({ bgColor:"white", min:1, max:maxMidiPitch, angleOffset:-140, angleArc:280, "change" : setMPitch });
setMPitch(36); $mpitch.trigger("change");


function setFilterT(v) { 
  $filtert.val(mainFilter.type = filters[v]); 
  console.log(v); 
}
$filtert.knob({ bgColor:"white", min:0, max:7, cursor:true, angleOffset:-140, angleArc:280, "change" : setFilterT });
setFilterT(mainFilter.LOWPASS); $filtert.trigger("change");


function setFilterF(v) { 
  if(v>maxFilterFreq)return;
  $filterf.val(mainFilter.frequency.value = v); 
  console.log("filter f = "+v); 
}
$filterf.knob({ bgColor:"white", min:0, max:maxFilterFreq, angleOffset:-140, angleArc:280, "change" : setFilterF });
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
// xy pads
///////////////////////////////////////////////////////////////////////////////////////////////
$("#filterfq").xy({
    displayInput:false, displayPrevious:false
  , min : -100, max : 100
  , width : 200, height : 170
  , fgColor:"skyblue", bgColor:"#EEEEEE"
  , change : function (value) {
      value.x = (value[0]+100)/200;
      value.y = (value[1]+100)/200;
      setFilterF(maxFilterFreq*value.x); $filterf.trigger("change");
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
      setFilterF(maxFilterFreq*value.x); $filterf.trigger("change");
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
// top buttons
///////////////////////////////////////////////////////////////////////////////////////////////
$sequencerOn.click(function(){
  $(this).parent().addClass("active");
  $sequencerOff.parent().removeClass("active");
  runSeq = true;
  runSequencers();
  seqPos = 0;
});

$sequencerOff.click(function(){
  $sequencerOn.parent().removeClass("active");
  $(this).parent().addClass("active");
  runSeq = false;
  seqPos = 0;
});

$rndSeq.click(randomizeSequencers)


///////////////////////////////////////////////////////////////////////////////////////////////
// util functions
///////////////////////////////////////////////////////////////////////////////////////////////
function midiToFreq(v){ return 440 * Math.pow(2,((v-69)/12)); }
function freqToMidi(v){ return Math.round(69 + 12*Math.log(v/440)/Math.log(2)); }
function constrain(amt,low,high) { return (amt < low) ? low : ((amt > high) ? high : amt); }


///////////////////////////////////////////////////////////////////////////////////////////////
// init
///////////////////////////////////////////////////////////////////////////////////////////////
randomizeSequencers();
$sequencerOn.click();
