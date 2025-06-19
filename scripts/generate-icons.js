const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG icon template
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.1}"/>
  <rect x="${size * 0.15}" y="${size * 0.2}" width="${size * 0.7}" height="${size * 0.1}" fill="white" rx="${size * 0.02}"/>
  <rect x="${size * 0.15}" y="${size * 0.35}" width="${size * 0.5}" height="${size * 0.08}" fill="white" rx="${size * 0.02}"/>
  <rect x="${size * 0.15}" y="${size * 0.48}" width="${size * 0.6}" height="${size * 0.08}" fill="white" rx="${size * 0.02}"/>
  <rect x="${size * 0.15}" y="${size * 0.61}" width="${size * 0.4}" height="${size * 0.08}" fill="white" rx="${size * 0.02}"/>
  <circle cx="${size * 0.2}" cy="${size * 0.78}" r="${size * 0.04}" fill="#10b981"/>
  <circle cx="${size * 0.35}" cy="${size * 0.78}" r="${size * 0.04}" fill="#f59e0b"/>
  <circle cx="${size * 0.5}" cy="${size * 0.78}" r="${size * 0.04}" fill="#ef4444"/>
</svg>
`;

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Generating PWA icons...');

sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent.trim());
  console.log(`✅ Created ${filename}`);
});

// Create a simple PNG fallback (this would normally be done with a proper image library)
// For now, we'll create placeholder files
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // Create a simple placeholder file (in a real app, you'd convert SVG to PNG)
  const svgContent = createSVGIcon(size);
  fs.writeFileSync(filepath.replace('.png', '.svg'), svgContent.trim());
  
  // Copy SVG as PNG placeholder (browsers will handle SVG icons fine)
  fs.copyFileSync(filepath.replace('.png', '.svg'), filepath.replace('.png', '.png.svg'));
  console.log(`📋 Created placeholder for ${filename}`);
});

console.log('🎉 Icon generation complete!');
console.log('📁 Icons saved to:', iconsDir);
