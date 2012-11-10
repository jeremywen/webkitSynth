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

$(function () {
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
  var $oscOn = $("#oscOn");
  var $oscOff = $("#oscOff");
  var $oscTrigger = $("#oscTrigger");
  var $oscRepeat = $("#oscRepeat");
  var runRepeat = false;
  var prevOsc;
  var seqPos=1;
  var seqSpeedInterval = 200;


  ///////////////////////////////////////////////////////////////////////////////////////////////
  //audio setup
  ///////////////////////////////////////////////////////////////////////////////////////////////
  var context = new webkitAudioContext();
  var mainOsc = context.createOscillator();
  var mainFilter = context.createBiquadFilter();
  mainOsc.connect(mainFilter);
  var gainNode = context.createGainNode();
  mainFilter.connect(gainNode);
  gainNode.connect(context.destination);


  ///////////////////////////////////////////////////////////////////////////////////////////////
  //util functions
  ///////////////////////////////////////////////////////////////////////////////////////////////
  function midiToFreq(v){ return 440 * Math.pow(2,((v-69)/12)); }
  function freqToMidi(v){ return Math.round(69 + 12*Math.log(v/440)/Math.log(2)); }


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
  $pitchBars.find("input").each(function (){
    $(this).val(Math.floor(Math.random()*128)-64);
  }).trigger("change");


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
  $freqBars.find("input").each(function (){
    $(this).val(Math.floor(Math.random()*16000)-8000);
  }).trigger("change");


  ///////////////////////////////////////////////////////////////////////////////////////////////
  //knobs
  ///////////////////////////////////////////////////////////////////////////////////////////////
  function setSeqSpeed(v) { 
    $seqspeed.val(seqSpeedInterval=v); 
    console.log(v); 
  }
  $seqspeed.knob({ bgColor:"white", min:0, max:500, cursor:false, angleOffset:-140, angleArc:280, "change" : setSeqSpeed });
  setSeqSpeed(200); $seqspeed.trigger("change");


  function setOscType(v) { 
    $wave.val(mainOsc.type = v); 
    console.log(v); 
  }
  $wave.knob({ bgColor:"white", min:0, max:3, cursor:true, angleOffset:-140, angleArc:280, "change" : setOscType });
  setOscType(mainOsc.SAWTOOTH); $wave.trigger("change");


  function setOscPitch(v) { 
    if(v>13000)return;
    $pitch.val(mainOsc.frequency.value = v); 
    var midiVal = freqToMidi(v);
    if($mpitch.val()!=midiVal){ 
      $mpitch.val(midiVal).trigger("change"); 
    } 
    console.log("osc pitch = "+v); 
  }
  $pitch.knob({ bgColor:"white", min:0, max:13000, angleOffset:-140, angleArc:280, "change" : setOscPitch });
  setOscPitch(500); $pitch.trigger("change");


  function setMPitch(v) { 
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
    console.log(v);   
  }
  $gain.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : setGain });
  setGain(20); $gain.trigger("change");


  $ampattack.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : function(){} });
  $ampdecay.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : function(){} });
  $ampdecay.val(5).trigger("change");
  $filterattack.knob({ bgColor:"white", min:0, max:50, angleOffset:-140, angleArc:280, "change" : function(){} });
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
    gainNodeTrig.gain.linearRampToValueAtTime(gainNode.gain.value, timeAtAttack);
    gainNodeTrig.gain.linearRampToValueAtTime(0, timeAtAttack + ($ampdecay.val()/100));
    
    timeAtAttack = currTime + ($filterattack.val()/100);
    filterTrig.gain.linearRampToValueAtTime(mainFilter.frequency.value, timeAtAttack);
    filterTrig.gain.linearRampToValueAtTime(0, timeAtAttack + ($filterdecay.val()/100));

    oscillatorTrig.noteOn(0);   
  }

  function triggerRepeat(){
    if(!runRepeat)return;
    triggerOnce();

    var pSeqVal = (parseInt($("#p"+seqPos).attr("value"),10));
    var fSeqVal = (parseInt($("#f"+seqPos).attr("value"),10));
    mainOsc.frequency.value =parseInt($pitch.val(),10) + pSeqVal;
    mainFilter.frequency.value = parseInt($filterf.val(),10) + fSeqVal;
    seqPos==8?seqPos=1:seqPos++;

    setTimeout(triggerRepeat,seqSpeedInterval);
  }

  $oscTrigger.click(function(){
    triggerOnce();
  });

  $oscRepeat.click(function(){
    runRepeat = true;
    triggerRepeat();
  });

  $oscOn.click(function(){
    mainOsc.noteOn(0);    
  });

  $oscOff.click(function(){
    runRepeat = false;
    mainOsc.noteOff(0);    
    mainOsc = context.createOscillator();
    setOscType($wave.val());
    setMPitch($mpitch.val());
    mainOsc.connect(mainFilter);
  });


});//end jquery ready


/*
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //files
  ///////////////////////////////////////////////////////////////////////////////////////////////
  var playAudioFile = function (buffer) {
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.noteOn(0); // Play sound immediately
  };

  var loadAudioFile = function (url) {
    var request = new XMLHttpRequest();
    request.open("get", url, true);
    request.responseType = "arraybuffer";
    request.onload = function () {
        context.decodeAudioData(request.response,
            function(incomingBuffer) {
                playAudioFile(incomingBuffer); // Not declared yet
             }
        );
    };
    request.send();
  };


///////////////////////////////////////////////////////////////////////////////////////////////
//Snippet - Modulating AudioParams with other nodes
///////////////////////////////////////////////////////////////////////////////////////////////
var saw = context.createOscillator(),
      sine = context.createOscillator(),
      sineGain = context.createGainNode();

//set up our oscillator types
saw.type = saw.SAWTOOTH;
sine.type = sine.SINE;

//set the amplitude of the modulation
sineGain.gain.value = 10;

//connect the dots
sine.connect(sineGain);
sineGain.connect(saw.frequency);
*/