import { useState } from 'react'
import { API_URL } from '../lib/api'
import { SaveResultsForm } from './SaveResultsForm'

interface MacResult {
  mac: string
  uppercase?: string
  lowercase?: string
}

interface MacOptions {
  count: number
  case: 'upper' | 'lower' | 'both'
  delimiter: string
  random: boolean
}

export function MacGenerator() {
  const [options, setOptions] = useState<MacOptions>({
    count: 1,
    case: 'lower',
    delimiter: ':',
    random: false
  })
  const [results, setResults] = useState<MacResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/mac/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: options.count,
          case: options.case,
          delimiter: options.delimiter === 'none' ? '' : options.delimiter,
          random: options.random
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
    const text = results.map((r) => r.mac).join('\n')
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
        <div className="card-icon mac">M</div>
        <div>
          <div className="card-title">MAC Address</div>
          <div className="card-subtitle">VMware compatible</div>
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
                  <label className="form-label">Case</label>
                  <select
                    className="form-select"
                    value={options.case}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        case: e.target.value as 'upper' | 'lower' | 'both'
                      })
                    }
                  >
                    <option value="lower">Lowercase</option>
                    <option value="upper">Uppercase</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Delimiter</label>
                  <select
                    className="form-select"
                    value={options.delimiter}
                    onChange={(e) =>
                      setOptions({ ...options, delimiter: e.target.value })
                    }
                  >
                    <option value=":">Colon (:)</option>
                    <option value="-">Dash (-)</option>
                    <option value=".">Dot (.)</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={options.random ? 'random' : 'vmware'}
                    onChange={(e) =>
                      setOptions({ ...options, random: e.target.value === 'random' })
                    }
                  >
                    <option value="vmware">VMware</option>
                    <option value="random">Random (Lab)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={generate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate MAC'}
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
                      <span className="result-value">{result.mac}</span>
                      <button
                        className={`copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(result.mac, index)}
                      >
                        {copiedIndex === index ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="save-results-section">
                <SaveResultsForm
                  type="mac"
                  values={results.map((r) => r.mac)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
