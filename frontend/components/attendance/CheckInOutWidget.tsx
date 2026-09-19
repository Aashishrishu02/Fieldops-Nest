'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiClient } from '../../lib/api/client';
import { useToast } from '../ui/Toast';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../../lib/utils/cn';

interface CheckInOutWidgetProps {
  onStatusChange?: () => void;
}

export const CheckInOutWidget: React.FC<CheckInOutWidgetProps> = ({ onStatusChange }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const res = await apiClient.get<any>('/attendance/today');
      setTodayStatus(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<any>('/attendance/check-in', {
        notes: notes.trim() || undefined,
      });
      showToast(res.message || 'Checked in successfully', 'success');
      setNotes('');
      setShowNotesInput(false);
      await fetchTodayStatus();
      onStatusChange?.();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<any>('/attendance/check-out', {
        notes: notes.trim() || undefined,
      });
      showToast(res.message || 'Checked out successfully', 'success');
      setNotes('');
      setShowNotesInput(false);
      await fetchTodayStatus();
      onStatusChange?.();
    } catch (err: any) {
      showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckedIn = todayStatus?.hasRecord && !todayStatus?.checkOutTime;
  const isShiftComplete = todayStatus?.hasRecord && todayStatus?.checkOutTime;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Live Time & Shift State */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-slate-900 tracking-tight">
                {currentTime || '--:--:--'}
              </span>
              <span className="text-xs text-slate-400 font-medium">&bull; {currentDate}</span>
              {isCheckedIn && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Shift
                </span>
              )}
              {isShiftComplete && (
                <Badge variant="secondary">Shift Completed</Badge>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {!todayStatus?.hasRecord
                ? 'No active attendance punched for today.'
                : isCheckedIn
                ? `Clocked in at ${formatTime(todayStatus.checkInTime)}. Duration active.`
                : `Completed shift from ${formatTime(todayStatus.checkInTime)} to ${formatTime(todayStatus.checkOutTime)}.`}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {showNotesInput ? (
            <input
              type="text"
              placeholder="Optional punch note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNotesInput(true)}
              className="text-xs text-slate-500 hover:text-slate-800 transition"
            >
              + Note
            </button>
          )}

          {!todayStatus?.hasRecord ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCheckIn}
              isLoading={isLoading}
              icon={<LogIn className="w-3.5 h-3.5" />}
            >
              Clock In
            </Button>
          ) : isCheckedIn ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCheckOut}
              isLoading={isLoading}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              Clock Out
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shift Concluded</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
