// edenAiService.ts
import axios from 'axios';

interface EmotionResponse {
  [key: string]: number | null;
}

const apiKey = process.env.EDEN_AI_API_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmU5ZmY2MTYtNGRkMy00N2M5LThhZjUtYjYyNzRlNzdkODg3IiwidHlwZSI6ImFwaV90b2tlbiJ9.fRV-cr9LCiqtfU3dc2H8fQnW_FrU0Immouwreg-Ned8";

export async function analyzeEmotions(mediaValue: string) {
  try {
    const response = await axios.post('https://api.edenai.run/v2/image/face_detection', {
      providers: 'amazon',
      file_url: mediaValue,
      fallback_providers: '',
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const edenaiEmotion: EmotionResponse = response.data['eden-ai'].items[0].emotions;

    let highestIntensity = -1;
    let highestEmotionName: string | null = null;

    for (const [emotion, intensity] of Object.entries(edenaiEmotion)) {
      if (intensity !== null && intensity > highestIntensity) {
        highestEmotionName = emotion;
        highestIntensity = intensity;
      }
    }

    return highestEmotionName;
  } catch (error) {
    console.error("Error analyzing emotions:", error);
    return null;
  }
}


// handle text to audio
export const generateAudio = async (text: string) => {
  try {
    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/audio/text_to_speech",
      headers: {
        authorization: `Bearer ${apiKey}`,
      },
      data: {
        providers: "amazon",
        language: "en",
        text: text,
        option: "MALE",
        fallback_providers: "",
      },
    };

    const response = await axios.request(options);
    const audioUrl = response.data.amazon.audio_resource_url || null;

    return audioUrl
  } catch (error) {
    console.error('Failed to generate audio:', error);
  }
};