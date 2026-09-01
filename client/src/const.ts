export const getBackendApiUrl = (): string => {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (typeof process !== "undefined" && process.env?.VITE_BACKEND_URL) {
    return process.env.VITE_BACKEND_URL;
  }
  // 默认生产环境后端接口
  return "https://speakwise-wsicpu2u.manus.space";
};
