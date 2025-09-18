export const isTestEnvironment = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const globalWindow = window as unknown as { Cypress?: unknown; __MED_MNG_TEST_MODE__?: boolean };
  if (typeof globalWindow.Cypress !== 'undefined') {
    return true;
  }

  if (globalWindow.__MED_MNG_TEST_MODE__) {
    return true;
  }

  try {
    const flag = window.localStorage?.getItem('medmng-test-mode');
    if (flag && flag.toLowerCase() === 'true') {
      return true;
    }
  } catch (error) {
    console.warn('Unable to access localStorage for test mode detection', error);
  }

  return false;
};
