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
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!name.trim() || !email.trim() || !company.trim()) {
      setStatus('error')
      setErrorMessage('Please fill in all required fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, company, message }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setName('')
        setEmail('')
        setCompany('')
        setMessage('')
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/75 backdrop-blur-xl transition-opacity duration-300"
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
          border-color: rgba(160, 124, 74, 0.5) !important;
          box-shadow: 0 0 0 1px rgba(160, 124, 74, 0.25) !important;
        }
      `}</style>
      <div
        ref={modalRef}
        className="relative w-full max-w-[460px] overflow-hidden rounded-xl border border-white/8 bg-[#0E1427]/90 p-8 shadow-[0_24px_48px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-[#CBC1B5]/50 transition-colors duration-200 hover:bg-white/5 hover:text-white"
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
            src="/logo.png"
            alt="Unotusk"
            className="mx-auto mb-3 h-8 w-auto brightness-0 invert"
            style={{ opacity: 0.95 }}
          />
          <h2
            id="modal-title"
            style={{
              ...fontMono,
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#A07C4A',
            }}
          >
            Request Early Access
          </h2>
        </div>

        {status === 'success' ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#A07C4A]/10 text-[#A07C4A]">
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
                color: '#CBC1B5',
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
                color: 'rgba(203, 193, 181, 0.7)',
                marginBottom: '1.8rem',
              }}
            >
              Thank you for your interest. We review every request personally and will reach out to you shortly.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-md border border-[#CBC1B5]/15 bg-[#CBC1B5]/5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[#CBC1B5]/90 transition-colors duration-200 hover:bg-[#CBC1B5]/10 hover:text-white"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                style={{
                  ...fontMono,
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#A07C4A',
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
                className="w-full rounded border border-white/8 bg-[#0B1020]/40 px-3.5 py-2 text-sm text-[#CBC1B5] outline-none transition-all duration-300 placeholder:text-[#CBC1B5]/30 focus:border-[#A07C4A]/50 focus:bg-[#0B1020]/60 focus:shadow-[0_0_0_1px_rgba(160,124,74,0.2)]"
                placeholder="e.g. Dilip Kumar"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                style={{
                  ...fontMono,
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#A07C4A',
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
                className="w-full rounded border border-white/8 bg-[#0B1020]/40 px-3.5 py-2 text-sm text-[#CBC1B5] outline-none transition-all duration-300 placeholder:text-[#CBC1B5]/30 focus:border-[#A07C4A]/50 focus:bg-[#0B1020]/60 focus:shadow-[0_0_0_1px_rgba(160,124,74,0.2)]"
                placeholder="you@company.com"
              />
            </div>

            {/* Company Field */}
            <div className="space-y-1">
              <label
                htmlFor="company"
                style={{
                  ...fontMono,
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#A07C4A',
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
                className="w-full rounded border border-white/8 bg-[#0B1020]/40 px-3.5 py-2 text-sm text-[#CBC1B5] outline-none transition-all duration-300 placeholder:text-[#CBC1B5]/30 focus:border-[#A07C4A]/50 focus:bg-[#0B1020]/60 focus:shadow-[0_0_0_1px_rgba(160,124,74,0.2)]"
                placeholder="e.g. Unotusk Inc."
              />
            </div>

            {/* Message Field */}
            <div className="space-y-1">
              <label
                htmlFor="message"
                style={{
                  ...fontMono,
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#A07C4A',
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
                className="w-full resize-none rounded border border-white/8 bg-[#0B1020]/40 px-3.5 py-2 text-sm text-[#CBC1B5] outline-none transition-all duration-300 placeholder:text-[#CBC1B5]/30 focus:border-[#A07C4A]/50 focus:bg-[#0B1020]/60 focus:shadow-[0_0_0_1px_rgba(160,124,74,0.2)]"
                placeholder="Tell us a bit about your product or team memory challenges..."
              />
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div
                className="rounded border border-red-500/20 bg-red-950/20 px-3.5 py-2 text-center text-xs text-red-400"
                style={{ ...fontMono }}
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative w-full rounded bg-[#A07C4A] py-3 text-center font-mono text-[10px] font-semibold uppercase tracking-widest text-[#0B1020] transition-all duration-300 hover:bg-[#b08d5b] hover:shadow-[0_0_16px_rgba(160,124,74,0.35)] disabled:opacity-50"
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
