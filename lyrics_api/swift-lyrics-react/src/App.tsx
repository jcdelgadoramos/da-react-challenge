import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Table, Label, Input } from "reactstrap";
import LyricEntry from "./components/LyricEntry";
import LyricForm from "./components/LyricForm";
import api from './utils/api';
import { Lyric } from './types';


function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<Lyric[]>([]);
  const [querySize, setQuerySize] = useState(25);
  const [queryText, setQueryText] = useState("");
  const [albumSorting, setAlbumSorting] = useState(false);
  const [songSorting, setSongSorting] = useState(false);
  const [lyricSorting, setLyricSorting] = useState(false);
  const [sorting, setSorting] = useState('');
  const [reload, setReload] = useState(false);
  const [lyricId, setLyricId] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [lyricInForm, setLyricInForm] = useState<Lyric>();

  const changeQuerySize = (event:any) => {
    setQuerySize(event.target.value);
  };

  const changeQueryText = (event:any) => {
    setQueryText(event.target.value);
  }

  const toggleAlbumSorting = (event:any) => {
    setAlbumSorting(!albumSorting);
    setSongSorting(false);
    setLyricSorting(false);
    setSorting(`&ordering=${albumSorting ? '' : '-'}song__album__name`)
  }

  const toggleSongSorting = () => {
    setSongSorting(!songSorting);
    setAlbumSorting(false);
    setLyricSorting(false);
    setSorting(`&ordering=${songSorting ? '' : '-'}song__name`)
  }

  const toggleLyricSorting = () => {
    setLyricSorting(!lyricSorting);
    setAlbumSorting(false);
    setSongSorting(false);
    setSorting(`&ordering=${lyricSorting ? '' : '-'}text`)
  }

  const requestReload = () => {
    setReload(true);
  }

  const modifyLyricId = (id:number) => {
    setLyricId(id);
  }

  useEffect(() => {
    const getLyrics = async () => {
      try {
        const { data } = await api.get(
          `/lyric/?size=${querySize}&search=${queryText}${sorting}`);
        if (data === undefined) {
          setError(true);
          throw(new Error('Invalid response'));
        }
        setResult(data.results);
      } finally {
        setLoading(false);
        setReload(false);
      }
    };
    getLyrics();
  }, [querySize, queryText, sorting, reload]);

  useEffect(() => {
    const lyricToForm = result.find(lyric => lyric.id === lyricId);
    if (lyricToForm !== undefined && lyricToForm.id > 0) {
      setLyricInForm(lyricToForm);
      setOpenForm(true);
    } else {
      setOpenForm(false);
    }
  }, [lyricId]);

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Cargando...
          </p>
        </header>
      </div>
    )
  } else if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Error al cargar.
          </p>
        </header>
      </div>
    )
  } else {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Find your favorite!
            </p>
            <div className="Menu">
              <Label for="size" className="label">
                Results:
              </Label>
              <Input
                type="select"
                name="size"
                value={querySize}
                onChange={changeQuerySize}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </Input>
              <Input
                type="text"
                name="search"
                placeholder="Search by song name, album name and lyric text"
                value={queryText}
                onChange={changeQueryText}
              />
          </div>
          <Table dark>
            <thead>
              <tr className="header">
                <th></th>
                <th
                  onClick={toggleLyricSorting}
                  className="pointer">
                  Lyrics
                </th>
                <th
                  onClick={toggleSongSorting}
                  className="pointer">
                  Song
                </th>
                <th
                  onClick={toggleAlbumSorting}
                  className="pointer">
                  Album
                </th>
                <th>Artist</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                result.map((lyric) => (
                  <LyricEntry
                    key={lyric.id}
                    lyric={lyric}
                    reload={requestReload}
                    openFormWithLyricId={modifyLyricId}
                  ></LyricEntry>
                ))
              }
            </tbody>
          </Table>
			    <LyricForm
            lyric={lyricInForm}
            isOpen={openForm}
            closeFormWithLyricId={modifyLyricId}
          />
        </header>
      </div>
    )
  }
}

export default App;
