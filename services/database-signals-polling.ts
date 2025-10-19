import { Platform } from 'react-native';

// Use server API instead of direct database connection
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

export interface DatabaseSignal {
  id: string;
  ea: string;
  asset: string;
  latestupdate: string;
  type: string;
  action: string;
  price: string;
  tp: string;
  sl: string;
  time: string;
  results: string;
}

export interface LicenseData {
  id: string;
  owner: string;
  ea: string;
  user: string;
  k_ey: string;
  created: string;
  expires: string;
  plan: string;
  status: string;
  phone_secret_code: string;
  phoneId: string;
  power: string;
}

export interface SignalPollingCallback {
  onSignalFound: (signal: DatabaseSignal) => void;
  onError: (error: string) => void;
}

class DatabaseSignalsPollingService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onSignalFound?: (signal: DatabaseSignal) => void;
  private onError?: (error: string) => void;
  private currentLicenseKey: string | null = null;
  private currentEA: string | null = null;
  private lastPollTime: string | null = null;

  // Service is always enabled (uses server API)
  enableDatabaseConnections() {
    console.log('Signals polling service enabled (using server API)');
  }

  // Service is always enabled (uses server API)
  disableDatabaseConnections() {
    this.stopPolling();
    console.log('Signals polling service disabled');
  }

  // Start polling for signals
  startPolling(
    licenseKey: string,
    onSignalFound?: (signal: DatabaseSignal) => void,
    onError?: (error: string) => void
  ) {
    if (this.intervalId) {
      console.log('Database signals polling already running');
      return;
    }

    this.onSignalFound = onSignalFound;
    this.onError = onError;
    this.currentLicenseKey = licenseKey;
    this.lastPollTime = new Date().toISOString();

    console.log('Starting signals polling for license:', licenseKey);

    // Always use server API (no direct database connection)
    this.startRealPolling(licenseKey);
  }

  // Stop polling
  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentLicenseKey = null;
    this.currentEA = null;
    this.lastPollTime = null;
    console.log('Database signals polling stopped');
  }


  // Real database polling
  private startRealPolling(licenseKey: string) {
    console.log('Starting real database signals polling for license:', licenseKey);

    // Check for signals every 10 seconds
    this.intervalId = setInterval(async () => {
      try {
        await this.checkForNewSignals(licenseKey);
      } catch (error) {
        console.error('Error checking for database signals:', error);
        if (this.onError) {
          this.onError(`Database error: ${error}`);
        }
      }
    }, 10000); // Check every 10 seconds
  }

  // Check for new signals in database
  private async checkForNewSignals(licenseKey: string) {
    try {
      console.log('Checking for new database signals for license:', licenseKey);

      // First, get the EA from the license
      const ea = await this.getEAFromLicense(licenseKey);
      if (!ea) {
        console.error('Could not find EA for license:', licenseKey);
        return;
      }

      this.currentEA = ea;
      console.log('Found EA for license:', ea);

      // Get new signals for this EA since last poll
      const signals = await this.getNewSignalsForEA(ea);

      console.log(`Found ${signals.length} new signals for EA ${ea}:`, signals);

      // Process each signal found
      for (const signal of signals) {
        console.log('✅ New database signal found:', signal);
        if (this.onSignalFound) {
          this.onSignalFound(signal);
        }
      }

      // Update last poll time
      this.lastPollTime = new Date().toISOString();

    } catch (error) {
      console.error('Error in checkForNewSignals:', error);
      throw error;
    }
  }

  // Get EA from license key via API
  private async getEAFromLicense(licenseKey: string): Promise<string | null> {
    try {
      console.log('🔍 Fetching EA ID for license:', licenseKey);
      const apiUrl = `${API_BASE_URL}/api/get-ea-from-license?licenseKey=${encodeURIComponent(licenseKey)}`;
      console.log('🔍 EA API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 EA ID retrieved from license:', data.eaId);
      return data.eaId;
    } catch (error) {
      console.error('Error fetching EA from license via API:', error);
      throw new Error('Failed to fetch EA from license');
    }
  }

  // Get new signals for EA since last poll
  private async getNewSignalsForEA(ea: string): Promise<DatabaseSignal[]> {
    try {
      const sinceTime = this.lastPollTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      console.log('🔍 Fetching signals for EA:', ea, 'since:', sinceTime);
      console.log('🔍 Last poll time:', this.lastPollTime);
      console.log('🔍 Current time:', new Date().toISOString());

      // First try without timestamp filter to get all active signals
      const params = new URLSearchParams({
        eaId: ea
        // Remove since parameter to get all active signals
      });

      const apiUrl = `${API_BASE_URL}/api/get-new-signals?${params}`;
      console.log('🔍 API URL (no timestamp filter):', apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 Signals retrieved for EA', ea, ':', data.signals?.length || 0, 'signals');
      console.log('🔍 Signal details:', data.signals);
      return data.signals;
    } catch (error) {
      console.error('Error fetching new signals via API:', error);
      throw new Error('Failed to fetch new signals');
    }
  }

  // Check if polling is running
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  // Get current polling status
  getStatus() {
    return {
      isRunning: this.isRunning(),
      licenseKey: this.currentLicenseKey,
      ea: this.currentEA,
      lastPollTime: this.lastPollTime,
      isEnabled: true // Always enabled (uses server API)
    };
  }
}

export const databaseSignalsPollingService = new DatabaseSignalsPollingService();
export default databaseSignalsPollingService;
