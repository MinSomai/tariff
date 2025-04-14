type TariffRates = { [packageName: string]: number };

class Tariff {
  private static rates: TariffRates = {};
  private static isPatching: boolean = false;

  // Set tariff rates
  static set(rates: TariffRates): void {
    this.rates = rates;
    this.patchRequire();
  }

  // Patch Node.js require to add delays
  private static patchRequire(): void {
    // Store the original require function from a fresh module
    const originalRequire = module.constructor.prototype.require;

    module.constructor.prototype.require = function(
      this: NodeModule,
      moduleName: string
    ) {
      // Prevent recursive calls
      if (Tariff.isPatching) {
        return originalRequire.call(this, moduleName);
      }

      Tariff.isPatching = true;
      try {
        const startTime = process.hrtime.bigint();
        const module = originalRequire.call(this, moduleName);

        // Check if the module has a tariff
        const tariffRate = Tariff.rates[moduleName];
        if (tariffRate) {
          const endTime = process.hrtime.bigint();
          const originalTimeNs = Number(endTime - startTime);
          const originalTimeUs = originalTimeNs / 1000; // Convert to microseconds
          const delayUs = (originalTimeUs * tariffRate) / 100;
          const totalTimeUs = originalTimeUs + delayUs;

          // Simulate delay (synchronous sleep approximation)
          const delayStart = Date.now();
          while (Date.now() - delayStart < delayUs / 1000) {
            // Busy wait to simulate delay
          }

          console.log(
            `JUST IMPOSED a ${tariffRate}% TARIFF on ${moduleName}! ` +
            `Original import took ${Math.round(
              originalTimeUs
            )} us, now takes ${Math.round(totalTimeUs)} us. ` +
            `American packages are WINNING AGAIN! #MIPA`
          );
        }

        return module;
      } finally {
        Tariff.isPatching = false;
      }
    };
  }
}

export default Tariff;
