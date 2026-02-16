import { useGetActivitiesQuery } from './activityApi';
import Spinner from '../../components/common/Spinner';

const ACTION_LABELS = {
  created: 'created',
  updated: 'updated',
  moved: 'moved',
  deleted: 'deleted',
  assigned: 'assigned user to',
  unassigned: 'unassigned user from',
  archived: 'archived',
};

const ACTION_COLORS = {
  created: 'bg-green-100 text-green-800',
  updated: 'bg-blue-100 text-blue-800',
  moved: 'bg-purple-100 text-purple-800',
  deleted: 'bg-red-100 text-red-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  unassigned: 'bg-orange-100 text-orange-800',
  archived: 'bg-gray-100 text-gray-800',
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

const ActivityPanel = ({ boardId, isOpen, onClose }) => {
  const { data, isLoading } = useGetActivitiesQuery(
    { boardId, limit: 50 },
    { skip: !isOpen }
  );

  const activities = data?.data || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner size="md" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                    {activity.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user?.name || 'Unknown'}</span>
                    {' '}
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[activity.action] || 'bg-gray-100 text-gray-800'}`}>
                      {ACTION_LABELS[activity.action] || activity.action}
                    </span>
                    {' '}
                    <span className="text-gray-600">{activity.entityType}</span>
                  </p>
                  {activity.entityTitle && (
                    <p className="text-sm text-gray-700 font-medium truncate mt-0.5">
                      "{activity.entityTitle}"
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;
