/**
 * 로딩 컴포넌트
 * PM/UX: 로딩 상태 표시
 * FE 리드: 재사용 가능한 스피너
 */

'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  color = '#4A5568',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  return (
    <div
      className={`spinner-container ${fullScreen ? 'fullscreen' : ''}`}
      role="status"
      aria-live="polite"
    >
      <style jsx>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .spinner-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          z-index: 9999;
        }
        
        .spinner {
          border: 3px solid #e2e8f0;
          border-top-color: ${color};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .spinner-small {
          width: 24px;
          height: 24px;
        }
        
        .spinner-medium {
          width: 40px;
          height: 40px;
        }
        
        .spinner-large {
          width: 56px;
          height: 56px;
        }
        
        .message {
          margin-top: 1rem;
          color: #4a5568;
          font-size: 0.875rem;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .spinner {
            animation: none;
            border-top-color: transparent;
            border-right-color: ${color};
          }
        }
      `}</style>
      <div className={`spinner ${sizeClasses[size]}`} aria-hidden="true" />
      {message && (
        <p className="message">
          <span className="sr-only">로딩 중:</span>
          {message}
        </p>
      )}
      <span className="sr-only">로딩 중입니다. 잠시 기다려주세요.</span>
    </div>
  );
}

// 스켈레톤 로더 컴포넌트
export function CalendarSkeleton() {
  return (
    <div className="calendar-skeleton" role="status" aria-label="캘린더 로딩 중">
      <style jsx>{`
        .calendar-skeleton {
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
        }
        
        .header {
          height: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
        }
        
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .weekday {
          height: 24px;
          background: #f7f7f7;
          border-radius: 0.25rem;
        }
        
        .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
        
        .day {
          aspect-ratio: 1;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 0.25rem;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
      <div className="header" />
      <div className="weekdays">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="weekday" />
        ))}
      </div>
      <div className="days">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="day" />
        ))}
      </div>
    </div>
  );
}

