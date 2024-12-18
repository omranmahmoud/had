import FooterSettings from '../models/FooterSettings.js';
import FooterLink from '../models/FooterLink.js';

// Get footer settings
export const getFooterSettings = async (req, res) => {
  try {
    let settings = await FooterSettings.findOne();
    if (!settings) {
      settings = await FooterSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update footer settings
export const updateFooterSettings = async (req, res) => {
  try {
    let settings = await FooterSettings.findOne();
    if (!settings) {
      settings = new FooterSettings();
    }

    Object.assign(settings, req.body);
    await settings.save();
    
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all footer links
export const getFooterLinks = async (req, res) => {
  try {
    const links = await FooterLink.find().sort('order');
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create footer link
export const createFooterLink = async (req, res) => {
  try {
    const link = new FooterLink(req.body);
    const savedLink = await link.save();
    res.status(201).json(savedLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update footer link
export const updateFooterLink = async (req, res) => {
  try {
    const link = await FooterLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!link) {
      return res.status(404).json({ message: 'Footer link not found' });
    }
    
    res.json(link);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete footer link
export const deleteFooterLink = async (req, res) => {
  try {
    const link = await FooterLink.findByIdAndDelete(req.params.id);
    
    if (!link) {
      return res.status(404).json({ message: 'Footer link not found' });
    }
    
    res.json({ message: 'Footer link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reorder footer links
export const reorderFooterLinks = async (req, res) => {
  try {
    const { links } = req.body;
    await Promise.all(
      links.map(({ id, order, section }) => 
        FooterLink.findByIdAndUpdate(id, { order, section })
      )
    );
    res.json({ message: 'Links reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};