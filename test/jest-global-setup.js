// Suppress ECONNREFUSED stderr noise from service init
// making real fetch() calls to localhost during test bootstrap.
const _origWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = function (chunk, ...args) {
  if (typeof chunk === 'string' && chunk.includes('ECONNREFUSED')) return true;
  if (chunk instanceof Buffer && chunk.toString().includes('ECONNREFUSED')) return true;
  return _origWrite(chunk, ...args);
};

module.exports = async function () {};
