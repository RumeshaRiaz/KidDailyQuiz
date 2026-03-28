const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAdMob(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    const existing = application['meta-data'].find(
      (item) => item.$['android:name'] === 'com.google.android.gms.ads.APPLICATION_ID'
    );

    if (!existing) {
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
          'android:value': 'ca-app-pub-7106819864536912~7463914470',
        },
      });
    }

    return config;
  });
};
