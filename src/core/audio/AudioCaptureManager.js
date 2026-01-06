/**
 * AudioCaptureManager - Unified Audio Capture Abstraction
 * 
 * EXPERIMENTAL BRANCH: This version is simplified for ScreenCaptureKit integration.
 * 
 * macOS audio capture is now handled via Chromium's ScreenCaptureKit integration
 * in the renderer process (getDisplayMedia with audio:true).
 * 
 * This manager now only provides:
 * - Consistent event interface
 * - Buffer handling for audio chunks
 * - Stub functions for backward compatibility
 * 
 * Previous audiotee (Core Audio Taps) code has been removed.
 */

const EventEmitter = require('events');

// Audio configuration constants
const CONFIG = {
    SAMPLE_RATE: 24000,
    CHANNELS_MONO: 1,
    CHANNELS_STEREO: 2,
    BYTES_PER_SAMPLE: 2,
    CHUNK_DURATION: 0.1, // seconds
    MAX_QUEUE_SIZE: 50, // ~5 seconds of buffered chunks
    MAX_BUFFER_SECONDS: 1, // Maximum buffer accumulation before trim
};

// Calculate derived values
CONFIG.CHUNK_SIZE_MONO = CONFIG.SAMPLE_RATE * CONFIG.BYTES_PER_SAMPLE * CONFIG.CHANNELS_MONO * CONFIG.CHUNK_DURATION;
CONFIG.CHUNK_SIZE_STEREO = CONFIG.SAMPLE_RATE * CONFIG.BYTES_PER_SAMPLE * CONFIG.CHANNELS_STEREO * CONFIG.CHUNK_DURATION;
CONFIG.MAX_BUFFER_SIZE = CONFIG.SAMPLE_RATE * CONFIG.BYTES_PER_SAMPLE * CONFIG.MAX_BUFFER_SECONDS;

/**
 * AudioCaptureManager class (Simplified for ScreenCaptureKit)
 * 
 * Events:
 * - 'audio': Emitted with { buffer, timestamp } for each audio chunk
 * - 'error': Emitted on capture errors
 * - 'stopped': Emitted when capture stops
 */
class AudioCaptureManager extends EventEmitter {
    constructor() {
        super();
        this.isCapturing = false;
        this.audioQueue = [];

        console.log('[AudioCaptureManager] Initialized (ScreenCaptureKit mode - audio handled in renderer)');
    }

    /**
     * Start audio capture on macOS
     * 
     * EXPERIMENTAL: This is now a no-op. Audio capture is handled in the renderer
     * via Chromium's ScreenCaptureKit integration (getDisplayMedia with audio:true).
     * 
     * @returns {Promise<{success: boolean}>}
     */
    async startMacOS() {
        if (process.platform !== 'darwin') {
            console.log('[AudioCaptureManager] Not macOS, skipping');
            return { success: true };
        }

        console.log('[AudioCaptureManager] macOS audio capture now handled via ScreenCaptureKit in renderer');
        this.isCapturing = true;
        return { success: true };
    }

    /**
     * Start capture (unified interface)
     * 
     * For macOS: Returns success immediately (audio handled in renderer)
     * For other platforms: Audio is handled in renderer via getDisplayMedia
     */
    async start() {
        if (this.isCapturing) {
            console.warn('[AudioCaptureManager] Already capturing, ignoring start request');
            return { success: true };
        }

        if (process.platform === 'darwin') {
            return this.startMacOS();
        }

        // For non-macOS, audio is handled entirely in renderer
        console.log('[AudioCaptureManager] Audio capture handled in renderer');
        this.isCapturing = true;
        return { success: true };
    }

    /**
     * Stop audio capture
     */
    stop() {
        if (!this.isCapturing) {
            return;
        }

        console.log('[AudioCaptureManager] Stopping audio capture...');

        // Clear queue
        this.audioQueue = [];
        this.isCapturing = false;

        this.emit('stopped');
        console.log('[AudioCaptureManager] Capture stopped');
    }

    /**
     * Check if currently capturing
     */
    get capturing() {
        return this.isCapturing;
    }

    /**
     * Get current queue size
     */
    get queueSize() {
        return this.audioQueue.length;
    }
}

// Singleton instance
const audioCaptureManager = new AudioCaptureManager();

module.exports = {
    AudioCaptureManager,
    audioCaptureManager,
    CONFIG
};
