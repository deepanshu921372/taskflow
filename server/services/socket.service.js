const { emitToBoard } = require('../socket');

const emitBoardUpdate = (boardId, board) => {
  emitToBoard(boardId, 'board:updated', { board });
};

const emitListCreated = (boardId, list) => {
  emitToBoard(boardId, 'list:created', { list });
};

const emitListUpdated = (boardId, list) => {
  emitToBoard(boardId, 'list:updated', { list });
};

const emitListDeleted = (boardId, listId) => {
  emitToBoard(boardId, 'list:deleted', { listId });
};

const emitTaskCreated = (boardId, task) => {
  emitToBoard(boardId, 'task:created', { task });
};

const emitTaskUpdated = (boardId, task) => {
  emitToBoard(boardId, 'task:updated', { task });
};

const emitTaskMoved = (boardId, task, fromList, toList) => {
  emitToBoard(boardId, 'task:moved', { task, fromList, toList });
};

const emitTaskDeleted = (boardId, taskId, listId) => {
  emitToBoard(boardId, 'task:deleted', { taskId, listId });
};

const emitMemberAdded = (boardId, user) => {
  emitToBoard(boardId, 'member:added', { user, boardId });
};

const emitMemberRemoved = (boardId, userId) => {
  emitToBoard(boardId, 'member:removed', { userId, boardId });
};

module.exports = {
  emitBoardUpdate,
  emitListCreated,
  emitListUpdated,
  emitListDeleted,
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskMoved,
  emitTaskDeleted,
  emitMemberAdded,
  emitMemberRemoved,
};
