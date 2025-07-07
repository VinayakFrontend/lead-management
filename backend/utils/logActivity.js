// utils/logActivity.js
const User = require('../models/User');

const logActivity = async (userId, message) => {
  await User.findByIdAndUpdate(userId, {
    $push: {
      activityLogs: {
        message,
        timestamp: new Date()
      }
    }
  });
};

module.exports = logActivity;
