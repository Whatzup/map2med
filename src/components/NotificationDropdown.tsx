import React, { useRef, useEffect } from 'react';
import { useCareX } from '../context/CareXContext';
import { AppNotification } from '../types/carex';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  RefreshCw, 
  X, 
  Truck, 
  Activity, 
  Calendar, 
  AlertTriangle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadNotifCount, 
    markNotificationRead, 
    markAllNotificationsRead, 
    clearAllNotifications, 
    fetchNotifications,
    setActiveTab,
    activeRole
  } = useCareX();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'dispatch':
        return (
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        );
      case 'vitals':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        );
      case 'emergency':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'booking':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Recently';
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const handleOpenRelevantPortal = (n: AppNotification) => {
    markNotificationRead(n.id);
    onClose();
    if (activeRole === 'provider') {
      setActiveTab('provider-portal');
    } else if (activeRole === 'admin') {
      setActiveTab('admin-portal');
    } else {
      setActiveTab('patient-portal');
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[92vw] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left"
      role="dialog"
      aria-label="Notifications and Dispatch Alerts"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-heading">Dispatch &amp; Alerts</h3>
              {unreadNotifCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                  {unreadNotifCount} new
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                  All read
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-300">Live triage, appointments &amp; clinical dispatches</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            title="Refresh from server"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action bar if notifications exist */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span>{notifications.length} total alert{notifications.length === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-3">
            {unreadNotifCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={clearAllNotifications}
              className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Clear notification list"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">All caught up!</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[240px] mx-auto">
              No new dispatch alerts or notifications. All home appointments, specialist arrival updates, and vitals appear right here under this bell icon.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 transition-colors relative flex items-start gap-3 hover:bg-slate-50/80 ${
                notif.isRead ? 'bg-white' : 'bg-amber-50/40'
              }`}
            >
              {getNotificationIcon(notif.type)}

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {notif.body}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                  <button
                    onClick={() => handleOpenRelevantPortal(notif)}
                    className="text-[10px] text-teal-700 hover:text-teal-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View in Portal</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-[10px] text-slate-500 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Hostinger MySQL Dispatch Sync</span>
        </div>
        <button
          onClick={() => {
            onClose();
            setActiveTab(activeRole === 'patient' ? 'patient-portal' : activeRole === 'provider' ? 'provider-portal' : 'admin-portal');
          }}
          className="text-xs font-bold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Open Full Dashboard</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
