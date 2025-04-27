import React, { useState, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';
import TextInput from './TextInput';
import { useSpeechSynthesis } from 'react-speech-kit';
import './Translator.css';

// List of languages available for translation
const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'it', name: 'Italian' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ne', name: 'Nepali' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'th', name: 'Thai' },
];

function Translator() {
  // States for the source and target languages
  const [sourceLanguage, setSourceLanguage] = useState('en'); // Default language is English
  const [targetLanguage, setTargetLanguage] = useState('hi'); // Default target language is Spanish

  // State for the input text that the user wants to translate
  const [text, setText] = useState(''); // Initially, there's no text to translate

  // State for storing the translated text
  const [translatedText, setTranslatedText] = useState(''); // Initially, no translation

  // State to store any error messages
  const [error, setError] = useState(null); // No error initially

  // State for storing available voices for speech synthesis
  const [voices, setVoices] = useState([]); // Voices are initially empty

  // useSpeechSynthesis hook for handling text-to-speech functionality
  const { speak } = useSpeechSynthesis();

  // Effect hook to load voices for text-to-speech when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices(); // Get available voices
      setVoices(allVoices); // Update voices state
    };

    loadVoices(); // Initially load voices
    window.speechSynthesis.onvoiceschanged = () => { // Load voices whenever they change
      loadVoices();
    };
  }, []);

  // Function to handle the translation of text from source to target language
  const handleTranslate = async () => {
    setError(null); // Reset any existing errors before starting translation
    try {
      // Fetch translation from API
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`
      );

      if (!response.ok) { // If the response is not OK, throw an error
        throw new Error('Something went wrong');
      }

      // Parse the JSON data from the response
      const data = await response.json();
      const translated = data.responseData.translatedText; // Get the translated text

      if (translated && translated !== text) {
        setTranslatedText(translated); // Update the translated text state
      } else {
        setError("Translation not available, please try other languages."); // If no translation, show error
        setTranslatedText('');
      }
    } catch (err) {
      setError("Translation error: " + err.message); // Handle any errors
      setTranslatedText('');
    }
  };

  // Function to speak the translated text using text-to-speech
  const handleTextToSpeech = () => {
    const allVoices = window.speechSynthesis.getVoices(); // Get available voices
    const voice = allVoices.find((v) => v.lang.includes(targetLanguage)); // Find the voice for the target language

    if (!voice) { // If no voice is found for the selected language, show an error
      setError("No voice found for selected language.");
      return;
    }

    speak({ text: translatedText, voice, lang: targetLanguage }); // Use the selected voice to speak the translated text
  };

  // Function to start speech recognition and convert spoken words to text
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // Check if speech recognition is available

    if (!SpeechRecognition) { // If not supported, show an error
      setError("Speech recognition not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition(); // Create a new instance of SpeechRecognition
    recognition.lang = sourceLanguage; // Set the language for recognition
    recognition.interimResults = false; // Only final results will be provided
    recognition.maxAlternatives = 1; // Limit to one alternative result
    recognition.continuous = true; // Allow continuous listening

    // When speech is recognized, update the text state
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setText(speechResult);
      recognition.stop(); // Stop listening after getting the result
    };

    recognition.onerror = (event) => { 
      setError("Speech recognition error: " + event.error);
    }; recognition.start(); // Start listening for speech
  };
     
  return (                 
    <div className="fullbody">
      <div className='content'>
      <h1 style={{ fontSize: '45px', textAlign: 'center' }}>Language Translator</h1>
      <h2 style={{ color: 'blueviolet', textAlign: 'center' }}>
        Translate anything and listen to it! 🎤🔊
      </h2>
      <hr style={{height: '30px', backgroundColor: 'red'}}></hr>

      <h2 style={{marginLeft:'200px',marginTop: '50px'}}>Select Languages:</h2>

      <div className="Selector">
        <LanguageSelector
          label="From:"
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)} // Update source language
          languages={languages}
        />
        <LanguageSelector
          label="To:"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)} // Update target language
          languages={languages}
        />
      </div>
       <div style={{marginLeft:'80px', marginBottom:'20px', }}>
       
       <TextInput 
        label="Enter Text:" 
        value={text} 
        onChange={(e) => setText(e.target.value)} // Update the text to translate
      />
      </div>
       
         <div>
        <button onClick={handleTranslate} style={{ marginRight: '10px', padding: '10px',border:'3px solid black', borderRadius: '8px', marginBottom: '20px', marginLeft:'80px' }}>
          Translate
        </button>
        <button onClick={startListening} style={{ marginRight: '10px', padding: '10px', border:'3px solid black', borderRadius: '8px', marginBottom:'20px', }}>
          Start Listening
        </button>
        <button onClick={handleTextToSpeech} style={{marginRight: '10px', padding: '10px', border:'3px solid black', borderRadius: '8px', marginBottom: '20px'}}>
          Play Translation
        </button>
         </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{marginLeft:'80px', marginBottom:'20px'}} >
      <TextInput
        label="Translated Text:"
        value={translatedText}
        disabled // Translated text cannot be modified by the user
      />
      </div>
       <div className='img'>
        
       <div className='text'style={{ maxWidth: '400px' }}>
    <p className='Style-paragraph' >
    Our Language Translator helps you seamlessly translate text between multiple languages with just a click.
  You can also listen your translated text using our integrated speech technology.
  Make communication easier, faster, and more accessible across different languages!
    </p>
    </div>
      <img src="/src/freepik--Character--inject-44.png" alt="Language Translator" className="header-image" />
      </div>
     
    </div>
    </div>
  );
}
export default Translator;
