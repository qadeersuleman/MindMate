export const FaceDetectorMode = {
  fast: 1,
  accurate: 2,
};

export const FaceDetectorLandmarks = {
  none: 1,
  all: 2,
};

export const FaceDetectorClassifications = {
  none: 1,
  all: 2,
};

export const detectFacesAsync = async () => ({
  faces: [],
});

export default {
  FaceDetectorMode,
  FaceDetectorLandmarks,
  FaceDetectorClassifications,
  detectFacesAsync,
};

