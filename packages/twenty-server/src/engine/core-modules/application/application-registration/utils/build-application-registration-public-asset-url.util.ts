const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

export const buildApplicationRegistrationPublicAssetUrl = (params: {
  serverUrl: string;
  applicationRegistrationId: string;
  assetPath: string;
}): string => {
  if (isAbsoluteUrl(params.assetPath)) {
    return params.assetPath;
  }

  return `${params.serverUrl}/application-registrations/${params.applicationRegistrationId}/assets/${params.assetPath}`;
};
