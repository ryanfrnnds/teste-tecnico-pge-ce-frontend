module.exports = function (config) {
  const isRemote = process.env.KARMA_REMOTE === 'true';
  const browsers = isRemote ? [] : ['ChromeHeadlessNoSandbox'];

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false,
        seed: '4321',
        stopOnFailure: false,
        failFast: false,
        timeoutInterval: 60000
      },
      clearContext: false,
      captureConsole: true,
      runInParent: false,
      useIframe: true
    },
    jasmineHtmlReporter: {
      suppressAll: false // Permite exibir a interface HTML do Jasmine
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/teste-pge'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    // Removendo 'kjhtml' para focar apenas no output do terminal e forçando 'spec'
    reporters: ['kjhtml', 'spec'],
    specReporter: {
      maxLogLines: 15,
      suppressErrorSummary: false,
      suppressFailed: false,
      suppressPassed: false,
      suppressSkipped: false,
      showSpecTiming: true,
      failFast: false,
      prefixes: {
        success: '✓ ',
        failure: '✗ ',
        skipped: '- '
      }
    },
    browsers,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      },
      Chrome: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--remote-debugging-port=9222']
      },
      ChromeRemote: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--remote-debugging-port=9222',
          '--remote-debugging-address=0.0.0.0'
        ]
      }
    },
    autoWatch: isRemote,
    singleRun: !isRemote,
    restartOnFileChange: isRemote,
    // Permite que browsers externos se conectem (modo capture)
    captureTimeout: 300000,
    browserDisconnectTimeout: 60000,
    browserDisconnectTolerance: 10,
    browserNoActivityTimeout: 300000,
    pingTimeout: 60000,
    concurrency: Infinity,
    colors: true,
    logLevel: config.LOG_INFO,
    // Permite acesso externo ao Karma
    listenAddress: '0.0.0.0',
    port: 9876,
    hostname: '0.0.0.0',
    // Quando não há browsers configurados, o Karma entra em modo de captura
    // Isso permite que browsers externos se conectem via http://localhost:9876
    transportSecurity: false,
    // Configurações adicionais para melhorar a conexão com browsers externos
    protocol: 'http',
    proxies: {},
  });
};
