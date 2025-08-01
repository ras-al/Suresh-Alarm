// src/components/SnoozeModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import './SnoozeModal.css';

const SnoozeModal = ({ alarm, onClose, onSnooze }) => {
  const [excuse, setExcuse] = useState('');
  const [reaction, setReaction] = useState(null);
  const [aiReply, setAiReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRinging, setIsRinging] = useState(true);

  // Audio refs for different sounds
  const alarmAudioRef = useRef(new Audio('/alarm.mp3'));
  const laughAudioRef = useRef(new Audio('/laugh.mp3'));
  const approvalAudioRef = useRef(new Audio('/approval.mp3'));
  const angryAudioRef = useRef(new Audio('/angry.mp3')); // Add angry.mp3 to /public

  useEffect(() => {
    if (isRinging) {
      alarmAudioRef.current.loop = true;
      // Play audio and handle potential interruptions
      const playPromise = alarmAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore the AbortError which is common on fast re-renders
          if (error.name !== 'AbortError') {
            console.error("Audio play failed:", error);
          }
        });
      }
    } else {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    // Cleanup on unmount
    return () => {
      alarmAudioRef.current.pause();
      laughAudioRef.current.pause();
      approvalAudioRef.current.pause();
      angryAudioRef.current.pause(); // Add cleanup for the new audio
    };
  }, [isRinging]);

  const getSureshReactionFromAI = async (userExcuse) => {
    setIsLoading(true);
    setReaction(null);
    // The API key should be left empty; the environment will provide it securely.
    const apiKey = "AIzaSyBHQjOLItHkL9FDcihNwfpfO6B4dNeRGH8"; 

    const prompt = `
      You are Suresh Krishna, the Malayalam actor. A user is giving you an excuse to snooze their alarm.
      Your task is to evaluate the excuse and respond in a short, funny "Manglish" (Malayalam + English) dialogue.
      Also, classify the excuse into one of four categories: 'great', 'meh', 'comedy', 'angry'.

      User's Excuse: "${userExcuse}"

      Provide your response in a JSON format like this:
      {
        "category": "your_category_choice",
        "reply": "your_manglish_dialogue"
      }

      Example Categories & Replies:
      - 'great': "Sheri, kidannolu. Valare nalla kaaranam." (For a very good excuse)
      - 'meh': "Enthokkeyo parayunnu. Oru 5 minute koode, athre ollu." (For a weak excuse)
      - 'comedy': "Hahaha, nalla comedy. Ezhunelkkan nokk." (For a funny/lame excuse)
      - 'angry': "Ennoduano kalikkunne? Ezhunettu podey!" (For a terrible excuse)
    `;

    try {
        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        // Using the recommended model for best results
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        
        // Clean the response text to be valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        return jsonResponse;

    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback in case of API error
        return { category: 'great', reply: 'API error aayi. Ennalum 5 minute edutho.' };
    } finally {
        setIsLoading(false);
    }
  };


  const handleExcuseSubmit = async () => {
    if (!excuse.trim()) return;
    
    const aiResponse = await getSureshReactionFromAI(excuse);
    
    setReaction(aiResponse.category);
    setAiReply(aiResponse.reply);

    if (aiResponse.category === 'great') {
      // Stop the alarm and play the approval voice-over
      alarmAudioRef.current.pause();
      approvalAudioRef.current.play();

      // Handle the snooze logic in the background immediately
      if (typeof onSnooze === 'function') {
        onSnooze(alarm);
      } else {
        console.error("SnoozeModal Error: onSnooze prop is missing or is not a function.");
      }
      
      // After a delay (for the voice-over), show the "SNOOZED" message
      setTimeout(() => {
        setIsRinging(false);
      }, 2000); // 2-second delay for the voice-over

      // After a longer delay, close the modal
      setTimeout(() => {
        if (typeof onClose === 'function') {
          onClose();
        } else {
          console.error("SnoozeModal Error: onClose prop is missing or is not a function.");
        }
      }, 4000); 

    } else {
      alarmAudioRef.current.pause();
      // Play angry or laughing sound based on the category
      if (aiResponse.category === 'angry') {
        angryAudioRef.current.play();
      } else {
        laughAudioRef.current.play();
      }
      
      setTimeout(() => {
        laughAudioRef.current.pause();
        laughAudioRef.current.currentTime = 0;
        angryAudioRef.current.pause();
        angryAudioRef.current.currentTime = 0;
        if(isRinging) alarmAudioRef.current.play();
      }, 3000);
    }
  };

  const handleTryAgain = () => {
    setReaction(null);
    setExcuse('');
    setAiReply('');
    if(isRinging) alarmAudioRef.current.play();
  };

  const getReactionContent = () => {
    if (isLoading) {
        return <div className="loading-text">Suresh is thinking... 🤔</div>;
    }
    if (!reaction) return null;

    const reactions = {
      comedy: { gif: '/reactions/comedy.gif' },
      meh: { gif: '/reactions/meh.gif' },
      great: { gif: '/reactions/great.gif' },
      angry: { gif: '/reactions/angry.gif' },
    };

    const { gif } = reactions[reaction] || { gif: '/reactions/meh.gif' }; 

    return (
      <div className="reaction-container">
        <img src={gif} alt={reaction} className="reaction-gif" />
        <h3>“{aiReply}”</h3>
        {reaction !== 'great' && (
          <button onClick={handleTryAgain} className="btn-try-again">
            Try Another Excuse
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay snooze-modal-overlay">
      <div className="modal-content snooze-modal-content">
        <div className="alarm-ringing-indicator">
          {isRinging ? '🔔 RINGING 🔔' : '🎉 SNOOZED! 🎉'}
        </div>
        <h2>{alarm.label || 'Alarm'} is ringing!</h2>
        <p>Convince Suresh why you need 5 more minutes of sleep.</p>
        
        {reaction || isLoading ? getReactionContent() : (
          <div className="excuse-form">
            <textarea
              value={excuse}
              onChange={(e) => setExcuse(e.target.value)}
              placeholder="Type your best excuse here..."
              rows="4"
            />
            <button onClick={handleExcuseSubmit} className="btn-submit-excuse">
              Submit Excuse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnoozeModal;
