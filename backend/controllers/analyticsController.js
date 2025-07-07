const Lead = require('../models/Lead');
const User = require('../models/User');


exports.getAnalytics = async (req, res) => {
    try {
        const totalLeads = await Lead.countDocuments();

        const statusCounts = await Lead.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const agentStats = await Lead.aggregate([
            { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "agent"
                }
            },
            {
                $unwind: "$agent"
            },
            {
                $project: {
                    name: "$agent.name",
                    email: "$agent.email",
                    count: 1
                }
            }
        ]);

        const recentLeads = await Lead.find({})
            .sort({ updatedAt: -1 })
            .limit(10)
            .select("name status updatedAt assignedTo")
            .populate("assignedTo", "name");

        res.json({
            totalLeads,
            statusCounts,
            agentStats,
            recentLeads
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};
