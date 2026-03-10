// ============================================================================
// TRADERX FINBERT WEB WORKER — Off-thread ML Inference
// ============================================================================
// Runs sentiment analysis in a dedicated worker thread so it doesn't
// freeze the main UI thread. Loads Transformers.js and the model once,
// then processes inference requests via postMessage.
// ============================================================================

let classifier = null;
let isReady = false;

async function loadModel() {
    try {
        // Import Transformers.js from CDN (bundled as web_accessible_resource)
        importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');

        // Access the Transformers module
        const { pipeline, env } = self.TransformersApi || self;

        // Configure for extension environment
        if (env) {
            env.allowLocalModels = false;
            env.useBrowserCache = true;
        }

        console.log('[FinBERT Worker] Loading model...');

        // Load the sentiment analysis model
        classifier = await pipeline(
            'sentiment-analysis',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
            { quantized: true }
        );

        isReady = true;
        console.log('[FinBERT Worker] Model loaded successfully!');

        // Notify main thread
        self.postMessage({ type: 'ready' });
    } catch (error) {
        console.error('[FinBERT Worker] Failed to load model:', error);
        self.postMessage({ type: 'error', error: error.message });
    }
}

// Handle inference requests
self.onmessage = async function (e) {
    const { id, text } = e.data;

    if (!isReady || !classifier) {
        self.postMessage({ id, error: 'Model not loaded' });
        return;
    }

    try {
        const result = await classifier(text.substring(0, 512));

        const label = result[0].label.toLowerCase();
        const score = result[0].score;

        let sentimentScore;
        if (label.includes('positive')) sentimentScore = score;
        else if (label.includes('negative')) sentimentScore = -score;
        else sentimentScore = 0;

        self.postMessage({ id, result: sentimentScore });
    } catch (error) {
        self.postMessage({ id, error: error.message });
    }
};

// Auto-load on worker creation
loadModel();
