const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) {
    return '';
  }

  const trimmed = baseUrl.trim();

  if (!trimmed) {
    return '';
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');

  if (/(^|\/)api$/i.test(withoutTrailingSlash)) {
    const shortened = withoutTrailingSlash.slice(0, -3);

    if (shortened.endsWith('/')) {
      return shortened.slice(0, -1);
    }

    return shortened;
  }

  return withoutTrailingSlash;
};

export const resolveAdminBaseUrl = (baseUrl) => normalizeBaseUrl(baseUrl);

export default resolveAdminBaseUrl;
