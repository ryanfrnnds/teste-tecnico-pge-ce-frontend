module.exports = function (config) {
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
        timeoutInterval: 10000
      },
      clearContext: false
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
    browsers: ['ChromeHeadlessNoSandbox'], // Usa headless por padrão, mas mantém interface web ativa
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      },
      Chrome: {
        base: 'Chrome',
        flags: ['--no-sandbox', '--disable-gpu', '--remote-debugging-port=9222']
      }
    },
    autoWatch: true,
    singleRun: false,
    restartOnFileChange: true,
    colors: true,
    logLevel: config.LOG_INFO,
    // Permite acesso externo ao Karma
    listenAddress: '0.0.0.0',
    port: 9876,
  });
};
