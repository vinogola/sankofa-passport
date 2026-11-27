import { Component } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  /** Changing this (for example the path) clears a previous error. */
  resetKey?: string
}

export default class ErrorBoundary extends Component<Props, { failed: boolean; key?: string }> {
  state = { failed: false, key: this.props.resetKey }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: Props, state: { failed: boolean; key?: string }) {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-xl px-6 pb-24 pt-40 text-center" role="alert">
        <h1 className="font-display text-4xl">This page could not be shown</h1>
        <p className="mt-3 text-ivory/80">
          Something in this record could not be displayed. Check the code with the candidate, or go back to the start.
        </p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-gold-400 px-7 py-3 font-semibold text-navy-950 hover:bg-gold-300">
          Back to the start
        </Link>
      </div>
    )
  }
}
