import vadrCore from 'vadr-core-vr';
import dataCollector from './js/collector';

vadrCore.config.setSdk('Threejs');

let lastTickUnix = 0;
let timeSinceInit = 0;
let timeDelta = 0;
let vadrDate = Date;

if (!vadrDate.now){

    vadrDate.now = function(){

        return (new Date()).getTime();

    };

}
appId, appToken, sceneId, testMode = false, version = '1.0.0'
/**
 * 
 * @param {Object} appDetails app details 
 * @param {string} appDetails.appId app id provided by vadr 
 * @param {string} appDetails.appToken app token provided bby vadr
 * @param {string} appDetails.sceneId sceneId provided by vadr
 * @param {boolean} appDetails.testMode Should data be collected as test mode
 * @param {string} appDetails.version app version that you are collecting the data for
 * @param {Object} camera three.js camera object
 * @param {Object} scene three.js scene object
 */
const init = (appDetails, camera, scene) => {

    appDetails.version = appDetails.version ? appDetails.version : '1.0.0';
    appDetails.testMode = !!appDetails.testMode;

    vadrCore.config.setApplication(appDetails.appId, appDetails.appToken, appDetails.version);
    vadrCore.config.setTestMode(appDetails.testMode);
    
    dataCollector.setScene(scene);

    vadrCore.setDataConfig.performance(true, 1000);
    vadrCore.setDataConfig.orientation(true, 300);
    vadrCore.setDataConfig.gaze(true, 300);

    scene.addEventListener('camera-set-active', (event) => {
        
        dataCollector.setCamera(event.detail.cameraEl);
        
    });

    scene.addEventListener('enter-vr', () => {

        enterVR();

    });
    scene.addEventListener('exit-vr', () => {

        exitVR();

    });
        
    lastTickUnix = vadrDate.now();
    vadrCore.initVadRAnalytics();
    vadrCore.scene.addScene(appDetails.sceneId);

};

const enterVR = () => {

    vadrCore.playState.headsetApplied();

};

const exitVR = () => {

    vadrCore.playState.headsetRemoved();

};

const play = () => {

    vadrCore.playState.appInFocus();

};

const pause = () => {

    vadrCore.playState.appOutOfFocus();

};

const tick = () => {

    const timeDelta = vadrDate.now() - lastTickUnix;
    timeSinceInit += timeDelta;
    lastTickUnix += timeDelta;

    console.log('haha', timeSinceInit, timeDelta);
    vadrCore.tick(timeSinceInit, timeDelta);

};

const remove = () => {

    vadrCore.destroy();

};

export default {
    setCamera: dataCollector.setCamera,
    user: vadrCore.user,
    setSessionInfo: vadrCore.setSessionInfo,
    setDataConfig: vadrCore.setDataConfig,
    media: vadrCore.media,
    scene: vadrCore.scene,
    registerEvent: vadrCore.registerEvent,
    playState: vadrCore.playState,
    setLogLevel: vadrCore.setLogLevel
};