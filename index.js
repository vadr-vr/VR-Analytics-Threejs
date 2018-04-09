import vadrCore from 'vadr-core-vr';
import dataCollector from './js/collector';

vadrCore.config.setSdk('Threejs');

let appDetails, camera, scene, appParams;

let isInit = false;
let isVadrcoreInit = false;
let lastTickUnix = 0;
let timeSinceInit = 0;
let timeDelta = 0;
let vadrDate = Date;
let appPaused = false;


if (!vadrDate.now){

    vadrDate.now = function(){

        return (new Date()).getTime();

    };

}
/**
 * @param {Object} newAppDetails app details 
 * @param {string} newAppDetails.appId app id provided by vadr 
 * @param {string} newAppDetails.appToken app token provided bby vadr
 * @param {string} newAppDetails.sceneId sceneId provided by vadr
 * @param {boolean} newAppDetails.testMode Should data be collected as test mode
 * @param {string} newAppDetails.version app version that you are collecting the data for
 * @param {Object} params init params like which events to collect, event collection frequency etc.
 * @param {Object} newCamera three.js camera object
 * @param {Object} newScene three.js scene object
 */
const init = (newAppDetails, params, newCamera, newScene) => {

    appDetails = newAppDetails;
    appParams = params;
    camera = newCamera;
    scene = newScene;

    isInit = true;
    isVadrcoreInit = false;
    appPaused = false;
    lastTickUnix = 0;
    timeSinceInit = 0;
    timeDelta = 0;
    
    appDetails.version = appDetails.version ? appDetails.version : '1.0.0';
    appDetails.testMode = !!appDetails.testMode;

    vadrCore.config.setApplication(appDetails.appId, appDetails.appToken, appDetails.version);
    vadrCore.config.setTestMode(appDetails.testMode);
    
    dataCollector.init();
    dataCollector.setScene(scene);
        
};

// sets things which are reset on calling vadrCore.init
// Thus this function needs to be called after vadrCore.init in the first tick function
const initOnTick = () => {

    vadrCore.initVadRAnalytics(appParams);
    dataCollector.setCamera(camera);

    if (appDetails.sceneId){

        vadrCore.scene.addScene(appDetails.sceneId);

    }else if(appDetails.sceneName){

        vadrCore.scene.addScene(null, appDetails.sceneName);

    }

    // react to change of visibility
    document.removeEventListener('visibilityChange', handeVisibilityChange);
    document.addEventListener('visibilitychange', handeVisibilityChange);

};

const enterVR = () => {

    vadrCore.playState.headsetApplied();

};

const exitVR = () => {

    vadrCore.playState.headsetRemoved();

};

const play = () => {

    if (appPaused){

        vadrCore.playState.appInFocus();
        appPaused = false;
        lastTickUnix = vadrDate.now();

    }

};

const pause = () => {

    appPaused = true;
    vadrCore.playState.appOutOfFocus();

};

const tick = () => {

    if(isInit){

        if (!isVadrcoreInit){

            isVadrcoreInit = true;
            lastTickUnix = vadrDate.now();
            initOnTick();
        
        }else{

            const timeDelta = vadrDate.now() - lastTickUnix;
            timeSinceInit += timeDelta;
            lastTickUnix += timeDelta;
        
            vadrCore.tick(timeSinceInit, timeDelta);

        }

    }

};

const destroy = () => {

    appDetails = null;
    camera = null;
    scene = null;
    isInit = false;
    isVadrcoreInit = false;
    lastTickUnix = 0;
    timeSinceInit = 0;
    timeDelta = 0;
    vadrCore.destroy();

};

const handeVisibilityChange = () => {

    if (document.visibilityState == 'visible'){
        
        play();

    }else{

        pause();

    }

}

export default {
    init: init,
    tick: tick,
    changeState: {
        play: play,
        pause: pause,
        enterVR: enterVR,
        exitVR: exitVR
    },
    destroy: destroy,
    setCamera: dataCollector.setCamera,
    setLongitudeZeroOffset: dataCollector.setLongitudeZeroOffset,
    user: vadrCore.user,
    setSessionInfo: vadrCore.setSessionInfo,
    setDataConfig: vadrCore.setDataConfig,
    media: vadrCore.media,
    scene: vadrCore.scene,
    registerEvent: vadrCore.registerEvent,
    playState: {
        appOutOfFocus: pause,
        appInFocus: play,
        headsetRemoved: vadrCore.playState.headsetRemoved,
        headsetApplied: vadrCore.playState.headsetApplied,
        pauseOnHeadsetRemove: vadrCore.playState.pauseOnHeadsetRemove,
        dontPauseOnHeadsetRemove: vadrCore.playState.dontPauseOnHeadsetRemove,
    },
    enums: vadrCore.enums,
    setLogLevel: vadrCore.setLogLevel
};