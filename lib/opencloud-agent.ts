import { logger } from './logger'

export type OpenCloudTaskResult = {
  ok: boolean
  provider: 'opencloud'
  taskType: string
  message: string
}

export type OpenCloudStatus = {
  enabled: boolean
  version: string
  capabilities: string[]
  mode: 'live' | 'disabled'
}

const DEFAULT_CAPABILITIES = ['scheduling', 'billing follow-up', 'prior auth reminders', 'care logistics']

function getConfig() {
  return {
    apiUrl: process.env.OPENCLOUD_API_URL,
    apiKey: process.env.OPENCLOUD_API_KEY,
    version: process.env.OPENCLOUD_VERSION || 'latest',
  }
}

export function getOpenCloudStatus(): OpenCloudStatus {
  const cfg = getConfig()
  const live = !!(cfg.apiUrl && cfg.apiKey)

  return {
    enabled: live,
    version: cfg.version,
    capabilities: DEFAULT_CAPABILITIES,
    mode: live ? 'live' : 'disabled',
  }
}

export async function runOpenCloudTask(taskType: string, payload: Record<string, unknown> = {}): Promise<OpenCloudTaskResult> {
  const cfg = getConfig()

  if (!cfg.apiUrl || !cfg.apiKey) {
    return {
      ok: false,
      provider: 'opencloud',
      taskType,
      message: 'OpenCloud is not configured',
    }
  }

  try {
    const response = await fetch(`${cfg.apiUrl.replace(/\/$/, '')}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({ taskType, payload }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      logger.warn('OpenCloud task request failed', { taskType, status: response.status, text })
      return {
        ok: false,
        provider: 'opencloud',
        taskType,
        message: `OpenCloud error (${response.status})`,
      }
    }

    return {
      ok: true,
      provider: 'opencloud',
      taskType,
      message: `OpenCloud task queued for ${taskType}`,
    }
  } catch (error) {
    logger.error('OpenCloud task exception', error)
    return {
      ok: false,
      provider: 'opencloud',
      taskType,
      message: error instanceof Error ? error.message : 'OpenCloud task failed',
    }
  }
}
