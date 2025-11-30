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
      jasmine: {},
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
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
      maxLogLines: 10,             
      suppressErrorSummary: false, 
      suppressFailed: false,      
      suppressPassed: false,      
      suppressSkipped: false,      
      showSpecTiming: true,      
      failFast: false             
    },
    browsers: ['Chrome', 'ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    },
    restartOnFileChange: true,
    colors: true,
    logLevel: config.LOG_INFO,
  });
};
