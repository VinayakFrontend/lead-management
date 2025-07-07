const XLSX = require('xlsx');
const fs = require('fs');
const Lead = require('../models/Lead');
const User = require('../models/User');
const mongoose = require('mongoose');
// Needed to find agents by name

exports.getLeads = async (req, res) => {
  const { status, tag, from, to, assignedTo, search } = req.query;
  const user = req.user;

  const query = {};

  try {
    // Support agents see only their leads
    if (user.role === 'support-agent') {
      query.assignedTo = user._id;
    }

   //  Admins can filter by assignedTo (agent ID)
    if (assignedTo && user.role !== 'support-agent') {
      query.assignedTo = assignedTo;
    }

    //  Filter by lead status
    if (status) {
      query.status = status;
    }

    //  Filter by tag
    if (tag) {
      query.tags = tag;
    }

    //  Filter by creation date range
    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // Global text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    //  Fetch and populate assigned agent
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('comments.createdBy', 'name email') // if you're using comments
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (err) {
    console.error('Lead fetch failed:', err);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};



// Get single lead
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID format' });
  }
};

// Create new lead
exports.createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json({ message: 'Lead created', lead });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create lead', error: err.message });
  }
};




exports.updateLead = async (req, res) => {
  const user = req.user;

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  //  Restrict access for support-agent
  if (user.role === 'support-agent' && lead.assignedTo?.toString() !== user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this lead' });
  }

  //  Prevent support-agents from reassigning
  if (user.role === 'support-agent' && req.body.assignedTo && req.body.assignedTo !== user._id.toString()) {
    delete req.body.assignedTo;
  }

  const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: 'Lead updated', lead: updated });
};




exports.deleteLead = async (req, res) => {
  const user = req.user;

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  if (user.role === 'support-agent') {
    return res.status(403).json({ message: 'Not authorized to delete leads' });
  }

  await Lead.findByIdAndDelete(req.params.id);
  res.json({ message: 'Lead deleted' });
};


// Add a comment to a lead
exports.addComment = async (req, res) => {
  const { text } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  lead.comments.push({ text });
  await lead.save();

  res.json({ message: 'Comment added', comments: lead.comments });
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  lead.comments = lead.comments.filter(c => c._id.toString() !== req.params.commentId);
  await lead.save();

  res.json({ message: 'Comment deleted', comments: lead.comments });
};

// Add a tag to lead
exports.addTag = async (req, res) => {
  const { tag } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  if (!lead.tags.includes(tag)) lead.tags.push(tag);
  await lead.save();

  res.json({ message: 'Tag added', tags: lead.tags });
};

// Remove a tag
exports.removeTag = async (req, res) => {
  const { tag } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  lead.tags = lead.tags.filter(t => t !== tag);
  await lead.save();

  res.json({ message: 'Tag removed', tags: lead.tags });
};

// Import leads from Excel
exports.importLeads = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const leads = data.map(row => ({
      name: row.Name,
      email: row.Email || '',
      phone: row.Phone || '',
      source: row.Source || '',
      status: row.Status || 'New',
      tags: row.Tags ? row.Tags.split(',').map(t => t.trim()) : []
    }));

    await Lead.insertMany(leads);
    fs.unlinkSync(filePath); // Delete file after import

    res.json({ message: 'Leads imported successfully', count: leads.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Import failed' });
  }
};

// Export leads to Excel (filtered)


exports.exportLeadsToExcel = async (req, res) => {
  try {
    const { filters = {}, fields = [] } = req.body;
    const user = req.user;

    const query = {};

    if (user.role === 'support-agent') {
      query.assignedTo = user._id;
    } else {
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    }

    if (filters.status) query.status = filters.status;
    if (filters.tag) query.tags = filters.tag;
    if (filters.from && filters.to) {
      query.createdAt = {
        $gte: new Date(filters.from),
        $lte: new Date(filters.to)
      };
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query).populate('assignedTo', 'name');

    if (!leads.length) {
      return res.status(400).json({ message: 'No leads found to export' });
    }

    const exportData = leads.map(lead => {
      const row = {};
      if (fields.includes('name')) row.Name = lead.name;
      if (fields.includes('email')) row.Email = lead.email;
      if (fields.includes('phone')) row.Phone = lead.phone;
      if (fields.includes('source')) row.Source = lead.source;
      if (fields.includes('status')) row.Status = lead.status;
      if (fields.includes('tags')) row.Tags = lead.tags.join(', ');
      if (fields.includes('assignedTo')) row.AssignedTo = lead.assignedTo?.name || '';
      if (fields.includes('createdAt')) row.CreatedAt = lead.createdAt.toISOString();
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Failed to export leads' });
  }
};
