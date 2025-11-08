import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
          <div className='max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center'>
            <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4'>
              <AlertTriangle className='w-8 h-8 text-red-600' />
            </div>
            <h1 className='text-2xl font-semibold text-gray-900 mb-2'>Oops! Something went wrong</h1>
            <p className='text-gray-600 mb-6'>
              We encountered an unexpected error. Don't worry, we're on it!
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className='mb-6 text-left'>
                <summary className='cursor-pointer text-sm text-gray-500 mb-2'>Error Details</summary>
                <pre className='text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40'>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className='flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition'
            >
              <RefreshCw className='w-5 h-5' />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
