/**
 * 심플 캘린더 위젯 컴포넌트
 * FE 리드: 메인 캘린더 UI 구현
 * PM/UX: 사용자 인터랙션 및 반응형 디자인
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CalendarEvent, DateInfo, ThemeConfig, WidgetConfig } from '@/lib/types';
import { 
  generateCalendarDays, 
  groupEventsByDate, 
  getMonthName, 
  getWeekdayNames,
  cn,
  formatDate,
} from '@/lib/utils';
import { CalendarSkeleton } from './LoadingSpinner';

interface SimpleCalendarProps {
  configId: string;
  config?: WidgetConfig;
  theme?: ThemeConfig;
  initialYear?: number;
  initialMonth?: number;
}

export function SimpleCalendar({
  configId,
  config,
  theme,
  initialYear,
  initialMonth,
}: SimpleCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(initialYear || today.getFullYear());
  const [month, setMonth] = useState(initialMonth !== undefined ? initialMonth : today.getMonth());
  const [events, setEvents] = useState<Map<string, CalendarEvent[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [longPressDate, setLongPressDate] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // 이벤트 가져오기
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 미리보기 모드일 때는 샘플 데이터 표시
    if (configId === 'preview') {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      const sampleEvents: CalendarEvent[] = [
        // 오늘 날짜
        {
          id: 'sample-1',
          date: formatDate(today),
          title: '팀 미팅',
          isImportant: true,
          pageUrl: '#',
        },
        {
          id: 'sample-2',
          date: formatDate(today),
          title: '프로젝트 발표',
          isImportant: true,
          pageUrl: '#',
        },
        // 2일 - 중요 일정
        {
          id: 'sample-3',
          date: formatDate(new Date(currentYear, currentMonth, 2)),
          title: '중요 회의',
          isImportant: true,
          pageUrl: '#',
        },
        {
          id: 'sample-4',
          date: formatDate(new Date(currentYear, currentMonth, 2)),
          title: '고객 미팅',
          isImportant: true,
          pageUrl: '#',
        },
        // 15일 - 중요 일정
        {
          id: 'sample-5',
          date: formatDate(new Date(currentYear, currentMonth, 15)),
          title: '마감일',
          isImportant: true,
          pageUrl: '#',
        },
        // 23일 - 중요 일정
        {
          id: 'sample-6',
          date: formatDate(new Date(currentYear, currentMonth, 23)),
          title: '발표 준비',
          isImportant: true,
          pageUrl: '#',
        },
        // 일반 일정들
        {
          id: 'sample-7',
          date: formatDate(new Date(currentYear, currentMonth, 5)),
          title: '보고서 제출',
          isImportant: false,
          pageUrl: '#',
        },
        {
          id: 'sample-8',
          date: formatDate(new Date(currentYear, currentMonth, 10)),
          title: '회식',
          isImportant: false,
          pageUrl: '#',
        },
        {
          id: 'sample-9',
          date: formatDate(new Date(currentYear, currentMonth, 18)),
          title: '스터디',
          isImportant: false,
          pageUrl: '#',
        },
      ];
      
      const grouped = groupEventsByDate(sampleEvents);
      setEvents(grouped);
      setLoading(false);
      return;
    }
    
    // config prop이 있으면 서버 API를 통해 Notion 데이터 가져오기
    if (config) {
      try {
        const startDate = formatDate(new Date(year, month, 1));
        const endDate = formatDate(new Date(year, month + 1, 0));
        
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              token: config.notionConfig.apiKey,
              dbId: config.notionConfig.databaseId,
              dateProp: config.notionConfig.dateProperty,
              titleProp: config.notionConfig.titleProperty,
              scheduleProps: config.notionConfig.scheduleProperties,
              importantProp: config.notionConfig.importantProperty,
            },
            startDate,
            endDate,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        if (data.success) {
          const grouped = groupEventsByDate(data.data);
          setEvents(grouped);
        } else {
          setEvents(new Map());
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('일정을 불러올 수 없습니다.');
        setEvents(new Map());
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // 기존 API 호출 방식 (fallback)
    try {
      const startDate = formatDate(new Date(year, month, 1));
      const endDate = formatDate(new Date(year, month + 1, 0));
      
      const response = await fetch(
        `/api/events/${configId}?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const grouped = groupEventsByDate(data.data);
        setEvents(grouped);
      } else {
        setEvents(new Map());
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('일정을 불러올 수 없습니다.');
      setEvents(new Map());
    } finally {
      setLoading(false);
    }
  }, [configId, config, year, month]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 이전/다음 월 이동
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  // 마우스 호버 처리
  const handleMouseEnter = (e: React.MouseEvent, dateString: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setHoveredDate(dateString);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  // 터치 이벤트 처리 (모바일)
  const handleTouchStart = (dateString: string) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressDate(dateString);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 날짜 클릭 처리 (기능 제거됨)
  // const handleDateClick = (dateInfo: DateInfo) => {
  //   const dateEvents = events.get(dateInfo.dateString) || [];
  //   if (dateEvents.length > 0 && dateEvents[0].pageUrl) {
  //     window.open(dateEvents[0].pageUrl, '_blank');
  //   }
  // };

  // 캘린더 날짜 생성
  const calendarDays = generateCalendarDays(year, month);
  const weekdays = getWeekdayNames(true);

  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="calendar-widget" data-theme={theme}>
      <style jsx>{`
        .calendar-widget {
          font-family: ${theme?.fontFamily || 'system-ui, -apple-system, sans-serif'};
          background: ${theme?.backgroundColor || 'white'};
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          user-select: none;
          box-sizing: border-box;
        }
        
        .calendar-header {
          text-align: left;
          margin-top: 1.25rem;
          margin-bottom: 1.75rem;
        }
        
        .month-year {
          font-size: 2.25rem;
          font-weight: 700;
          color: ${theme?.primaryColor || '#2d3748'};
          letter-spacing: -0.02em;
          margin: 0;
          padding-left: 1.375rem;
        }
        
        .nav-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1.25rem;
        }
        
        .nav-button {
          background: none;
          border: 1px solid ${theme?.primaryColor || '#e2e8f0'};
          border-radius: 0.25rem;
          padding: 0.2rem 0.4rem;
          cursor: pointer;
          color: ${theme?.primaryColor || '#4a5568'};
          transition: all 0.2s;
          font-size: 0.7rem;
          min-width: 28px;
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .nav-button:hover {
          background: #f7fafc;
          border-color: ${theme?.primaryColor || '#4a5568'};
        }
        
        .nav-button:focus {
          outline: 2px solid ${theme?.primaryColor || '#4a5568'};
          outline-offset: 2px;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          width: 100%;
          box-sizing: border-box;
        }
        
        .weekday {
          text-align: center;
          font-size: 0.675rem;
          font-weight: 600;
          color: ${theme?.primaryColor || '#718096'};
          padding: 0.25rem 0;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          /* cursor: pointer; */ /* 클릭 기능 제거로 인해 제거됨 */
          transition: all 0.2s;
          position: relative;
          min-height: 40px;
          font-size: 1rem;
          font-weight: 500;
          box-sizing: border-box;
          gap: 0.25rem;
          isolation: isolate;
        }
        
        .calendar-day:hover {
          background: #f7fafc;
        }
        
        .calendar-day.not-current-month {
          color: #cbd5e0;
        }
        
        .calendar-day.weekend {
          color: #e53e3e;
        }
        
        .calendar-day.has-events::after {
          content: '';
          position: absolute;
          bottom: 1px;
          width: 4px;
          height: 4px;
          background: ${theme?.primaryColor || '#4a5568'};
          border-radius: 50%;
          z-index: 2;
        }
        
        .calendar-day.important::before {
          content: '';
          position: absolute;
          width: 75%;
          height: 75%;
          background: ${theme?.importantColor || '#ED64A6'};
          border-radius: 0.375rem;
          z-index: -1;
        }
        
        .calendar-day.important {
          color: white;
          font-weight: 600;
        }
        
        /* 오늘 날짜는 항상 기본 색상 (가장 높은 우선순위) */
        .calendar-day.today::before {
          content: '';
          position: absolute;
          width: 75%;
          height: 75%;
          background: ${theme?.primaryColor || '#4a5568'};
          border-radius: 0.375rem;
          z-index: -1;
        }
        
        .calendar-day.today {
          color: white !important;
          font-weight: 600;
        }
        
        .tooltip {
          position: fixed;
          background: white;
          border: none;
          border-radius: 0.65rem;
          padding: 0.35rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.05);
          z-index: 1000;
          pointer-events: none;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .tooltip-schedule {
          font-size: 0.625rem;
          color: #423D3D;
          background: ${theme?.primaryColor || '#4a5568'}66;
          padding: 0.25rem 0.45rem;
          border-radius: 0.35rem;
          line-height: 1.3;
          white-space: nowrap;
          font-weight: 500;
        }
        
        .tooltip-schedule.event--important {
          font-weight: 700 !important;
        }
        
        .error-message {
          text-align: center;
          padding: 1rem;
          color: #e53e3e;
          background: #fff5f5;
          border-radius: 0.25rem;
        }
        
        @media (max-width: 640px) {
          .calendar-widget {
            padding: 1rem;
            width: 100%;
            max-width: 100%;
          }
          
          .calendar-header {
            margin-top: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .month-year {
            font-size: 1.5rem;
          }
          
          .nav-buttons {
            margin-top: 1rem;
          }
          
          .nav-button {
            min-width: 32px;
            min-height: 32px;
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }
          
          .weekday {
            font-size: 0.625rem;
          }
          
          .calendar-day {
            font-size: 0.875rem;
            min-height: 34px;
          }
          
          .tooltip-schedule {
            font-size: 0.55rem;
            padding: 0.2rem 0.35rem;
          }
        }
        
        @media (max-width: 360px) {
          .calendar-widget {
            padding: 0.75rem;
          }
          
          .calendar-header {
            margin-top: 0.75rem;
            margin-bottom: 1.25rem;
          }
          
          .month-year {
            font-size: 1.25rem;
          }
          
          .nav-button {
            min-width: 28px;
            min-height: 28px;
            font-size: 0.7rem;
          }
          
          .weekday {
            font-size: 0.575rem;
          }
          
          .calendar-day {
            font-size: 0.8rem;
            min-height: 30px;
          }
        }
        
        @media (prefers-color-scheme: dark) {
          .calendar-widget {
            background: ${theme?.backgroundColor || '#1a202c'};
            color: #e2e8f0;
          }
          
          .month-year {
            color: ${theme?.primaryColor || '#e2e8f0'};
          }
          
          .nav-button {
            color: ${theme?.primaryColor || '#cbd5e0'};
            border-color: ${theme?.primaryColor || '#4a5568'};
          }
          
          .nav-button:hover {
            background: #2d3748;
          }
          
          .weekday {
            color: ${theme?.primaryColor || '#a0aec0'};
          }
          
          .calendar-day:hover {
            background: #2d3748;
          }
          
          .calendar-day.not-current-month {
            color: #4a5568;
          }
          
          /* 다크 모드에서도 오늘 날짜와 중요 일정은 동일한 스타일 (z-index: -1 유지) */
          .calendar-day.today::before {
            background: ${theme?.primaryColor || '#4a5568'};
            z-index: -1;
          }
          
          .calendar-day.important::before {
            background: ${theme?.importantColor || '#ED64A6'};
            z-index: -1;
          }
          
          .calendar-day.today,
          .calendar-day.important {
            color: white;
          }
          
          .tooltip {
            background: #2d3748;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(255, 255, 255, 0.1);
          }
          
          .tooltip-schedule {
            color: #423D3D;
            background: ${theme?.primaryColor || '#4a5568'}66;
          }
        }
      `}</style>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <div className="calendar-header">
        <h2 className="month-year">
          {getMonthName(month)}
        </h2>
      </div>
      
      <div className="calendar-grid">
        {weekdays.map((day, index) => (
          <div key={`weekday-${index}`} className="weekday">
            {day}
          </div>
        ))}
        
        {calendarDays.map((dayInfo) => {
          const dateEvents = events.get(dayInfo.dateString) || [];
          const hasImportant = dateEvents.some(e => e.isImportant);
          
          return (
            <div
              key={dayInfo.dateString}
              className={cn(
                'calendar-day',
                !dayInfo.isCurrentMonth && 'not-current-month',
                dayInfo.isWeekend && 'weekend',
                dayInfo.isToday && 'today',
                // 오늘이 아닐 때만 이벤트 하이라이트 적용
                !dayInfo.isToday && dateEvents.length > 0 && 'has-events',
                !dayInfo.isToday && hasImportant && 'important'
              )}
              // onClick={() => handleDateClick(dayInfo)} // 날짜 클릭 기능 제거됨
              onMouseEnter={(e) => dateEvents.length > 0 && handleMouseEnter(e, dayInfo.dateString)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => dateEvents.length > 0 && handleTouchStart(dayInfo.dateString)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              // role="button" // 클릭 기능 제거로 인해 제거됨
              // tabIndex={0} // 클릭 기능 제거로 인해 제거됨
              aria-label={`${dayInfo.date.getDate()}일 ${dateEvents.length > 0 ? `${dateEvents.length}개 일정` : '일정 없음'}`}
            >
              {dayInfo.date.getDate()}
            </div>
          );
        })}
      </div>
      
      <div className="nav-buttons">
        <button
          className="nav-button"
          onClick={() => navigateMonth('prev')}
          aria-label="이전 달"
        >
          ←
        </button>
        <button
          className="nav-button"
          onClick={() => fetchEvents()}
          aria-label="새로고침"
          title="새로고침"
        >
          ↻
        </button>
        <button
          className="nav-button"
          onClick={() => navigateMonth('next')}
          aria-label="다음 달"
        >
          →
        </button>
      </div>
      
      {(hoveredDate || longPressDate) && (
        <div
          className="tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          {(events.get(hoveredDate || longPressDate || '') || []).map((event) => (
            <div 
              key={event.id} 
              className={cn(
                'tooltip-schedule',
                event.isImportant && 'event--important'
              )}
              style={{
                background: event.isImportant 
                  ? `${theme?.importantColor || theme?.primaryColor || '#4a5568'}66`
                  : `${theme?.primaryColor || '#4a5568'}66`,
                fontWeight: event.isImportant ? 700 : 500
              }}
            >
              {event.title}
            </div>
          ))}
        </div>
      )}
      
      {longPressDate && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onTouchEnd={() => setLongPressDate(null)}
        />
      )}
    </div>
  );
}

