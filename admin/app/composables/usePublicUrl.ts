export default () => {
	const publicUrl = useConfig().publicUrl;
	// only has value on the server, useState passes it to client
	return useState('publicUrl', () => publicUrl);
};
