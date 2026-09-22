import test from 'node:test';
import assert from 'node:assert/strict';
import { signatureErrorMessage } from '../src/wallet-errors.mjs';

test('wallet rejection and technical failures have distinct recovery instructions', () => {
  assert.match(signatureErrorMessage({code:4001}), /declined/);
  assert.match(signatureErrorMessage({code:4100}), /reconnect/);
  assert.match(signatureErrorMessage({code:4900}), /disconnected/);
  assert.match(signatureErrorMessage({code:-32002}), /already open/);
  assert.match(signatureErrorMessage({code:-32000}), /could not read/);
  assert.match(signatureErrorMessage({code:-32601}), /does not support/);
  assert.match(signatureErrorMessage({code:-32603,message:'Unexpected error'}), /-32603.*Unexpected error/);
  assert.doesNotMatch(signatureErrorMessage(new Error('Request failed')), /canceled|declined/);
  assert.match(signatureErrorMessage(null), /could not sign/);
});
