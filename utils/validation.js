export async function validateImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/');
  } catch (error) {
    return false;
  }
}

export function validateProductData(data) {
  const errors = [];

  // Required fields
  if (!data.name?.trim()) {
    errors.push('Product name is required');
  }

  if (!data.description?.trim()) {
    errors.push('Product description is required');
  }

  if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
    errors.push('Valid price is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  // Validate arrays
  if (!Array.isArray(data.images) || data.images.length === 0) {
    errors.push('At least one product image is required');
  }

  if (!Array.isArray(data.colors) || data.colors.length === 0) {
    errors.push('At least one color is required');
  } else {
    data.colors.forEach((color, index) => {
      if (!color.name?.trim()) {
        errors.push(`Color name is required for color #${index + 1}`);
      }
      if (!validateHexColor(color.code)) {
        errors.push(`Invalid color code for ${color.name || `color #${index + 1}`}`);
      }
    });
  }

  if (!Array.isArray(data.sizes) || data.sizes.length === 0) {
    errors.push('At least one size is required');
  } else {
    data.sizes.forEach((size, index) => {
      if (!size.name?.trim()) {
        errors.push(`Size name is required for size #${index + 1}`);
      }
      if (typeof size.stock !== 'number' || size.stock < 0) {
        errors.push(`Invalid stock quantity for ${size.name || `size #${index + 1}`}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateHexColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function validateReviewData(data) {
  const errors = [];

  if (!data.rating || isNaN(data.rating) || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!data.comment?.trim()) {
    errors.push('Review comment is required');
  } else if (data.comment.length < 10) {
    errors.push('Review comment must be at least 10 characters long');
  }

  if (data.photos) {
    if (!Array.isArray(data.photos)) {
      errors.push('Photos must be provided as an array');
    } else if (data.photos.length > 5) {
      errors.push('Maximum 5 photos allowed per review');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}