import { useState, useEffect } from 'react';
import { Button } from "reactstrap";
import api from '../../utils/api';

function LyricEntry(props) {
	const lyric = props.lyric;
	const reload = props.reload;
	const openFormWithLyricId = props.openFormWithLyricId;
	const [exists, setExists] = useState(true);
	const [formOpen, setFormOpen] = useState(false);
	
  	useEffect(() => {
		const deleteLyric = async () => {
			try {
				await api.delete(`/lyric/${lyric.id}/`);
			} finally {
				reload();
			}
 		};
		if (!exists) {
			deleteLyric();
		}
  	}, [exists]);

	if (formOpen) {
		openFormWithLyricId(lyric.id);
		setFormOpen(!formOpen);
	}

	return (
    	<tr>
    	  	<th scope="row">{lyric.id}</th>
    	  	<td>{lyric.text}</td>
    	  	<td>{lyric.song.name}</td>
    	  	<td>{lyric.album.name}</td>
    	  	<td>{lyric.artist.name}</td>
    	  	<td>
			  <Button
			  	color="primary"
				onClick={() => setFormOpen(!formOpen) }
			  >Edit
			  </Button>
			</td>
    	  	<td>
			  <Button
			  	color="danger"
				onClick={() => setExists(false)}
			  >Delete
			  </Button>
			</td>
    	</tr>
	)
}

export default LyricEntry;