// src/services/excuseEvaluator.js

const positiveKeywords = ["sick", "study", "work", "deadline", "emergency", "family", "health", "doctor", "important", "interview"];
const mehKeywords = ["tired", "sleepy", "sad", "dread", "lazy", "cold", "rain", "headache"];
const angryKeywords = ["party", "movie", "game", "overslept", "boring"];

/**
 * Evaluates a user's excuse and returns a reaction type.
 * @param {string} excuse - The user's excuse.
 * @returns {'great' | 'meh' | 'comedy' | 'angry'} - The reaction type.
 */
export const evaluateExcuse = (excuse) => {
  const excuseLower = excuse.toLowerCase();

  // Check for angry keywords first for bad excuses
  if (angryKeywords.some(keyword => excuseLower.includes(keyword))) {
    return 'angry'; 
  }
  
  // Check for positive keywords 
  if (positiveKeywords.some(keyword => excuseLower.includes(keyword))) {
    return 'great'; // Good excuse, snooze granted!
  }

  // Check for "meh" keywords
  if (mehKeywords.some(keyword => excuseLower.includes(keyword))) {
    return 'meh'; // Meh, not a great excuse.
  }

  // If no specific keywords are found, it's a "comedy"
  return 'comedy'; // Lame excuse!
};
