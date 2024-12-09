import Product from '../models/Product.js';
import { convertPrice } from '../utils/currency.js';
import { validateProductData } from '../utils/validation.js';
import { handleProductImages } from '../utils/imageHandler.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { search, currency = 'USD' } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(query)
      .populate('relatedProducts')
      .populate({
        path: 'reviews.user',
        select: 'name email image'
      })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 });

    // Convert prices if needed
    if (currency !== 'USD') {
      const productsWithConvertedPrices = await Promise.all(
        products.map(async (product) => {
          const convertedProduct = product.toObject();
          convertedProduct.price = await convertPrice(product.price, 'USD', currency);
          if (product.originalPrice) {
            convertedProduct.originalPrice = await convertPrice(product.originalPrice, 'USD', currency);
          }
          return convertedProduct;
        })
      );
      return res.json(productsWithConvertedPrices);
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { currency = 'USD' } = req.query;
    
    const product = await Product.findById(req.params.id)
      .populate('relatedProducts')
      .populate({
        path: 'reviews.user',
        select: 'name email image'
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Convert prices if needed
    if (currency !== 'USD') {
      const convertedProduct = product.toObject();
      convertedProduct.price = await convertPrice(product.price, 'USD', currency);
      if (product.originalPrice) {
        convertedProduct.originalPrice = await convertPrice(product.originalPrice, 'USD', currency);
      }
      return res.json(convertedProduct);
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    // Parse price as float
    const formData = {
      ...req.body,
      price: parseFloat(req.body.price)
    };

    // Validate product data
    const { isValid, errors } = validateProductData(formData);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid product data', errors });
    }

    // Validate and process images
    const validatedImages = await handleProductImages(formData.images);

    // Convert price to USD for storage
    const priceInUSD = await convertPrice(formData.price, formData.currency || 'USD', 'USD');

    // Create product with converted price and validated images
    const product = new Product({
      ...formData,
      price: priceInUSD,
      images: validatedImages,
      order: formData.isFeatured ? await Product.countDocuments({ isFeatured: true }) : 0
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { currency = 'USD' } = req.body;
    let updateData = { ...req.body };

    // Convert price if provided
    if (updateData.price) {
      updateData.price = await convertPrice(
        parseFloat(updateData.price),
        currency,
        'USD'
      );
    }

    // Validate images if provided
    if (updateData.images) {
      updateData.images = await handleProductImages(updateData.images);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('relatedProducts');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { query, currency = 'USD' } = req.query;
    
    if (!query) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name price images category')
    .limit(12)
    .sort('-createdAt');

    // Convert prices if needed
    if (currency !== 'USD') {
      const convertedProducts = await Promise.all(
        products.map(async (product) => {
          const convertedProduct = product.toObject();
          convertedProduct.price = await convertPrice(product.price, 'USD', currency);
          return convertedProduct;
        })
      );
      return res.json(convertedProducts);
    }

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Failed to search products' });
  }
};

// Update related products
export const updateRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { relatedProducts: req.body.relatedProducts },
      { new: true }
    ).populate('relatedProducts');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating related products:', error);
    res.status(400).json({ message: error.message });
  }
};

// Reorder featured products
export const reorderFeaturedProducts = async (req, res) => {
  try {
    const { products } = req.body;
    await Promise.all(
      products.map(({ id, order }) => 
        Product.findByIdAndUpdate(id, { order })
      )
    );
    res.json({ message: 'Featured products reordered successfully' });
  } catch (error) {
    console.error('Error reordering featured products:', error);
    res.status(500).json({ message: 'Failed to reorder featured products' });
  }
};