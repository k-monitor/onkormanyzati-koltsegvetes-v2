import mitt from 'mitt';

type Events = {
	jump: Partial<SearchResult>;
	ms: string; // milestone ID
};

export default mitt<Events>();
