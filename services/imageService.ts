/**
 * Image service for compressing and resizing images
 */

export interface ImageCompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.1 to 1.0
    maxSizeKB?: number; // Maximum file size in KB
}

/**
 * Compresses and resizes an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to a compressed File or Blob
 */
export const compressImage = async (
    file: File,
    options: ImageCompressionOptions = {}
): Promise<File> => {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        maxSizeKB = 500, // Default 500KB
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob with compression
                let targetQuality = quality;
                
                const compressToBlob = (quality: number): Promise<Blob> => {
                    return new Promise((res) => {
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) {
                                    reject(new Error('Failed to compress image'));
                                    return;
                                }
                                res(blob);
                            },
                            file.type || 'image/jpeg',
                            quality
                        );
                    });
                };

                // Compress with target quality first
                compressToBlob(targetQuality)
                    .then((blob) => {
                        const sizeKB = blob.size / 1024;
                        
                        // If still too large, reduce quality iteratively
                        if (sizeKB > maxSizeKB && targetQuality > 0.1) {
                            const reduceQuality = async (currentQuality: number): Promise<Blob> => {
                                const newQuality = Math.max(0.1, currentQuality - 0.1);
                                const compressedBlob = await compressToBlob(newQuality);
                                const compressedSizeKB = compressedBlob.size / 1024;
                                
                                if (compressedSizeKB > maxSizeKB && newQuality > 0.1) {
                                    return reduceQuality(newQuality);
                                }
                                return compressedBlob;
                            };
                            
                            reduceQuality(targetQuality)
                                .then((finalBlob) => {
                                    const finalFile = new File(
                                        [finalBlob],
                                        file.name,
                                        { type: file.type || 'image/jpeg' }
                                    );
                                    resolve(finalFile);
                                })
                                .catch(reject);
                        } else {
                            const finalFile = new File(
                                [blob],
                                file.name,
                                { type: file.type || 'image/jpeg' }
                            );
                            resolve(finalFile);
                        }
                    })
                    .catch(reject);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = event.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Creates a preview URL from a file
 * @param file - The file to create preview for
 * @returns Promise resolving to a data URL string
 */
export const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Validates if a file is an image
 * @param file - The file to validate
 * @returns true if the file is an image
 */
export const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
};

/**
 * Validates image file size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB (default: 10MB)
 * @returns true if file size is within limit
 */
export const validateImageSize = (file: File, maxSizeMB: number = 10): boolean => {
    return file.size <= maxSizeMB * 1024 * 1024;
};

