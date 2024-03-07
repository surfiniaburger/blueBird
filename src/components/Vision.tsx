/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react';

import Webcam from 'react-webcam';
import { uploadReference } from '@mintbase-js/storage'; // Import the uploadReference function
import { useChat } from "ai/react";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./ui/card";
import Image from 'next/image'
import { analyzeEmotions } from '@/app/api/emotion/edenAiService';
import useMintImage from '@/hooks/useMint';

const Haiku = ({ lines }: { lines: string[] }) => (
  <pre className="whitespace-pre-wrap">
    {lines.map((line, index) => (
      <code key={index}>{line}</code>
    ))}
  </pre>
);

export default function Vision() {
  const [highestEmotion, setHighestEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [description, setDescription] = useState('');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false); // New state for webcam status


  const webcamRef = React.useRef<Webcam>(null);
  const { onSubmit } = useMintImage();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { append, messages, isLoading } = useChat({
    api: "/api/chat-completion",
  });


  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // Check if the last message is from the chat system
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setDescription(lastMessage.content); // Update description based on chat response
        setLoading(false);
      }
    }
  }, [messages, isLoading]);

  const toggleWebcam = () => {
    setWebcamEnabled(prevState => !prevState); // Toggle webcam status
  };

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      processImage(imageSrc);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamRef]);

  const processImage = async (imageSrc: string) => {
    setLoading(true);

    try {
      // Convert imageSrc to a Blob
    const blob = await fetch(imageSrc).then(res => res.blob());

    // Create a File object from the Blob
    const file = new File([blob], 'uploaded_image.jpg', { type: 'image/jpeg' });

      // Upload the image to Arweave
      const metadata = {
        title: "Uploaded Image",
        media: file
      };
      const uploadResult = await uploadReference(metadata);

      // Get the URL of the uploaded image
      const imageUrl = "https://arweave.net/" + uploadResult.id;


      // Fetch the media value from the initial URL
      const mediaValue = await extractMediaValue(imageUrl);

      if (mediaValue) {
        setCapturedImage(mediaValue); // Update captured image URL
      // Call Eden AI service with the uploaded image URL
      const highestEmotionName = await analyzeEmotions(mediaValue);



      if (highestEmotionName !== null) {
        setHighestEmotion(highestEmotionName);
        append({ role: "user", content: "Craft a haiku of '" + highestEmotionName + "'—brief, yet full of warmth and light, life's simple delights."});

      } else {
        setHighestEmotion('No emotions detected.');
      }
    } else{
        console.error("Media value not found")
    }
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch and extract the 'media' value
  async function extractMediaValue(url: string): Promise<string | undefined> {
    try {
      // Fetch the content from the URL
      const response = await fetch(url);
      const data = await response.json();

      // Extract the 'media' value
      const mediaValue = data.media;

      return mediaValue || '';
    } catch (error) {
      console.error('Error:', error);
      return '';
    }
  }

  const clearData = () => {
    setHighestEmotion(null);
    setDescription('');
    setCapturedImage('');
  };

  const mintWorthy = async () => {
    // Prepare data to pass to Minter
    try {
  await onSubmit({
    title: highestEmotion || '',
    description: description,
    media: capturedImage as unknown as ((false | File) & (false | File | undefined)) | null,
  });
  // Optionally, you can display a success message or perform any other actions after minting is successful
  console.log("Minting successful");
  } catch (error){
    // Handle errors that occur during the minting process
    console.error("Error minting:", error)
  }
};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webcam Capture</CardTitle>
        <CardDescription>A simple webcam capture component</CardDescription>
      </CardHeader>
      <CardContent>
        {isClient && (
          <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={webcamEnabled}
              onChange={toggleWebcam}
            />
            <span className="text-gray-700">Webcam</span>
          </label>
          {webcamEnabled && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={480}
              height={480}
            />
          )}
        </div>
        )}

        <button onClick={capture} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Capture
        </button>
        <button onClick={clearData} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4">
          Clear Data
        </button>
        <button onClick={mintWorthy} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4">Mint Worthy</button>
        {loading && <p>Loading...</p>}
        {highestEmotion && !loading && <p>Title: {highestEmotion}</p>}
        <div className="mt-2">
                {<p>Description:<Haiku lines={description.split('\n')} /></p>}
          </div>
        {capturedImage && !loading && <Image src={capturedImage} alt="Captured" width={180} height={180}/>} {/* Render captured image */}
      </CardContent>
      <CardFooter>
        <p>@surfiniaburger</p>
      </CardFooter>
    </Card>
);
};
