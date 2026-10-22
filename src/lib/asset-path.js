// Asset URLs use forward slashes on both the web and desktop.
export default {
  join: (...parts) => parts.filter(Boolean).join('/').replace(/\\/g, '/').replace(/\/{2,}/g, '/'),
};
