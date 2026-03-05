export type AutocompleteItem = {
	text: string;
	desc?: string;
	image?: string;
};

export type AutocompleteResponse = AutocompleteItem[];

export async function getAutocompleteSuggestions(
	query: string,
): Promise<AutocompleteItem[]> {
	const base = "https://api.suggestions.victr.me";
	const resp = await fetch(`${base}?q=${encodeURIComponent(query)}`);
	const json = (await resp.json()) as AutocompleteResponse;

	return json.map((e) => ({
		text: e.text,
		desc: e.desc,
		image: e.image,
	}));
}
