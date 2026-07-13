'use client'

import React, { useState, useEffect, useRef } from 'react'

interface EarlyAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EarlyAccessModal({ isOpen, onClose }: EarlyAccessModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; company?: string }>({})

  const modalRef = useRef<HTMLDivElement>(null)

  // Freeze background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset form when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle')
      setErrorMessage('')
      setName('')
      setEmail('')
      setCompany('')
      setMessage('')
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const validateForm = () => {
    const tempErrors: { name?: string; email?: string; company?: string } = {}
    if (!name.trim()) {
      tempErrors.name = 'Full Name is required.'
    }
    if (!email.trim()) {
      tempErrors.email = 'Work Email is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        tempErrors.email = 'Please enter a valid email address.'
      }
    }
    if (!company.trim()) {
      tempErrors.company = 'Company is required.'
    }
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!validateForm()) {
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light')
      const theme = isLight ? 'light' : 'dark'

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, company, message, theme }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setName('')
        setEmail('')
        setCompany('')
        setMessage('')
        setErrors({})
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  // Common styles
  const fontSerif = { fontFamily: "var(--font-young-serif), 'Young Serif', Georgia, serif" }
  const fontMono = { fontFamily: 'var(--font-inter), sans-serif' }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <style>{`
        input:focus, textarea:focus {
          outline: none !important;
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 0 1px var(--color-accent) !important;
        }
      `}</style>
      <div
        ref={modalRef}
        className="relative w-full max-w-[460px] overflow-hidden rounded-xl border border-border p-8 transition-all duration-300"
        style={{
          background: 'var(--color-card-bg)',
          boxShadow: '0 32px 80px var(--color-card-shadow)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-primary/50 transition-colors duration-200 hover:bg-primary/5 hover:text-primary"
          aria-label="Close modal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M13 1L1 13M1 1L13 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Logo and Header */}
        <div className="mb-6 text-center">
          <img
            src="/logo.svg"
            alt="Unotusk"
            className="mx-auto mb-3 h-10 w-auto"
            style={{ filter: 'var(--color-logo-filter)', opacity: 0.95 }}
          />
          <h2
            id="modal-title"
            style={{
              ...fontMono,
              fontSize: '0.9rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}
          >
            Request Early Access
          </h2>
        </div>

        {status === 'success' ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              style={{
                ...fontSerif,
                fontSize: '1.4rem',
                color: 'var(--color-text-primary)',
                marginBottom: '0.75rem',
              }}
            >
              Request Submitted
            </h3>
            <p
              style={{
                ...fontMono,
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                marginBottom: '1.8rem',
              }}
            >
              Thank you for your interest. We review every request personally and will reach out to you shortly.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-md border border-primary/15 bg-primary/5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-primary/90 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name Field */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                style={{
                  ...fontMono,
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={status === 'loading'}
                className={`w-full rounded border bg-card/45 px-3.5 py-2 text-sm text-primary outline-none transition-all duration-300 placeholder:text-primary/45 focus:bg-card/65 ${errors.name
                    ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border-border focus:border-accent/50 focus:shadow-[0_0_0_1px_var(--color-accent)]'
                  }`}
                placeholder="e.g. Dilip Kumar"
              />
              {errors.name && (
                <p className="text-[10px] text-red-500 mt-1 font-mono tracking-wide">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                style={{
                  ...fontMono,
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                }}
              >
                Work Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                className={`w-full rounded border bg-card/45 px-3.5 py-2 text-sm text-primary outline-none transition-all duration-300 placeholder:text-primary/45 focus:bg-card/65 ${errors.email
                    ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border-border focus:border-accent/50 focus:shadow-[0_0_0_1px_var(--color-accent)]'
                  }`}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 mt-1 font-mono tracking-wide">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Company Field */}
            <div className="space-y-1">
              <label
                htmlFor="company"
                style={{
                  ...fontMono,
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                }}
              >
                Company *
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                disabled={status === 'loading'}
                className={`w-full rounded border bg-card/45 px-3.5 py-2 text-sm text-primary outline-none transition-all duration-300 placeholder:text-primary/45 focus:bg-card/65 ${errors.company
                    ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border-border focus:border-accent/50 focus:shadow-[0_0_0_1px_var(--color-accent)]'
                  }`}
                placeholder="e.g. Unotusk Inc."
              />
              {errors.company && (
                <p className="text-[10px] text-red-500 mt-1 font-mono tracking-wide">
                  {errors.company}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-1">
              <label
                htmlFor="message"
                style={{
                  ...fontMono,
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                }}
              >
                Message / Context (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === 'loading'}
                rows={3}
                className="w-full resize-none rounded border border-border bg-card/45 px-3.5 py-2 text-sm text-primary outline-none transition-all duration-300 placeholder:text-primary/45 focus:border-accent/50 focus:bg-card/65 focus:shadow-[0_0_0_1px_var(--color-accent)]"
                placeholder="Tell us a bit about your product or team memory challenges..."
              />
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div
                className="rounded border border-red-500/20 bg-red-500/5 dark:bg-red-950/20 px-3.5 py-2 text-center text-xs text-red-600 dark:text-red-400"
                style={{ ...fontMono }}
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative w-full rounded bg-accent py-3 text-center font-mono text-[12px] font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:brightness-110 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting Request...
                </span>
              ) : (
                'Request Access →'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
