export function processImageUrl(url: string) {
  const match = url.match(/\/_next\/image\?url=([^&]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return url;
}

