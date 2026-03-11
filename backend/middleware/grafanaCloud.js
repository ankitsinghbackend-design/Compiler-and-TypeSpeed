// Grafana Cloud integration disabled - using scrape-based monitoring instead
// This file is kept for compatibility but does nothing

class GrafanaCloudClient {
  constructor() {
    // Completely disabled - no logging, no initialization
    this.enabled = false;
  }

  async pushMetrics() {
    // No-op - scrape-based monitoring is used instead
    return;
  }

  startMetricsPush() {
    // No-op - scrape-based monitoring is used instead
    return;
  }
}

// Export singleton instance
export const grafanaCloud = new GrafanaCloudClient();
