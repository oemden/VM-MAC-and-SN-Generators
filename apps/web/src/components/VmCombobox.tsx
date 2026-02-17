import { useState, useEffect, useRef, useCallback } from 'react'
import { API_URL } from '../lib/api'

export interface Vm {
  id: number
  name: string
}

interface VmComboboxProps {
  value: string
  onChange: (value: string, vmId?: number) => void
  placeholder?: string
}

export function VmCombobox({ value, onChange, placeholder = 'Select or type VM name' }: VmComboboxProps) {
  const [vms, setVms] = useState<Vm[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/vms`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.vms)) {
          setVms(data.vms)
        }
      })
      .catch(() => setVms([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = value.trim()
    ? vms.filter((v) => v.name.toLowerCase().includes(value.toLowerCase()))
    : vms
  const exactMatch = value.trim() && vms.some((v) => v.name.toLowerCase() === value.trim().toLowerCase())
  const showCreateOption = value.trim() && !exactMatch

  const handleSelect = useCallback(
    (name: string, id?: number) => {
      onChange(name, id)
      setOpen(false)
    },
    [onChange]
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="vm-combobox">
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (
        <ul className="vm-combobox-dropdown" role="listbox">
          {loading ? (
            <li className="vm-combobox-item vm-combobox-item--muted">Loading...</li>
          ) : filtered.length === 0 && !showCreateOption ? (
            <li className="vm-combobox-item vm-combobox-item--muted">No VMs found</li>
          ) : (
            <>
              {filtered.map((vm) => (
                <li
                  key={vm.id}
                  className="vm-combobox-item"
                  role="option"
                  onClick={() => handleSelect(vm.name, vm.id)}
                >
                  {vm.name}
                </li>
              ))}
              {showCreateOption && (
                <li
                  className="vm-combobox-item vm-combobox-item--create"
                  role="option"
                  onClick={() => handleSelect(value.trim())}
                >
                  Create &quot;{value.trim()}&quot;
                </li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  )
}
