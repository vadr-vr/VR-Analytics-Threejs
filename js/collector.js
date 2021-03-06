import vadrCore from 'vadr-core-vr';
/**
 * @module DataCollector
 * @description Platform specific implementation to calculate data
 */

let scene = null;
let threeCamera = null;
let longitudeZeroOffset = 0;

// paramters used during value calculations
let raycaster = new THREE.Raycaster();
raycaster.far = 300;
let cameraPosition = new THREE.Vector3();
let cameraDirection = new THREE.Vector3();
let intersectPoint = new THREE.Vector3();
let rotationQuaternion = new THREE.Quaternion();
let rotationEuler = new THREE.Euler(0, 0, 0, 'YZX');


function init(){

    longitudeZeroOffset = 0;

}
/**
 * Sets the new camera to collect data
 * @memberof VadrObjects
 * @param {object} newCamera three camera instance active currently
 */
const setCamera = (newCamera) => {

    threeCamera = newCamera;
    setDataCallbacks();

};

const setLongitudeZeroOffset = (newOffset) => {

    longitudeZeroOffset = newOffset;

}

const setScene = (newScene) => {

    scene = newScene;

}

const _getVectorString = (vector) => {

    return vector.x.toFixed(4) + ',' + vector.y.toFixed(4) + ',' + vector.z.toFixed(4);

};

const getPosition = () => {

    if (threeCamera == null){
        return null;
    }

    threeCamera.getWorldPosition(cameraPosition);
    return _getVectorString(cameraPosition);

};

const _getNormalizedLongitude = (longitude) => {

    while(longitude > 180){

        longitude -= 360;

    }

    while(longitude < -180){

        longitude += 360;

    }

    return longitude;

};

const _getNormalizedLatitude = (latitude) => {

    // under normal conditions latitude should remain between -180 to 180
    // therefore one correction is enough
    if (latitude < -90){

        latitude = -180 - latitude;

    }

    if (latitude > 90){

        latitude = 180 - latitude;

    }

    return latitude;

};

const _getShiftedLongitude = (longitude) => {

    // making movement from -z to +x as positive direction
    longitude *= -1;
    // shifting zero point from -z to +x, shifting zero point to offset provided
    longitude = longitude - 90 - longitudeZeroOffset;

    return _getNormalizedLongitude(longitude);

};

const getAngle = () => {

    if (threeCamera == null){
        return null;
    }

    threeCamera.getWorldQuaternion(rotationQuaternion);
    rotationEuler.setFromQuaternion(rotationQuaternion);
    rotationEuler.x = THREE.Math.radToDeg(rotationEuler.x);
    rotationEuler.y = THREE.Math.radToDeg(rotationEuler.y);
    rotationEuler.z = THREE.Math.radToDeg(rotationEuler.z);
    rotationEuler.y = _getShiftedLongitude(rotationEuler.y);
    rotationEuler.x = _getNormalizedLatitude(rotationEuler.x);
    return _getVectorString(rotationEuler);

};

const _getUsefulIntersect = (intersects) => {

    for (let i = 0; i < intersects.length; i++){

        if (!intersects[i].object.userData.ignoreVadRRaycast){

            return intersects[i];

        }

    }

};

const getGazePoint = () => {

    if (threeCamera == null){
        return null;
    }

    threeCamera.getWorldDirection(cameraDirection);
    threeCamera.getWorldPosition(cameraPosition);
    raycaster.set(cameraPosition, cameraDirection);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const usefulIntersect = _getUsefulIntersect(intersects);

    if (usefulIntersect){

        intersectPoint.set(usefulIntersect.point.x, usefulIntersect.point.y,
            usefulIntersect.point.z);

    } else{

        intersectPoint.set(cameraDirection.x, cameraDirection.y, cameraDirection.z);
        intersectPoint.multiplyScalar(raycaster.far);
        intersectPoint.add(cameraPosition);

    }

    return _getVectorString(intersectPoint);

};

/**
 * Registers the data calculator functions with vadrJsCore
 * @memberof DataCollector
 */
function setDataCallbacks(){

    vadrCore.dataCallbacks.setPositionCallback(getPosition);
    vadrCore.dataCallbacks.setGazeCallback(getGazePoint);
    vadrCore.dataCallbacks.setAngleCallback(getAngle);

}

function destroy(){

    threeCamera = null;
    scene = null;

}

export default {
    init,
    setCamera,
    setLongitudeZeroOffset,
    setScene,
    getGazePoint,
    getAngle,
    getPosition
}