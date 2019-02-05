/*
 * An macro to auto mute and resume Sonos music upon an incoming call or disconnect
 * revision 0.1
 *
 * Jim Musial
 * 01-22-2019
 * jmusial@cisco.com
 * 
 * This macro is part of a three file package distribution
 * 1 - "SonosCE" is the macro to enable auto mute/resume on call connect/disconnect
 * 2 - "SonosInRoomControl" provides the execution for the "Background Music" in room panel.
 * 3 - "Background Music" is that room control panel
 * All are included in the packaged distribution
 *
 */
 
const xapi = require('xapi');
//This is the key that IFTTT provides for webhook applets
//This is specific to each user and may be revoked at ant time
//If revoked, this key will need to be updated
const authForIFTTT = "XXXXXXXXXXXXXXXXXXXXX";
//This event_key is the name of your webhook for the pause function
const pauseIFTTT = "SonosCE_pause";
//This event_key is the name of your webhook for the resume function
const resumeIFTTT = "SonosCE_resume";

//Function to execute the actual Sonos IFTTT trigger
function sonosChange(url) {
  xapi.command('HttpClient Post', { 
    AllowInsecureHTTPS: 'True',
    Header: 'Content-Type: text/plain', 
    Url: url
  },'.')
  .then((result) => {
    console.log("success:" + result.StatusCode);
  })
  .catch((err) => {
    console.log("failed: " + err.me);
  })
};

//Print a screen message to allow a chance for the cloud API to execute
function displayInput(event) {
  xapi.command('UserInterface Message TextLine Display', { 
    Text: event + " was pressed.  Please wait up to 10 seconds",
    Duration: 7,
  });
};


//Function to listen to the GUI to check for button presses and execute the function above
function listenToGui() {
  xapi.event.on('UserInterface Extensions Widget Action', (event) => {
    if (event.Type === 'clicked') {
      console.log(event.WidgetId)
      var url = 'https://maker.ifttt.com/trigger/SonosCE_' + event.WidgetId + '/with/key/' + authForIFTTT
      //console.log(url);
      sonosChange(url);
      var event = event.WidgetId
      displayInput(event);
    }
  });
}

function pause(){
  xapi.command('HttpClient Post', { 
    AllowInsecureHTTPS: 'True',
    Header: 'Content-Type: text/plain', 
    Url: 'https://maker.ifttt.com/trigger/' + pauseIFTTT + '/with/key/' + authForIFTTT
  },'.')
  .then((result) => {
    console.log("success:" + result.StatusCode);
  })
  .catch((err) => {
    console.log("failed: " + err.message);
  });
}; 

function resume(){
  xapi.command('HttpClient Post', { 
    AllowInsecureHTTPS: 'True',
    Header: 'Content-Type: text/plain', 
    Url: 'https://maker.ifttt.com/trigger/' + resumeIFTTT + '/with/key/' + authForIFTTT
  },'.')
  .then((result) => {
    console.log("success:" + result.StatusCode);
  })
  .catch((err) => {
    console.log("failed: " + err.message);
  });
}; 

  xapi.event.on('IncomingCallIndication', (status) => {
    console.log("Incoming call fired");
    pause();
  });
  
  xapi.event.on('OutgoingCallIndication', (status) => {
    console.log("Outgoing call fired");
    pause();
  });
  
  xapi.event.on('CallDisconnect', (status) => {
    console.log("Call disconnect fired");
    resume();
  });
  
  listenToGui();