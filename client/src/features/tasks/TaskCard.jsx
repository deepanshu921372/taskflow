import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityConfig = {
  low: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
  high: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  urgent: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
};

const TaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white p-3 rounded-lg border border-gray-100 cursor-pointer hover:border-gray-200 transition-all group ${
        isDragging ? 'shadow-lg opacity-90 rotate-2' : 'shadow-sm'
      }`}
    >
      <h4 className="text-sm text-gray-800 mb-2 group-hover:text-gray-900">
        {task.title}
      </h4>

      <div className="flex items-center gap-2 flex-wrap">
        {task.priority && (
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {task.priority}
          </span>
        )}

        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {task.assignees?.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((user) => (
              <div
                key={user._id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-[10px] font-medium flex items-center justify-center ring-2 ring-white"
                title={user.name}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium flex items-center justify-center ring-2 ring-white">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
