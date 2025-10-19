// VoiceInput.jsx
// Voice input component with speech recognition and language selection

import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic } from 'lucide-react';

const VoiceInput = ({ onTranscriptChange, language, onLanguageChange, onVoiceToggle, currentText }) => {
  const { 
    transcript, 
    listening, 
    resetTranscript, 
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();
  
  const [isActive, setIsActive] = useState(false);
  const previousTextRef = useRef('');

  // Update parent component with transcript changes
  useEffect(() => {
    if (isActive && transcript) {
      // Combine previous text with new transcript
      const fullText = previousTextRef.current + transcript;
      onTranscriptChange(fullText);
    }
  }, [transcript, isActive, onTranscriptChange]);

  // Auto-restart speech recognition when it stops (handles 60sec timeout and silence)
  useEffect(() => {
    if (isActive && !listening) {
      const timeoutId = setTimeout(() => {
        SpeechRecognition.startListening({ 
          continuous: true, 
          language: language 
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [listening, isActive, language]);

  // Toggle voice recording on/off
  const handleToggle = () => {
    if (isActive) {
      // Stop recording
      setIsActive(false);
      SpeechRecognition.stopListening();
      // Store current text as previous text for next recording
      previousTextRef.current = currentText;
      if (onVoiceToggle) onVoiceToggle(false);
    } else {
      // Start recording
      // Store current text before starting new recording
      previousTextRef.current = currentText;
      resetTranscript();
      setIsActive(true);
      SpeechRecognition.startListening({ 
        continuous: true, 
        language: language 
      });
      if (onVoiceToggle) onVoiceToggle(true);
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    onLanguageChange(newLanguage);
    
    // If currently recording, restart with new language
    if (isActive) {
      SpeechRecognition.stopListening();
      setTimeout(() => {
        SpeechRecognition.startListening({ 
          continuous: true, 
          language: newLanguage 
        });
      }, 100);
    }
  };

  // Reset previous text when currentText is cleared externally (after send)
  useEffect(() => {
    if (currentText === '') {
      previousTextRef.current = '';
    }
  }, [currentText]);

  // Show message if browser doesn't support speech recognition
  if (!browserSupportsSpeechRecognition) {
    return (
      <span className="text-xs text-gray-500">
        Voice input not supported in this browser
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <select
        value={language}
        onChange={handleLanguageChange}
        disabled={isActive}
        className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        title="Select language"
      >
        <option value="en-US">EN-US</option>
        <option value="en-GB">EN-GB</option>
        <option value="en-IN">EN-IN</option>
        <option value="te-IN">తెలుగు</option>
        <option value="hi-IN">हिंदी</option>
        <option value="ta-IN">தமிழ்</option>
        <option value="kn-IN">ಕನ್ನಡ</option>
        <option value="ml-IN">മലയാളം</option>
      </select>

      {/* Voice Toggle Button */}
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full transition-all ${
          isActive 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title={isActive ? 'Stop recording' : 'Start recording'}
      >
        <Mic className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-700'}`} />
      </button>

      {/* Recording Status Indicator */}
      {isActive && (
        <span className="text-xs text-red-500 font-medium">
          Recording...
        </span>
      )}
    </div>
  );
};

export default VoiceInput;