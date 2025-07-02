"use client"

import { useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Listbox } from '@headlessui/react'

interface ComboboxOption {
  value: string
  label: string
  count?: number
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  loading?: boolean
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  loading = false
}: ComboboxProps) {
  const [query] = useState('')

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
        option.label
          .toLowerCase()
          .replace(/\W/g, '')
          .includes(query.toLowerCase().replace(/\W/g, ''))
      )

  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                <span className="block truncate">
                  {value
                    ? options.find((option) => option.value === value)?.label || value
                    : placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              {open && !loading && (
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}`
                      }
                      value={option.value}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            <span
                              className={`font-normal ${selected ? 'font-semibold' : 'font-normal'
                                }`}
                            >
                              {option.label}
                            </span>
                            {option.count !== undefined && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({option.count})
                              </span>
                            )}
                          </div>

                          {selected ? (
                            <span
                              className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-indigo-600' : 'text-indigo-600'
                                }`}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              )}
            </div>
          </>
        )}
      </Listbox>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 opacity-75">
          <div className="animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] h-5 w-5 border-gray-400"></div>
        </div>
      )}
    </div>
  )
}

