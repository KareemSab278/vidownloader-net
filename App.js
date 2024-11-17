import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';

const App = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadFileForWeb = async (downloadLink) => {
        try {
            const response = await fetch(downloadLink);
            if (!response.ok) {
                throw new Error('Failed to fetch the file');
            }
            const blob = await response.blob();
            const urlObject = URL.createObjectURL(blob);

            // Create a link and trigger the download
            const link = document.createElement('a');
            link.href = urlObject;
            link.download = `video_${Date.now()}.mp4`; // Suggested file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Success: File downloaded successfully');
        } catch (error) {
            alert('Error: Failed to download video');
            console.error('Web Download Error:', error);
        }
    };

    const downloadVideo = async () => {
        if (!videoUrl) {
            alert('Error: Please enter a URL');
            return;
        }

        setIsDownloading(true);

        try {
            const backendUrl = 'https://vidownloader-backend.onrender.com/download';
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: videoUrl }),
            });

            const result = await response.json();

            if (result.error) {
                setIsDownloading(false);
                alert(`Error: ${result.error}`);
                return;
            }

            const downloadLink = result.downloadLink;

            // Web-specific download
            await downloadFileForWeb(downloadLink);

            setIsDownloading(false);
        } catch (error) {
            setIsDownloading(false);
            alert('Error: Failed to download video');
            console.error('Error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Web Video Downloader</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter video URL here"
                value={videoUrl}
                onChangeText={setVideoUrl}
            />
            {isDownloading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <Button title="Download Video" onPress={downloadVideo} color="#4CAF50" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '80%',
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 5,
    },
});

export default App;