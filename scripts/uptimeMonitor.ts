#!/usr/bin/env ts-node
import axios, { AxiosError } from 'axios';
import process from 'node:process';
import { notifyIncident } from '../src/services/alertService.ts';

const healthUrl = process.env.UPTIME_HEALTH_URL || 'http://localhost:3000/health';
const timeoutMs = Number(process.env.UPTIME_TIMEOUT_MS || '5000');
const expectedStatus = process.env.UPTIME_EXPECTED_STATUS || 'healthy';

interface HealthResponse {
  status?: string;
  build?: {
    hash?: string;
    timestamp?: string;
  };
}

async function run(): Promise<void> {
  const startedAt = Date.now();

  try {
    const response = await axios.get<HealthResponse>(healthUrl, {
      timeout: timeoutMs,
      validateStatus: () => true,
    });
    const duration = Date.now() - startedAt;

    const bodyStatus = response.data?.status;
    const buildHash = response.data?.build?.hash;

    if (response.status !== 200 || bodyStatus !== expectedStatus || !buildHash) {
      console.error(
        `[uptime] ${new Date().toISOString()} • FAIL (${duration}ms) – status=${response.status}, bodyStatus=${bodyStatus}`
      );

      await notifyIncident({
        type: 'UPTIME_CHECK_FAILED',
        severity: 'critical',
        message: `Health check returned ${response.status} for ${healthUrl}`,
        details: {
          duration,
          expectedStatus,
          receivedStatus: response.status,
          bodyStatus,
          response: response.data,
        },
      });

      process.exitCode = 1;
      return;
    }

    console.log(
      `[uptime] ${new Date().toISOString()} • OK (${duration}ms) – build=${buildHash} timestamp=${response.data?.build?.timestamp}`
    );
  } catch (error) {
    const duration = Date.now() - startedAt;
    const axiosError = axios.isAxiosError(error) ? (error as AxiosError) : undefined;
    const message = axiosError?.message || (error instanceof Error ? error.message : String(error));

    console.error(`[uptime] ${new Date().toISOString()} • ERROR (${duration}ms) – ${message}`);

    await notifyIncident({
      type: 'UPTIME_CHECK_FAILED',
      severity: 'critical',
      message: `Health check failed for ${healthUrl}`,
      details: {
        duration,
        code: axiosError?.code,
        status: axiosError?.response?.status,
        data: axiosError?.response?.data,
        message,
      },
    });

    process.exitCode = 1;
  }
}

void run();
