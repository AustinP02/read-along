import { useState, useRef } from "react";
import { GoogleGenAI } from "@google/genai";

function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [recordedURL, setRecordedURL] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const ai = new GoogleGenAI({
    apiKey: "AIzaSyD9y8TCCOHVcIDTAF6S3Y34AbOr5ozKy_k",
  });

  // helper to convert Blob → Base64
  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // ---- 📤 SEND TO GEMINI ----
  async function sendToGemini(audioBlob) {
    setIsTranscribing(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a transcription assistant. 
                The following audio is a recording of human speech. 
                Please listen carefully and provide a full, accurate transcript of the spoken words:`,
              },
              {
                inlineData: {
                  mimeType: audioBlob.type,
                  data: base64Audio.split(",")[1],
                },
              },
            ],
          },
        ],
      });

      const text = await result.text;
      console.log("🧠 Transcript:", text);
      setTranscript(text);
    } catch (err) {
      console.error("Error sending audio to Gemini:", err);
    } finally {
      setIsTranscribing(false);
    }
  }

  // ---- 🎙️ START RECORDING ----
  const startRecording = async () => {
    setIsRecording(true);
    setTranscript(""); // Clear previous transcript
    try {
      setSeconds(60);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      const timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);

      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/mp3" }); 
        const url = URL.createObjectURL(recordedBlob);
        setRecordedURL(url);
        chunks.current = [];
        clearInterval(timer);
        
        // 🎯 Automatically transcribe after recording stops
        sendToGemini(recordedBlob);
      };

      mediaRecorder.current.start();
    } catch (err) {
      console.error("Error accessing microphone", err);
    }
  };

  // ---- ⏹️ STOP RECORDING ----
  const stopRecording = async () => {
    setIsRecording(false);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>⏱️ {seconds}s</h2>
      {!isRecording ? (
        <button onClick={startRecording} style={{ padding: "10px 20px", fontSize: "16px" }}>
          🎙️ RECORD
        </button>
      ) : (
        <button onClick={stopRecording} style={{ padding: "10px 20px", fontSize: "16px" }}>
          ⏹️ STOP
        </button>
      )}

      {recordedURL && (
        <div style={{ marginTop: "20px" }}>
          <audio controls src={recordedURL}></audio>
        </div>
      )}

      {isTranscribing && (
        <div style={{ marginTop: "20px" }}>
          <p>🔄 Transcribing...</p>
        </div>
      )}

      {transcript && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
          <h3>Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}

export default Recorder;