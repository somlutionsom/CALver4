/**
 * 에러 경계 컴포넌트
 * FE 리드: React Error Boundary 구현
 * PM/UX: 사용자 친화적 에러 화면
 */

'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="error-container" role="alert" aria-live="assertive">
          <style jsx>{`
            .error-container {
              padding: 2rem;
              text-align: center;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .error-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            h2 {
              color: #e53e3e;
              margin-bottom: 0.5rem;
              font-size: 1.25rem;
            }
            p {
              color: #4a5568;
              margin-bottom: 1.5rem;
            }
            button {
              background: #4a5568;
              color: white;
              padding: 0.5rem 1.5rem;
              border-radius: 0.25rem;
              border: none;
              cursor: pointer;
              font-size: 1rem;
              transition: background 0.2s;
            }
            button:hover {
              background: #2d3748;
            }
            button:focus {
              outline: 2px solid #4a5568;
              outline-offset: 2px;
            }
          `}</style>
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <h2>문제가 발생했습니다</h2>
          <p>일시적인 문제가 발생했습니다. 다시 시도해주세요.</p>
          <button
            onClick={this.handleReset}
            aria-label="다시 시도"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

