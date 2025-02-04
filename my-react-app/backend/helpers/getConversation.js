import models from '../Models/ConversationModel.js';
import GroupModel from '../Models/GroupModel.js'; // Import GroupModel
const { ConversationModel } = models;

const getConversation = async (currentUserId) => {
  if (!currentUserId) {
    return [];
  }

  // Lấy các hội thoại cá nhân
  const currentUserConversation = await ConversationModel.find({
    $or: [
      { sender: currentUserId },
      { receiver: currentUserId }
    ]
  })
    .sort({ updatedAt: -1 })
    .populate('messages')
    .populate('sender')
    .populate('receiver');

  // Xử lý hội thoại cá nhân
  const personalConversations = currentUserConversation.map((conv) => {
    const countUnseenMsg = conv?.messages?.reduce((prev, curr) => {
      const msgByUserId = curr?.msgByUserId?.toString();
      if (msgByUserId !== currentUserId) {
        return prev + (curr?.seen ? 0 : 1);
      } else {
        return prev;
      }
    }, 0);

    return {
      id: conv?.id,
      mongoId: conv?.mongoId,
      sender: conv?.sender,
      receiver: conv?.receiver,
      unseenMsg: countUnseenMsg,
      lastMsg: conv.messages[conv?.messages?.length - 1],
      type: 'personal', // Đánh dấu hội thoại cá nhân
    };
  });

  // Lấy các nhóm mà người dùng tham gia
  const userGroups = await GroupModel.find({
    members: currentUserId
  })
    .sort({ updatedAt: -1 })
    .populate('messages')
    .populate('members');

  // Xử lý nhóm
  const groupConversations = userGroups.map((group) => {
    const countUnseenMsg = group?.messages?.reduce((prev, curr) => {
      const msgByUserId = curr?.msgByUserId?.toString();
      if (msgByUserId !== currentUserId) {
        return prev + (curr?.seen ? 0 : 1);
      } else {
        return prev;
      }
    }, 0);

    return {
      id: group?.id,
      fullname: group?.fullname, // Tên nhóm
      members: group?.members,
      unseenMsg: countUnseenMsg,
      lastMsg: group.messages[group?.messages?.length - 1],
      type: 'group', // Đánh dấu hội thoại nhóm
    };
  });

  // Kết hợp hội thoại cá nhân và nhóm
  return [...personalConversations, ...groupConversations];
};

export default getConversation;
