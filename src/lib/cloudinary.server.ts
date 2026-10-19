import { CLOUDINARY_CLOUD_NAME } from 'astro:env/server';
import { getCldImageUrl } from 'astro-cloudinary/helpers';

const cloudinaryConfig = {
	cloud: { cloudName: CLOUDINARY_CLOUD_NAME || undefined },
};

/**
 * Whether Cloudinary credentials have been provided.
 * When false, images fall back to the local files in `public/assets`.
 */
export function isCloudinaryConfigured(): boolean {
	return Boolean(CLOUDINARY_CLOUD_NAME);
}

/**
 * Normalize a product/collection image source into something Cloudinary can
 * deliver:
 *
 * - Already a full URL (`https://res.cloudinary.com/...`) -> used as-is
 * - Local public asset (`/assets/shirts.png`) -> derived public ID (`shirts`)
 * - Anything else -> treated as a Cloudinary public ID (`storefront/shirts`)
 */
export function toCloudinarySrc(src: string): string {
	if (/^https?:\/\//i.test(src)) return src;
	if (src.startsWith('/assets/')) {
		return src.slice('/assets/'.length).replace(/\.[^.]+$/, '');
	}
	return src.replace(/^\//, '');
}

/**
 * Build a Cloudinary delivery URL for an image at the given size.
 * Falls back to the raw source (a local path) when Cloudinary is not set up.
 */
export function cldImageUrl(src: string, width: number, height: number): string {
	if (!isCloudinaryConfigured()) return src;

	return getCldImageUrl(
		{
			src: toCloudinarySrc(src),
			width,
			height,
			crop: 'fill',
			format: 'auto',
			quality: 'auto',
		},
		cloudinaryConfig,
	);
}

/**
 * Build a Cloudinary `srcset` for responsive images.
 */
export function cldImageSrcSet(src: string, widths: number[], height: number): string {
	return widths
		.map((width) => `${cldImageUrl(src, width, height)} ${width}w`)
		.join(', ');
}
