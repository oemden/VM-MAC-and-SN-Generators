import { useState } from 'react'
import { API_URL } from '../lib/api'
import { SaveResultsForm } from './SaveResultsForm'

interface SnResult {
  sn: string
}

interface SnOptions {
  count: number
  length: number
  prefix: string
  suffix: string
  case: 'upper' | 'lower' | 'mixed'
  delimiter: string
  noPrefix: boolean
  noDelimiter: boolean
  assignToVm: boolean
}

export function SnGenerator() {
  const [options, setOptions] = useState<SnOptions>({
    count: 1,
    length: 6,
    prefix: 'VM',
    suffix: '',
    case: 'upper',
    delimiter: '-',
    noPrefix: false,
    noDelimiter: false,
    assignToVm: true
  })
  const [results, setResults] = useState<SnResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/sn/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: options.count,
          length: options.length,
          prefix: options.noPrefix ? undefined : options.prefix,
          suffix: options.suffix || undefined,
          case: options.case,
          delimiter: options.noDelimiter ? undefined : options.delimiter,
          noPrefix: options.noPrefix,
          noDelimiter: options.noDelimiter
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Generation failed')
      }

      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const copyAll = async () => {
    const text = results.map((r) => r.sn).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(-1)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon sn">S</div>
        <div>
          <div className="card-title">Serial Number</div>
          <div className="card-subtitle">Custom format</div>
        </div>
      </div>

      <div className="generator-layout">
        <div className="generator-options">
          <div
            className="options-toggle"
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? '▼' : '▶'} Options
          </div>

          {showOptions && (
            <div className="options-panel">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Count</label>
              <input
                type="number"
                className="form-input"
                value={options.count}
                onChange={(e) =>
                  setOptions({ ...options, count: parseInt(e.target.value) || 1 })
                }
                min={1}
                max={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Random Length</label>
              <input
                type="number"
                className="form-input"
                value={options.length}
                onChange={(e) =>
                  setOptions({ ...options, length: parseInt(e.target.value) || 6 })
                }
                min={1}
                max={32}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Prefix
                <label style={{ marginLeft: '0.5rem', fontWeight: 'normal' }}>
                  <input
                    type="checkbox"
                    checked={options.noPrefix}
                    onChange={(e) =>
                      setOptions({ ...options, noPrefix: e.target.checked })
                    }
                    style={{ marginRight: '0.25rem' }}
                  />
                  None
                </label>
              </label>
              <input
                type="text"
                className="form-input"
                value={options.prefix}
                onChange={(e) =>
                  setOptions({ ...options, prefix: e.target.value })
                }
                disabled={options.noPrefix}
                placeholder="VM"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Suffix</label>
              <input
                type="text"
                className="form-input"
                value={options.suffix}
                onChange={(e) =>
                  setOptions({ ...options, suffix: e.target.value })
                }
                placeholder="PROD, DEV, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Case</label>
              <select
                className="form-select"
                value={options.case}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    case: e.target.value as 'upper' | 'lower' | 'mixed'
                  })
                }
              >
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Delimiter
                <label style={{ marginLeft: '0.5rem', fontWeight: 'normal' }}>
                  <input
                    type="checkbox"
                    checked={options.noDelimiter}
                    onChange={(e) =>
                      setOptions({ ...options, noDelimiter: e.target.checked })
                    }
                    style={{ marginRight: '0.25rem' }}
                  />
                  None
                </label>
              </label>
              <input
                type="text"
                className="form-input"
                value={options.delimiter}
                onChange={(e) =>
                  setOptions({ ...options, delimiter: e.target.value })
                }
                disabled={options.noDelimiter}
                maxLength={1}
                placeholder="-"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={options.assignToVm}
                  onChange={(e) =>
                    setOptions({ ...options, assignToVm: e.target.checked })
                  }
                  aria-label="Assign to VM"
                />
                Assign to VM
              </label>
            </div>
          </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={generate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate SN'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="generator-results">
          {results.length === 0 ? (
            <div className="results-placeholder">
              <span className="results-placeholder-text">Generated results will appear here</span>
            </div>
          ) : (
            <>
              <div className="results">
                <div className="results-header">
                  <span className="results-title">
                    Generated ({results.length})
                  </span>
                  <button
                    className={`copy-btn ${copiedIndex === -1 ? 'copied' : ''}`}
                    onClick={copyAll}
                  >
                    {copiedIndex === -1 ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
                <div className="results-list">
                  {results.map((result, index) => (
                    <div key={index} className="result-item">
                      <span className="result-value">{result.sn}</span>
                      <button
                        className={`copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(result.sn, index)}
                      >
                        {copiedIndex === index ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {options.assignToVm && (
                <div className="save-results-section">
                  <SaveResultsForm
                    type="sn"
                    values={results.map((r) => r.sn)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
