// Mock for Web Workers loaded via comlink-loader.
// Returns a constructor that produces a proxy answering any method call.
function createNoopProxy() {
  return new Proxy({}, {
    get: function (target, prop) {
      if (prop === 'then') return undefined; // not a thenable
      return function () {
        return Promise.resolve();
      };
    }
  });
}

function MockWorker() {
  return createNoopProxy();
}

module.exports = {
  EspsParserWorker: MockWorker,
  TextGridParserWorker: MockWorker,
  SsffParserWorker: MockWorker,
  SpectroDrawingWorker: MockWorker,
  default: MockWorker
};
