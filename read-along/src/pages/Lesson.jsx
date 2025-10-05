import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';

function Lesson() {
  const [gtext, setGtext] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [recordedURL, setRecordedURL] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);
  const hasGeneratedLesson = useRef(false);

  const [elevenLoading, setElevenLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonStartTime, setLessonStartTime] = useState(null);

  // Cache for word audio and pronunciation tips
  const [wordAudioCache, setWordAudioCache] = useState({});
  const [pronunciationTipsCache, setPronunciationTipsCache] = useState({});

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  useEffect(() => {
    const init = async () => {
      if (hasGeneratedLesson.current) return;
      hasGeneratedLesson.current = true;
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
      
      await main();
    };

    init();
  }, []);

  async function main() {
    setGtext("");
    setTranscript("");
    setLoading(true);
    setLessonStartTime(Date.now());

    let dotIndex = 0;
    const dotPatterns = ["...", "..", "."];
    const dotInterval = setInterval(() => {
      setDots(dotPatterns[dotIndex % dotPatterns.length]);
      dotIndex++;
    }, 300);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents:
          "Generate a sentence that should take only 15 seconds to read for an average American. Nothing else.",
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const fullText = parts.map((p) => p.text).join(" ") || "No text found.";

      clearInterval(dotInterval);
      setDots("");
      setGtext(fullText);

      if (currentUser) {
        const { data: lesson, error } = await supabase
          .from('lessons')
          .insert([{
            title: `Practice: ${new Date().toLocaleDateString()}`,
            description: 'AI-generated reading practice',
            difficulty_level: 'beginner',
            content: fullText,
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating lesson:', error);
        } else {
          setCurrentLesson(lesson);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      clearInterval(dotInterval);
      setDots("");
      setGtext("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Generate TTS for individual word with caching
  const generateWordAudio = async (word) => {
    const cleanWord = word.replace(/[.,!?]/g, "");
    
    // Return cached audio if available
    if (wordAudioCache[cleanWord]) {
      return wordAudioCache[cleanWord];
    }

    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: cleanWord,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Cache the audio URL
      setWordAudioCache(prev => ({ ...prev, [cleanWord]: url }));
      return url;
    } catch (error) {
      console.error("Error generating word audio:", error);
      return null;
    }
  };

  const playWordAudio = async (word) => {
    const audioUrl = await generateWordAudio(word);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Generate pronunciation tip with caching
  const generatePronunciationTip = async (word) => {
    const cleanWord = word.replace(/[.,!?]/g, "");
    
    // Return cached tip if available
    if (pronunciationTipsCache[cleanWord]) {
      return pronunciationTipsCache[cleanWord];
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide a very brief pronunciation tip for the word "${cleanWord}". Keep it under 20 words. Format: just the phonetic spelling and a quick tip.`,
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const tip = parts.map((p) => p.text).join(" ") || "Pronunciation tip unavailable.";
      
      // Cache the tip
      setPronunciationTipsCache(prev => ({ ...prev, [cleanWord]: tip }));
      return tip;
    } catch (error) {
      console.error("Error generating pronunciation tip:", error);
      return "Pronunciation tip unavailable.";
    }
  };

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate and play or stop TTS
  const toggleTTS = async () => {
    // Stop current playback
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    // If already have audio cached, just play it
    if (audioUrl) {
      playAudio(audioUrl);
      return;
    }

    // Otherwise generate TTS first
    try {
      setElevenLoading(true);

      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: gtext || "The first move is what sets everything in motion.",
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      playAudio(url);
    } catch (error) {
      console.error("Error generating TTS:", error);
    } finally {
      setElevenLoading(false);
    }
  };

  const playAudio = (url) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error("Audio playback error:", err));

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

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
                Please listen carefully and provide a full, accurate transcript of the spoken words.
                IMPORTANT: Transcribe EXACTLY what you hear, word-for-word, in the exact order spoken.
                Do not add punctuation unless you hear clear pauses.
                Do not correct grammar or rearrange words.
                Output only the raw transcript with no additional commentary.`,
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
      setTranscript(text);

      await saveLessonResults(text);
    } catch (err) {
      console.error("Error sending audio to Gemini:", err);
    } finally {
      setIsTranscribing(false);
    }
  }

  const saveLessonResults = async (userTranscript) => {
    if (!currentUser || !currentLesson) return;

    try {
      const refWords = gtext.trim().split(/\s+/);
      const spokenWords = userTranscript.trim().split(/\s+/);
      
      let correctWords = 0;
      const wordAttempts = [];

      refWords.forEach((word, index) => {
        const cleanRef = word.replace(/[.,!?]/g, "").toLowerCase();
        const spokenWord = spokenWords[index];
        const cleanSpoken = spokenWord ? spokenWord.replace(/[.,!?]/g, "").toLowerCase() : null;
        
        const isCorrect = cleanRef === cleanSpoken;
        if (isCorrect) correctWords++;

        wordAttempts.push({
          user_id: currentUser.id,
          lesson_id: currentLesson.id,
          word: word,
          is_correct: isCorrect,
          confidence_score: isCorrect ? 100 : (spokenWord ? 50 : 0),
          attempt_number: 1,
        });
      });

      const accuracy = (correctWords / refWords.length) * 100;
      const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);

      const { error: lessonError } = await supabase
        .from('user_lessons')
        .insert([{
          user_id: currentUser.id,
          lesson_id: currentLesson.id,
          accuracy: accuracy,
          time_spent: timeSpent,
          mistakes_count: refWords.length - correctWords,
        }]);

      if (lessonError) throw lessonError;

      const { error: wordsError } = await supabase
        .from('word_attempts')
        .insert(wordAttempts);

      if (wordsError) throw wordsError;

      await updateUserStats(currentUser.id, accuracy);

      console.log('Lesson results saved successfully!');
    } catch (error) {
      console.error('Error saving lesson results:', error);
    }
  };

  const updateUserStats = async (userId, lessonAccuracy) => {
    try {
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newLessonsCompleted = currentStats.lessons_completed + 1;
      const totalAccuracy = currentStats.accuracy * currentStats.lessons_completed;
      const newAccuracy = (totalAccuracy + lessonAccuracy) / newLessonsCompleted;

      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          lessons_completed: newLessonsCompleted,
          accuracy: newAccuracy,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      const today = new Date().toISOString().split('T')[0];
      const { error: streakError } = await supabase
        .from('daily_streaks')
        .upsert({
          user_id: userId,
          activity_date: today,
          lessons_completed: 1,
          words_practiced: gtext.split(/\s+/).length,
        }, {
          onConflict: 'user_id,activity_date'
        });

      if (streakError) throw streakError;
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    setTranscript("");
    setSeconds(60);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);

      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/mp3" });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedURL(url);
        chunks.current = [];
        sendToGemini(recordedBlob);
      };

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      mediaRecorder.current.start();
    } catch (err) {
      console.error("Error accessing microphone", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Word component with persistent tooltip
  function WordWithTooltip({ word, isIncorrect, isMissing, index }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [pronunciationTip, setPronunciationTip] = useState("");
    const [tipLoading, setTipLoading] = useState(false);
    const hasLoadedRef = useRef(false);

    const cleanWord = word.replace(/[.,!?]/g, "");

    const handleMouseEnter = async () => {
      // Show tooltip for both mispronounced and skipped words
      if (isIncorrect || isMissing) {
        setShowTooltip(true);
        
        // Check if we have cached tip first
        if (pronunciationTipsCache[cleanWord]) {
          setPronunciationTip(pronunciationTipsCache[cleanWord]);
          hasLoadedRef.current = true;
        } else if (!hasLoadedRef.current) {
          // Only load if we haven't loaded before
          setTipLoading(true);
          const tip = await generatePronunciationTip(cleanWord);
          setPronunciationTip(tip);
          setTipLoading(false);
          hasLoadedRef.current = true;
        }
      }
    };

    let color = "black";
    let backgroundColor = "transparent";

    // Red for mispronounced, yellow for skipped
    if (isMissing) {
      backgroundColor = "#ffff99";
    } else if (isIncorrect) {
      color = "white";
      backgroundColor = "#ff4d4d";
    }

    return (
      <span
        style={{
          position: "relative",
          display: "inline-block",
          color,
          backgroundColor,
          padding: "2px 4px",
          borderRadius: "4px",
          margin: "2px 2px",
          wordBreak: "break-word",
          cursor: (isIncorrect || isMissing) ? "help" : "default",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {word}
        {showTooltip && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#333",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              zIndex: 1000,
              marginBottom: "5px",
              minWidth: "200px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {tipLoading ? (
              "Loading..."
            ) : (
              <>
                <div style={{ marginBottom: "8px" }}>{pronunciationTip}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playWordAudio(cleanWord);
                  }}
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    borderRadius: "4px",
                    backgroundColor: "#4CAF50",
                    border: "none",
                    color: "white",
                  }}
                >
                  Listen
                </button>
              </>
            )}
            <div
              style={{
                position: "absolute",
                bottom: "-5px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #333",
              }}
            />
          </div>
        )}
      </span>
    );
  }

  function getHighlightedText(reference, spoken) {
    const refWords = reference.trim().split(/\s+/);
    const spokenWords = spoken.trim().split(/\s+/);

    return refWords.map((word, index) => {
      const cleanRef = word.replace(/[.,!?]/g, "").toLowerCase();
      const spokenWord = spokenWords[index];
      const cleanSpoken = spokenWord ? spokenWord.replace(/[.,!?]/g, "").toLowerCase() : null;

      const isMissing = !spokenWord; // Word was skipped
      const isIncorrect = spokenWord && cleanRef !== cleanSpoken; // Word was mispronounced

      return (
        <WordWithTooltip
          key={index}
          word={word}
          isIncorrect={isIncorrect}
          isMissing={isMissing}
          index={index}
        />
      );
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "20px",
        fontFamily: "sans-serif",
        background: "linear-gradient(to bottom, #4b1f6e, #5b1db6, #8f6be6)",
      }}
    >
      {gtext && (
        <div
          style={{
            margin: "20px auto",
            padding: "15px 20px",
            fontSize: "1.2rem",
            whiteSpace: "pre-wrap",
            backgroundColor: "#f0ffd1",
            border: "1px solid black",
            borderRadius: "20px",
            maxWidth: "600px",
            width: "90%",
          }}
        >
          {transcript ? getHighlightedText(gtext, transcript) : gtext}
        </div>
      )}

      {loading && <p style={{ fontSize: "1.2rem", color: "white" }}>Generating{dots}</p>}

      <h2 style={{ marginTop: "30px", color: "white" }}>⏱️ {seconds}s</h2>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "8px",
              backgroundColor: "#cceeff",
              border: "1px solid #333",
            }}
          >
            RECORD
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "8px",
              backgroundColor: "#ffcccc",
              border: "1px solid #333",
            }}
          >
            STOP
          </button>
        )}

        <button
          onClick={toggleTTS}
          disabled={elevenLoading || !gtext}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: elevenLoading ? "not-allowed" : "pointer",
            borderRadius: "8px",
            backgroundColor: elevenLoading ? "#ddd" : "#e6f7ff",
            border: "1px solid #333",
          }}
        >
          {elevenLoading
            ? "Generating..."
            : isPlaying
            ? "Stop"
            : "Hear Sentence"}
        </button>
      </div>

      {recordedURL && (
        <div style={{ marginTop: "20px" }}>
          <audio controls src={recordedURL}></audio>
        </div>
      )}

      {isTranscribing && (
        <p style={{ marginTop: "20px", fontStyle: "italic", color: "white" }}>Transcribing...</p>
      )}

      {transcript && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            maxWidth: "600px",
            textAlign: "left",
            color: "#333",
          }}
        >
          <h3>Transcript:</h3>
          <p style={{ color: "black" }}>{transcript}</p>
        </div>
      )}
    </div>
  );
}

export default Lesson;