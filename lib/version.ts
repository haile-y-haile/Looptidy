import Constants from 'expo-constants';

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

export function getBuildNumber(): string {
  return (
    Constants.expoConfig?.ios?.buildNumber ??
    String(Constants.expoConfig?.android?.versionCode ?? '')
  );
}

export function getVersionLabel(): string {
  const build = getBuildNumber();
  return build ? `${getAppVersion()} (${build})` : getAppVersion();
}
