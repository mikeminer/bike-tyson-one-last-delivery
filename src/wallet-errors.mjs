// Phantom's documented provider codes. Keep rejection separate from technical failure.
export function signatureErrorMessage(error) {
  const code = typeof error?.code === 'number' ? error.code : undefined;
  switch (code) {
    case 4001: return 'Sign-in was declined in Phantom. Try again when you are ready; no transaction is required.';
    case 4100: return 'Phantom has not authorized this account. Disconnect, reconnect your wallet, then sign in again.';
    case 4900: return 'Phantom is disconnected. Open the wallet, check its connection, then try again.';
    case -32002: return 'A Phantom request is already open. Complete or dismiss it in the wallet before trying again.';
    case -32000: return 'Phantom could not read the sign-in request. Reload the game and try again. (Phantom -32000)';
    case -32601: return 'This wallet does not support message signing. Update Phantom or open the game in its mobile browser.';
  }
  const detail = typeof error?.message === 'string' ? error.message.replace(/[\r\n\t]+/g, ' ').slice(0, 180) : '';
  return `Phantom could not sign the message${code === undefined ? '' : ` (${code})`}.${detail ? ` ${detail}` : ' Open the wallet and try again.'}`;
}
