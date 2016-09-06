/**
 * @fileOverview Creates a Jasmine spy object which mocks out all the logger
 *               functions so they can be used in expectations.
 * @author ultracrepidarian
 */
define(
    'mocks/mockloggerobject',
    [
    ],
    function () {
        /**
         * Creates a Jasmine spy object which mocks out all the logger functions so they can be used in expectations.
         *
         * @name mocks.mockLoggerObject
         * @param {String} [mockLoggerName='mockLogger'] Optional name for the mock logger
         * @param {String[]} [loggersToEnable=['info', 'warn', 'error']] Array of loggerNames that should actually log to the console
         * @returns {{log:Function, debug:Function, info:Function, warn:Function, error:Function}} Jasmine spy object
         *
         * @example
         *   var mockLogger;
         *
         *   beforeEach(function() {
         *     mockLogger = mockLoggerObject('mockLogger');
         *
         *     var mockDevice = Object.create(Device.prototype);
         *     spyOn(mockDevice, 'getLogger').andReturn(mockLogger);
         *
         *     var mockApplication = Object.create(Application.prototype);
         *     spyOn(mockApplication, 'getDevice').andReturn(mockDevice);
         *
         *     RuntimeContext.setCurrentApplication(mockApplication);
         *   });
         *
         *   it('behaves as expected', function() {
         *     myObject.methodUnderTest('disgruntled employee');
         *     expect(mockLogger.error).toHaveBeenCalledWith('Human saliva found in the crème brûlée');
         *   });
         */
        return function(mockLoggerName, loggersToEnable) {
            if (typeof mockLoggerName !== 'string') {
                mockLoggerName = 'mockLogger';
            }

            if (!Array.isArray(loggersToEnable)) {
                loggersToEnable = [ 'info', 'warn', 'error' ];
            }

            var mockLogger = jasmine.createSpyObj(mockLoggerName,  [ 'log', 'debug', 'info', 'warn', 'error' ]);

            loggersToEnable.forEach(function(loggerName) {
                if (typeof loggerName === 'string' && typeof mockLogger[loggerName] === 'function' && Array.isArray(mockLogger[loggerName].calls)) {
                    mockLogger[loggerName].andCallFake(function() {
                        console[loggerName].apply(console, arguments);  // Actually log it to the console
                    });
                }
            });

            return mockLogger;
        };
    }
);
