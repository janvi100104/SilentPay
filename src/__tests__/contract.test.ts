import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Midnight Contract', () => {
  const contractsDir = path.resolve(__dirname, '../../contracts');
  const managedDir = path.resolve(contractsDir, 'managed');

  describe('Payroll Contract', () => {
    it('should have payroll.compact file', () => {
      const contractPath = path.join(contractsDir, 'payroll.compact');
      expect(fs.existsSync(contractPath)).toBe(true);
    });

    it('should have valid Compact syntax', () => {
      const contractPath = path.join(contractsDir, 'payroll.compact');
      const content = fs.readFileSync(contractPath, 'utf-8');

      // Check for required pragma
      expect(content).toContain('pragma language_version');

      // Check for required imports
      expect(content).toContain('CompactStandardLibrary');

      // Check for ledger declarations
      expect(content).toContain('export ledger');

      // Check for circuit declarations
      expect(content).toContain('export circuit');
    });

    it('should have createPayroll circuit', () => {
      const contractPath = path.join(contractsDir, 'payroll.compact');
      const content = fs.readFileSync(contractPath, 'utf-8');

      expect(content).toContain('createPayroll');
    });

    it('should have claimPayment circuit', () => {
      const contractPath = path.join(contractsDir, 'payroll.compact');
      const content = fs.readFileSync(contractPath, 'utf-8');

      expect(content).toContain('claimPayment');
    });
  });

  describe('Contract Compilation', () => {
    it('should have compile script in package.json', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(contractsDir, '../package.json'), 'utf-8')
      );

      expect(packageJson.scripts?.compile).toBeDefined();
      expect(packageJson.scripts?.compile).toContain('compact compile');
    });

    it('should have managed directory structure', () => {
      const payrollDir = path.join(managedDir, 'payroll');
      expect(fs.existsSync(payrollDir)).toBe(true);
      expect(fs.existsSync(path.join(payrollDir, 'contract', 'index.js'))).toBe(true);
    });
  });

  describe('Contract Dependencies', () => {
    it('should have compact-runtime in dependencies', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(contractsDir, '../package.json'), 'utf-8')
      );

      expect(
        packageJson.dependencies?.['@midnight-ntwrk/compact-runtime']
      ).toBeDefined();
    });

    it('should have midnight-js packages in dependencies', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(contractsDir, '../package.json'), 'utf-8')
      );

      expect(
        packageJson.dependencies?.['@midnight-ntwrk/midnight-js-contracts']
      ).toBeDefined();
    });
  });
});
