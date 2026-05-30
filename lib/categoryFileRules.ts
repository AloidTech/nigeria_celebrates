export const categoryFileRules: Record<
    string,
    {
        allowedTypes: string[];
        allowedExtensions: string[];
        label: string;
        hint: string;
    }
> = {
    'Music / Songs': {
        allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'video/mp4', 'video/quicktime'],
        allowedExtensions: ['.mp3', '.wav', '.m4a', '.mp4', '.mov'],
        label: 'Audio or Video',
        hint: 'Accepted: MP3, WAV, M4A, MP4, MOV'
    },
    'Football Freestyle': {
        allowedTypes: ['video/mp4', 'video/quicktime'],
        allowedExtensions: ['.mp4', '.mov'],
        label: 'Video only',
        hint: 'Accepted: MP4, MOV — Max 1m 30s'
    },
    'Basketball Freestyle': {
        allowedTypes: ['video/mp4', 'video/quicktime'],
        allowedExtensions: ['.mp4', '.mov'],
        label: 'Video only',
        hint: 'Accepted: MP4, MOV — Max 1m 30s'
    },
    'Comedy Skits': {
        allowedTypes: ['video/mp4', 'video/quicktime'],
        allowedExtensions: ['.mp4', '.mov'],
        label: 'Video only',
        hint: 'Accepted: MP4, MOV — Max 1m 30s'
    },
    'Artwork (Handmade Only)': {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
        label: 'Images only',
        hint: 'Accepted: JPG, PNG, WEBP — Physical artwork photos only'
    },
    'Fashion Showcase': {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'],
        label: 'Image or Video',
        hint: 'Accepted: JPG, PNG, MP4, MOV'
    },
    'My Nigeria Story': {
        allowedTypes: ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'],
        allowedExtensions: ['.mp4', '.mov', '.jpg', '.png'],
        label: 'Video or Image',
        hint: 'Accepted: MP4, MOV, JPG, PNG'
    },
    Photography: {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.tiff'],
        label: 'Images only',
        hint: 'Accepted: JPG, PNG, WEBP, TIFF'
    },
    'Tech Innovation': {
        allowedTypes: ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'],
        allowedExtensions: ['.mp4', '.mov', '.jpg', '.png'],
        label: 'Video or Image',
        hint: 'Accepted: MP4, MOV, JPG, PNG — demos, screenshots, prototypes'
    },
    'Logo Design': {
        allowedTypes: ['image/png', 'image/svg+xml', 'image/jpeg'],
        allowedExtensions: ['.png', '.svg', '.jpg', '.jpeg'],
        label: 'Images only',
        hint: 'Accepted: PNG, SVG, JPG — No videos accepted'
    }
};

export const defaultFileRules = {
    allowedTypes: ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'],
    allowedExtensions: ['.mp4', '.mov', '.jpg', '.png'],
    label: 'Video or Image',
    hint: 'Select a category first to see accepted formats'
};
