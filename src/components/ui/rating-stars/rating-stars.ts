export function renderRatingStars(rating = 0): string {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  return `<span class="rating-stars" data-rating="${safeRating}">★★★★★</span>`;
}
