import { useState, useEffect } from 'react';
import { 
	Button,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
} from "reactstrap";
import api from '../../utils/api';

function LyricForm(props) {
  const lyric = props.lyric;
  const [selectedAlbum, setSelectedAlbum] = useState();
  const [selectedSong, setSelectedSong] = useState();
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [formOpen, setFormOpen] = useState(true);
  const closeFormWithLyricId = props.closeFormWithLyricId;

  const changeSelectedAlbum = (event) => {
  	setSelectedAlbum(event.target.value);
  	setSongs(albums.find((album) => album.id === selectedSong).songs);
  }

  const changeSelectedSong = (event) => {
  	setSelectedSong(event.target.value);
  }

  useEffect(() => {
    const getAlbums = async () => {
      try {
        const { data } = await api.get(`/album/`);
        if (data === undefined) {
          throw(new Error('Invalid response'));
        }
    	setAlbums(data.results);
  	    let songs = [];
  	    albums.map((album) => songs.concat(album.songs));
  	    setSongs(songs);
      } finally {
	  }
    };
  	getAlbums();
  }, [])


  if (!formOpen){
  	closeFormWithLyricId(0);
	setFormOpen(!formOpen);
  }

  if (!lyric){
	return <Modal></Modal>
  } else {
  return (
  	<Modal isOpen={props.isOpen}>
  	  <ModalHeader>Modify Lyric {lyric.id}</ModalHeader>
  	    <ModalBody>
  	      <Form>
  	      	<FormGroup>
 			  <Label for="albumSelector" className="label">
 	  			Select album:
 			  </Label>
 			  <Input
 	  			type="select"
 	  			name="albumSelector"
 	  			value={selectedAlbum}
 	  			onChange={changeSelectedAlbum}
 			  >
  			  {
  				albums.map((album) => {
  					<option value={album.id}>{album.name}</option>
  				})
  			  }
 			</Input>
 		  </FormGroup>
  		  <FormGroup>
			<Label for="songSelector" className="label">
	  	  	  Select song:
			</Label>
			<Input
	  	  	  type="select"
	  	  	  name="songSelector"
	  	  	  value={selectedSong}
	  	  	  onChange={changeSelectedSong}
			>
 		 	{
  	  	  	  songs.map((song) => {
  				<option value={song.id}>{song.name}</option>
  	  	  	  })
  			}
 	  		</Input>
  		  </FormGroup>
  		</Form>
  	  </ModalBody>
	  <ModalFooter>
	    <Button color="primary">Save</Button>
	    <Button color="secondary" onClick={() => setFormOpen(false)}>Discard</Button>
	  </ModalFooter>
  	</Modal>
  )
}}

export default LyricForm;