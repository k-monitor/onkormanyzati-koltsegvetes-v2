import mitt from 'mitt';

type Events = {
	jump: Partial<SearchResult>;
	ms: string; // milestone ID
	jump_map: string; // milestone ID for map
	ms_map: string; // milestone ID for map modal
};

export default mitt<Events>();
