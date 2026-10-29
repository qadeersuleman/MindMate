import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, ScrollView, ActivityIndicator } from 'react-native';
import { API_HOST } from '../../config/server';

const EmotionAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeEmotion = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch(`${API_HOST}/emotion/data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'success') {
          setResults(data);
        } else {
          setError(data.error || 'Analysis failed');
        }
      } else {
        setError(data.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please check your connection and server URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setInputText('');
    setResults(null);
    setError(null);
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      anger: '#ff4757',
      disgust: '#2ed573',
      fear: '#ffa502',
      joy: '#ffd700',
      neutral: '#a4b0be',
      sadness: '#3742fa',
      surprise: '#7bed9f'
    };
    return colors[emotion.toLowerCase()] || '#57606f';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Emotion Analysis</Text>
      <Text style={styles.subtitle}>Enter text to detect emotions</Text>

      <TextInput
        style={styles.input}
        placeholder="Type your text here... (e.g., 'I feel happy today!')"
        value={inputText}
        onChangeText={setInputText}
        editable={!isLoading}
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing emotions...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Try Again" onPress={() => setError(null)} color="#ff4757" />
        </View>
      )}

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Analysis Results</Text>
          
          <View style={[styles.emotionBadge, { backgroundColor: getEmotionColor(results.primary_emotion) }]}>
            <Text style={styles.emotionText}>{results.primary_emotion}</Text>
            <Text style={styles.confidenceText}>
              {Math.round(results.confidence * 100)}% confidence
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Input Text:</Text>
          <Text style={styles.inputPreview}>"{results.input_text}"</Text>

          <Text style={styles.sectionTitle}>All Detected Emotions:</Text>
          {results.all_emotions.map((emotion, index) => (
            <View key={index} style={styles.emotionItem}>
              <Text style={styles.emotionLabel}>{emotion.label}</Text>
              <Text style={styles.emotionScore}>
                {Math.round(emotion.score * 100)}%
              </Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Text Analysis:</Text>
          <Text style={styles.statsText}>
            {results.analysis.word_count} words, {results.analysis.text_length} characters
          </Text>

          <Button title="Analyze New Text" onPress={resetAnalysis} />
        </View>
      )}

      {!isLoading && !results && !error && (
        <Button
          title="Analyze Emotion"
          onPress={analyzeEmotion}
          disabled={!inputText.trim()}
          color="#007AFF"
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#7f8c8d',
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4757',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  emotionBadge: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  emotionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  confidenceText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#2c3e50',
  },
  inputPreview: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 15,
    lineHeight: 22,
  },
  emotionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  emotionLabel: {
    fontSize: 16,
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  emotionScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  statsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default EmotionAnalyzer;