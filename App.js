//to run, use npx expo start and ensure file path is correct
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const App = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadVideo = async () => {
        if (!videoUrl) {
            Alert.alert('Error', 'Please enter a URL');
            return;
        }

        setIsDownloading(true);

        try {
            // Send the URL to the backend for processing
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
                Alert.alert('Error', result.error);
                return;
            }

            // Get the downloadable video link from the backend response
            const downloadLink = result.downloadLink;
            const downloadUri = `${FileSystem.documentDirectory}video_${Date.now()}.mp4`;

            // Download the file using FileSystem.downloadAsync
            const downloadResponse = await FileSystem.downloadAsync(downloadLink, downloadUri);
            console.log('Downloaded to:', downloadResponse.uri); // Log the final saved path

            if (downloadResponse && downloadResponse.uri) {
                // Request permissions to write to media library
                const permission = await MediaLibrary.requestPermissionsAsync();
                if (permission.granted) {
                    const asset = await MediaLibrary.createAssetAsync(downloadResponse.uri);
                    const album = await MediaLibrary.getAlbumAsync('Download');
                    if (album == null) {
                        await MediaLibrary.createAlbumAsync('Download', asset, false);
                    } else {
                        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                    }
                    Alert.alert('Success', 'Download complete! File saved to the Downloads folder.');
                } else {
                    Alert.alert('Permission Denied', 'Permission to access media library is required to save the video.');
                }
            } else {
                Alert.alert('Error', 'Download failed');
            }

            setIsDownloading(false);
        } catch (error) {
            setIsDownloading(false);
            Alert.alert('Error', 'Failed to download video');
            console.error('Error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Video Downloader</Text>
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
