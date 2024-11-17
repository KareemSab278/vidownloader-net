const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Exclude expo-file-system from the web build
    config.resolve.alias['expo-file-system'] = false;

    return config;
};
