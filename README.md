# Minter
<img src="https://i.imgur.com/QDJPsAA.png" alt="cover_image" width="0" />
This is a simple minter example built on top of Next.js 14

[![Demo](https://img.shields.io/badge/Demo-Visit%20Demo-brightgreen)](https://minter.mintbase.xyz/)
[![Deploy](https://img.shields.io/badge/Deploy-on%20Vercel-blue)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMintbase%2Ftemplates%2Ftree%2Fmain%2Fminter)

**Tooling:**

[![Use Case](https://img.shields.io/badge/Use%20Case-Minter-blue)](#)
[![Tools](https://img.shields.io/badge/Tools-@mintbase.js/sdk%2C@mintbase.js/react%2C@mintbase.js/storage%2CArweave%2CMintbase%20Wallet-blue)](#)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2014-blue)](#)

**Author:**

[![Author](https://img.shields.io/twitter/follow/mintbase?style=social&logo=twitter)](https://twitter.com/mintbase) [![Organization](https://img.shields.io/badge/Mintbase-blue)](https://www.mintbase.xyz)

## Project Walkthrough

Quetzal is a dynamic application that allows users to capture selfies in real-time and detect the emotions portrayed in the images using computer vision powered by Eden API. 
The detected emotion serves as a prompt for ChatGPT to generate a haiku, which encapsulates the essence of the emotion with a touch of hope for something more. The generated title-emotion,
along with the selfie and haiku description, can then be effortlessly converted into an NFT (Non-Fungible Token) with just a click of a button.

### Setup


In the `minter/src/config/setup.ts` file, we define several key configurations for interacting with the Mintbase platform. This setup is crucial for ensuring that our application communicates correctly with Mintbase smart contracts.

## ENV Variables
⚠️ Beta: We are still working on a solution to issue Mintbase API keys for using the Mintbase AI Router.

Checkout `.env.example` and create a local env file (`.env.local`) with:

```
MB_API_KEY=
```

Get your Eden AI API Key from (https://www.edenai.co/blog?categories=Use+case)

```
EDEN_AI_API_KEY=
```
If you have issues with the API env, please enter the key directly to the edenAiService.ts, for example `"Bearer XXXXXXXXXXXXX"`. ⚠️ This is not recommended for a production environment, please do so at your discretion.

- `proxyAddress`: This is the address of the proxy contract on Mintbase. It is either taken from the environment variable `NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS` or defaults to `"0.minsta.proxy.mintbase.testnet"` if the environment variable is not set.

- `contractAddress`: The address of the minting contract. Similar to `proxyAddress`, it is sourced from `NEXT_PUBLIC_MINT_CONTRACT_ADDRESS` or defaults to `"test122212.mintspace2.testnet"`.

- `network`: Indicates the blockchain network we are interacting with. It defaults to `"testnet"` if `NEXT_PUBLIC_NETWORK` is not specified in the environment.

- `callbackUrl`: A URL used for callbacks, constructed dynamically based on the `network` variable. If we are on the testnet, it uses the testnet URL; otherwise, it defaults to the mainnet URL.


To customize these configurations for different environments, you can set the following environment variables in your `.env` file:

`NOTE: the env variables need to have the NEXT_PUBLIC_ on the variable name due to be available for the browser to process`

- `NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS`: Your proxy contract address on Mintbase.
- `NEXT_PUBLIC_MINT_CONTRACT_ADDRESS`: Your mint contract address on Mintbase.
- `NEXT_PUBLIC_NETWORK`: The network you want to interact with (`"testnet"` or `"mainnet"`).





after that you can run
```
pnpm install
```
and

```
pnpm run dev
```
Then, open http://localhost:3000 with your browser to see the result.

## Code Examples

### Chat Component

The main chat component is located in `/src/components/Vision.tsx`. It uses the `useChat` hook from the Vercel `ai` package to manage the chat state. Messages are sent to the server using the append function:

```ts
const { append, messages, isLoading } = useChat({
  api: "/api/chat-completion",
})

const sendMessage = (message: string) => {
  append({ role: "user", content: message })
}
```

### API Route

The API route for chat completion is defined in `/src/app/api/chat-completion/route.ts`. It sends a `POST` request to the Mintbase API with the chat messages:

```ts
export async function POST(req: Request) {
  const body = await req.json()
  const { messages } = body

  const response = await fetch(
    "https://mintbase-wallet-git-ai-relayer-credits-mintbase.vercel.app/api/ai/v1/router/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MB_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4-1106-preview",
        messages: messages,
      }),
    }
  )

  return new StreamingTextResponse(response.body!)
```

The API route for face detection is defined in `/src/app/api/emotion/edenAiService.ts`. It sends a `POST` request to the Eden API with the image Url:

```ts
export async function analyzeEmotions(mediaValue: string) {
  try {
    const response = await axios.post('https://api.edenai.run/v2/image/face_detection', {
      providers: 'amazon',
      file_url: mediaValue,
      fallback_providers: '',
    }, {
      headers: {
        Authorization: `Bearer ${process.env.EDEN_AI_API_KEY}`,
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
```

## Get in touch

- Support: [Join the Telegram](https://tg.me/mintdev)
- Twitter: [@mintbase](https://twitter.com/mintbase)

<img src="https://i.imgur.com/SBiSEAB.png" alt="detail_image" width="0" />