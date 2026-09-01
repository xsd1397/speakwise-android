export const createAudioFormData = (audioUri: string, fieldName = 'file'): FormData => {
  const formData = new FormData();
  const fileExtension = audioUri.split('.').pop() || 'm4a';
  const mimeType = fileExtension === 'wav' ? 'audio/wav' : 'audio/m4a';

  formData.append(fieldName, {
    uri: audioUri,
    name: `recording_${Date.now()}.${fileExtension}`,
    type: mimeType,
  } as any);

  return formData;
};
