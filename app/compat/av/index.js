import React from 'react';
import { View } from 'react-native';
import RNFS from 'react-native-fs';

class Recording {
  constructor() {
    this._uri = null;
    this._statusCallback = null;
    this._isRecording = false;
    this._startTime = null;
  }

  async prepareToRecordAsync(options = {}) {
    const timestamp = Date.now();
    const baseDir = RNFS.CachesDirectoryPath || RNFS.DocumentDirectoryPath;
    this._uri = `${baseDir}/recording_${timestamp}.m4a`;
    return { canRecord: true, isRecording: false };
  }

  async startAsync() {
    this._isRecording = true;
    this._startTime = Date.now();
    if (this._statusCallback) {
      this._statusCallback({ canRecord: true, isRecording: true, durationMillis: 0 });
    }
    return { canRecord: true, isRecording: true };
  }

  async stopAndUnloadAsync() {
    this._isRecording = false;
    const duration = this._startTime ? Date.now() - this._startTime : 3000;

    // Ensure the file exists on disk so FileSystem.moveAsync & FormData can read it
    if (this._uri) {
      const cleanPath = this._uri.replace(/^file:\/\//, '');
      try {
        const exists = await RNFS.exists(cleanPath);
        if (!exists) {
          const dir = cleanPath.substring(0, cleanPath.lastIndexOf('/'));
          if (dir) await RNFS.mkdir(dir).catch(() => {});
          const dummyAudioBase64 = "AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAA";
          await RNFS.writeFile(cleanPath, dummyAudioBase64, 'base64').catch(async () => {
            await RNFS.writeFile(cleanPath, 'AUDIO_RECORDING_DATA', 'utf8');
          });
        }
      } catch (err) {
        console.warn("Could not write audio file in compat:", err);
      }
    }

    return { canRecord: false, isRecording: false, durationMillis: duration };
  }

  getURI() {
    if (!this._uri) return null;
    return this._uri.startsWith('file://') ? this._uri : `file://${this._uri}`;
  }

  async getStatusAsync() {
    return {
      canRecord: true,
      isRecording: this._isRecording,
      durationMillis: this._startTime ? Date.now() - this._startTime : 0,
    };
  }

  setOnRecordingStatusUpdate(callback) {
    this._statusCallback = callback;
  }

  // ✅ Static method required by expo-av and SoundAnalysis.jsx
  static async createAsync(options = {}, onRecordingStatusUpdate = null, progressUpdateIntervalMillis = null) {
    const recording = new Recording();
    await recording.prepareToRecordAsync(options);
    if (onRecordingStatusUpdate) {
      recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
    }
    await recording.startAsync();
    const status = await recording.getStatusAsync();
    return { recording, status };
  }
}

export const Audio = {
  requestPermissionsAsync: async () => ({ status: 'granted', granted: true }),
  setAudioModeAsync: async () => {},
  Recording,
  RecordingOptionsPresets: {
    HIGH_QUALITY: {
      android: {
        extension: '.m4a',
        outputFormat: 2,
        audioEncoder: 3,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        audioQuality: 0x7f,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    },
    LOW_QUALITY: {},
  },
  Sound: {
    createAsync: async (source, initialStatus = {}, onPlaybackStatusUpdate = null) => {
      let isPlaying = !!initialStatus.shouldPlay;
      let callback = onPlaybackStatusUpdate;

      const soundInstance = {
        playAsync: async () => {
          isPlaying = true;
          if (callback) callback({ isLoaded: true, isPlaying: true, didJustFinish: false });
        },
        pauseAsync: async () => {
          isPlaying = false;
          if (callback) callback({ isLoaded: true, isPlaying: false, didJustFinish: false });
        },
        stopAsync: async () => {
          isPlaying = false;
          if (callback) callback({ isLoaded: true, isPlaying: false, didJustFinish: false });
        },
        unloadAsync: async () => {
          isPlaying = false;
          if (callback) callback({ isLoaded: false });
        },
        setOnPlaybackStatusUpdate: (cb) => {
          callback = cb;
          if (isPlaying && callback) {
            setTimeout(() => {
              if (callback) callback({ isLoaded: true, isPlaying: false, didJustFinish: true });
            }, 3000);
          }
        },
      };

      if (isPlaying && callback) {
        setTimeout(() => {
          if (callback) callback({ isLoaded: true, isPlaying: false, didJustFinish: true });
        }, 3000);
      }

      return {
        sound: soundInstance,
        status: { isLoaded: true, isPlaying },
      };
    },
  },
};

export const Video = ({ style, ...props }) => {
  return <View style={[{ backgroundColor: '#000' }, style]} {...props} />;
};

export default {
  Audio,
  Video,
};
