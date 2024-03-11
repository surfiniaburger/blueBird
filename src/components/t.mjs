import axios from "axios"
const options = {
  method: "POST",
  url: "https://api.edenai.run/v2/audio/text_to_speech",
  headers: {
    authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmU5ZmY2MTYtNGRkMy00N2M5LThhZjUtYjYyNzRlNzdkODg3IiwidHlwZSI6ImFwaV90b2tlbiJ9.fRV-cr9LCiqtfU3dc2H8fQnW_FrU0Immouwreg-Ned8",
  },
  data: {
    providers: "amazon",
    language: "en",
    text: "Happy",
    option: "FEMALE",
    fallback_providers: "",
  },
};

axios
  .request(options)
  .then((response) => {
    const audioUrl = response.data.amazon.audio_resource_url  || null;
    console.log(audioUrl);
  })
  .catch((error) => {
    console.error(error);
  });