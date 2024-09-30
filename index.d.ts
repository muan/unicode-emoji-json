interface Emoji {
    name: string;
    slug: string;
    emoji_version: string;
    unicode_version: string;
    skin_tone_support: boolean;
}

declare const dataByEmoji: Record<
  string,
  Emoji & { group: string }
>;

interface Category {
  name: string;
  slug: string;
  emojis: Array<Emoji & { emoji: string }>
};

declare const dataByGroup: Array<Category>;

export { dataByEmoji, dataByGroup };
