import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import LoadingOverlay from "react-loading-overlay";
import { useLocation } from "react-router-dom";
import { MIDI } from "./midi";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import MidiWriter from 'midi-writer-js'; 
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/Cancel";
import Microphone from "./components/Microphone/Microphone";
import AudioPlayer from "./components/AudioPlayer/AudioPlayer";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import PauseIcon from "@material-ui/icons/Pause";
import Checkbox from "@material-ui/core/Checkbox";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
import Box from "@mui/material/Box";
import classes from "./Tracks.module.css";
import VolumeDown from "@material-ui/icons/VolumeDown";
import Slider from "@material-ui/core/Slider";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import CropIcon from "@mui/icons-material/Crop";
import Tooltip from "@mui/material/Tooltip";
import UndoIcon from "@mui/icons-material/Undo";

import { useSelector, useDispatch } from "react-redux";
import {
  setAudioTracks,
  setAudioTrackOffsets,
} from "../../../model/session/Session";
import { setMaxDuration } from "../../../model/audio/Audio";
import { setUserEmail, setUserToken } from "../../../model/user/User";
import UserContextProvider, {
  UserContext,
} from "../../../model/user-context/UserContext";
import {
  setSession,
  setSessionId,
  setSessionName,
  setParticipants,
  setBucketName,
  setNoRefresh,
} from "../../../model/session/Session";
import { url } from "../../../utils/constants";

import audioFile_N from "./components/AudioPlayer/Brk_Snr.mp3";
import audioFile_Z from "./components/AudioPlayer/Dsc_Oh.mp3";
import audioFile_X from "./components/AudioPlayer/Cev_H2.mp3";
import audioFile_C from "./components/AudioPlayer/Kick_n_Hat.mp3";
import audioFile_V from "./components/AudioPlayer/punchy_kick_1.mp3";
import audioFile_B from "./components/AudioPlayer/RP4_KICK_1.mp3";
import audioFile_M from "./components/AudioPlayer/side_stick_1.mp3";
import audioFile_comma from "./components/AudioPlayer/Heater-6.mp3";
import audioFile_dot from "./components/AudioPlayer/Give_us_a_light.mp3";
import audio_C from "./components/AudioPlayer/C.mp3";
import audio_Db from "./components/AudioPlayer/Db.mp3";
import audio_D from "./components/AudioPlayer/D.mp3";
import audio_Eb from "./components/AudioPlayer/Eb.mp3";
import audio_E from "./components/AudioPlayer/E.mp3";
import audio_F from "./components/AudioPlayer/F.mp3";
import audio_Gb from "./components/AudioPlayer/Gb.mp3";
import audio_G from "./components/AudioPlayer/G.mp3";
import audio_Ab from "./components/AudioPlayer/Ab.mp3";
import audio_A from "./components/AudioPlayer/A.mp3";
import audio_Bb from "./components/AudioPlayer/Bb.mp3";
import audio_B from "./components/AudioPlayer/B.mp3";
import audio_1 from "./components/AudioPlayer/Kick_1_Ibiza.mp3";
import audio_2 from "./components/AudioPlayer/Snare_1_Ibiza.mp3";
import audio_3 from "./components/AudioPlayer/Click_Ibiza.mp3";
import audio_4 from "./components/AudioPlayer/Clap_1_Ibiza.mp3";
import audio_5 from "./components/AudioPlayer/Hi-Hat_1_Ibiza.mp3";
import audio_6 from "./components/AudioPlayer/Hi-Hat_2_Ibiza.mp3";
import audio_7 from "./components/AudioPlayer/Hi-Hat_Open_Ibiza.mp3";
import audio_8 from "./components/AudioPlayer/Crash_Ibiza.mp3";
import audio_9 from "./components/AudioPlayer/Ride_Ibiza.mp3";
import audio_10 from "./components/AudioPlayer/Tom_Low_Ibiza.mp3";
import audio_11 from "./components/AudioPlayer/Tom_Low_Ibiza.mp3";
import audio_12 from "./components/AudioPlayer/Tom_High_Ibiza.mp3";
import audio_13 from "./components/AudioPlayer/Tambourine_1_Ibiza.mp3";
import audio_14 from "./components/AudioPlayer/Landing_Ibiza.mp3";
import audio_15 from "./components/AudioPlayer/Vinyl_Ibiza.mp3";
import audio_16 from "./components/AudioPlayer/Machine_Ibiza.mp3";
//overflowY: 'scroll', height: '400px', max-width: '100%', overflow-x: 'hidden'import Crunker from 'crunker'
import Crunker from "crunker";
var recording = false;
const map1 = new Map();

var soundsPLayed = new Array();

map1.set(90, audioFile_Z);
map1.set(78, audioFile_N);
map1.set(88, audioFile_X);
map1.set(67, audioFile_C);
map1.set(86, audioFile_V);
map1.set(66, audioFile_B);
map1.set(77, audioFile_M);
map1.set(188, audioFile_comma);
map1.set(190, audioFile_dot);

map1.set(65, audio_C);
map1.set(87, audio_Db);
map1.set(83, audio_D);
map1.set(69, audio_Eb);
map1.set(68, audio_E);
map1.set(70, audio_F);
map1.set(84, audio_Gb);
map1.set(71, audio_G);
map1.set(89, audio_Ab);
map1.set(72, audio_A);
map1.set(85, audio_Bb);
map1.set(74, audio_B);

const divStyle = {
  height: "59vh",
  width: "100px%",
  overflow: "hidden",
  backgroundColor: "#e5e7eb",
};
const arr = Array.from(Array(300).keys());
let interval;
let steps = 0;
const KNOB = 9;
const PAD = 48;
const DEVICE = "MPD218 Port A";
let ratio = 1;
let on = false;
let k = false;
let device_name = new Set();
let track;
let types = new Set();
let audios = [];
let selected_device = '';

function Tracks({changekeystrokeSubscribe}) {
  const [files, setFiles] = useState([]);
  const [playTracks, setPlayTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState([]);
  const [allSelected, setAllSelected] = useState(true);
  const [error, setError] = useState(null);
  const [changeRecordLabel, setChangeRecordLabel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [zoom, setZoom] = React.useState(90);
  const session = useSelector((_state) => _state.session);
  const dispatch2 = useDispatch();
  const _audio = useSelector((_state) => _state.audio);
  const user = useSelector((_state) => _state.user);
  const maxDuration = _audio ? _audio.maxDuration : 1;
  const search = useLocation().search;
  const rulerRef = useRef();
  const [record, setRecord] = useState(false);
  const [val, setVal] = useState('None');
  const [device, setDevice] = useState({});
  const [open, setOpen] = useState(false);
  const [barOffset, setBarOffset] = useState(0);
  const [playHeadPos, setplayHeadPos] = useState(0);
  const [playRegion, setPlayRegion] = useState([]);
  const [cropRegion, setCropRegion] = useState([]);
  const [cutRegion, setCutRegion] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [fileVersions, setFileVersions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [toBeRemoved, setToBeRemoved] = useState(false);
  const [devices, setdevices] = useState([]);
  const [mid, setmidi] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(()=>{
    if(mid){
      let midi = new MIDI(handleEvent);
      midi.initialize().then(() => {
      console.log("initialized!");
      });
    }
  }, [mid])
  useEffect(() => {
    if(record){
      handlemidi();
      k = true;
    }
    else{
      k = false;
      if(audios.length>=1){
        audio_handle();
        track = null;
      }
      
      else{
        setTimeout(() => { console.log("World!"); }, 2000);
        midi_handle();
      }
      
    }

}, [record])

const setNewDevices = (dev) => {
  setdevices([...devices, dev])
}
const handleEvent=(event)=>{
    console.log(event);
    const { device, type, a, b } = event;
  
    console.log('***', selected_device);
    device_name.add(device.name);
    console.log('qwerty, ', device_name); 
    types.add(type);
    console.log([...types][0]);
    if(type === "device_connected"){
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); }, 500);      
    }
    if (a!= null && type === 'note_on' && (a.value === 36 || a.value === 37 || a.value === 38 || a.value === 39 || a.value === 40 || a.value === 41 || a.value === 42 || a.value === 43 || a.value === 44|| a.value === 45|| a.value === 46|| a.value === 47|| a.value === 48|| a.value === 49|| a.value === 50|| a.value === 51) && device.name === 'MPD218'){
      console.log(a.value);
      if (a.value === 36){
        audios.push(audio_1);
      }
      else if (a.value === 37){
        audios.push(audio_2);
      }
      else if (a.value === 38){
        audios.push(audio_3);
      }
      else if (a.value === 39){
        audios.push(audio_4);
      }
      else if (a.value === 40){
        audios.push(audio_5);
      }
      else if (a.value === 41){
        audios.push(audio_6);
      }
      else if (a.value === 42){
        audios.push(audio_7);
      }
      else if (a.value === 43){
        audios.push(audio_8);
      }
      else if (a.value === 44){
        audios.push(audio_9);
      }
      else if (a.value === 45){
        audios.push(audio_10);
      }
      else if (a.value === 46){
        audios.push(audio_11);
      }
      else if (a.value === 47){
        audios.push(audio_12);
      }
      else if (a.value === 48){
        audios.push(audio_13);
      }
      else if (a.value === 49){
        audios.push(audio_14);
      }
      else if (a.value === 50){
        audios.push(audio_15);
      }
      else if (a.value === 51){
        audios.push(audio_16);
      }
  
    }
    else if (a != null && (type === 'note_on' || type === 'note_off' || type === 'mode_change' || type === 'pitch_wheel control') && device.name === selected_device && k){
        track.addEvent(new MidiWriter.NoteEvent({pitch: [a.value],velocity: b.value, duration: '8', channel: 1}));
        console.log(a.value);
      }
    if(type === "device_disconnected"){
      device_name.delete(device.name);
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); }, 1000);
      console.log(device_name);
    }
  
    if (device.name !== DEVICE) return;
    if (type === "mode_change" && a.value === KNOB) {
      ratio = b.ratio;
    } else if (type === "note_on" && a.value === PAD) {
      on = true;
    } else if (type === "note_off" && a.value === PAD) {
      on = false;
    } else if (type === "aftertouch" && on) {
      ratio = a.ratio;
    }
};
const handlemidi = () => {
  track = new MidiWriter.Track();
  setToBeRemoved(true);
};

const audio_handle = async()=>{
  if(audios.length >=1){ 
    let crunker = new Crunker();
    let expBuffer = await crunker.fetchAudio(...audios);
    let concatBuffer = await crunker.concatAudio(expBuffer);
    let exportedAudio = await crunker.export(concatBuffer, "audio/wav");
    let newblob = exportedAudio.blob
    const url_new = URL.createObjectURL(newblob);
    pushFile(url_new);
    uploadMidi(newblob);
    audios.length = 0;
    console.log(audios)
  }
}

const midi_handle = async() => {
  if (!record  && toBeRemoved && track != null) {
    console.log([...types].pop());
    const write = new MidiWriter.Writer(track);
    track = null;
    const mid_uri = write.dataUri();
    console.log(mid_uri);
    let testBlob = await fetch(mid_uri).then(r => r.blob());
    let crunker = new Crunker();
    const formData = new FormData();
    let _file = null;
    _file = new File([testBlob], "audio.mid");


    formData.append(
      'track', _file
    );
  const res = await axios.post(url + "/midiUpload", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        Authorization: "Bearer " + jwtToken,
      },
    });
  // setTimeout(() => { console.log("World!"); }, 2000);
  const { data } =  await axios.get(url+"/putmidi", {
          responseType: 'arraybuffer',
          headers: { 'Accept': '*/*', 'Content-Type': 'audio/wav' }
      })
      const blob = new Blob([data], {
          type: 'audio/wav'
      })
      const url_new = URL.createObjectURL(blob);

      let final_blob =fetch(url_new).then(res => res.blob());
//         await crunker.download(final_blob, "test");
  pushFile(url_new);
  uploadMidi(blob);
  };

  }
const uploadMidi = (blob) => {
  const formData = new FormData();

  formData.append("fileName", "hello");
  let _file = null;
//    console.log(file.blob);
  if (blob) {
    _file = new File([blob], "audio.mp3");
  }
  formData.append("file", _file);

  formData.append("sessionId", session.sessionId);

  formData.append("bucketName", session.bucketName);

  formData.append("owner", state.user.firstName);

  formData.append("email", state.user.emailId);

  let requestsParams =
    "fileName=hello&file=" +
    _file +
    "&sessionId=" +
    session.sessionId +
    "&bucketName=" +
    session.bucketName;
  axios.post(url + "/studioSession", formData, {
    headers: {
      // axios.post(url+"/studioSession",formData,{headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      Authorization: "Bearer " + jwtToken,
    },
  });
};

  const playHandler = () => {
    setIsPlaying(true);
    interval = setInterval(() => {
      steps++;
      setplayHeadPos((prev) => prev + 6);
      if (steps > 100) {
        rulerRef.current.scrollLeft += 6;
        return;
      }
      setBarOffset((prevBarOffset) => {
        return prevBarOffset + 6;
      });
    }, 200);
  };

  const stopHanlder = () => {
    setIsPlaying(false);
    clearInterval(interval);
  };

  const changeBarStartHandler = (event) => {
    const offset = event.clientX - 250;
    setBarOffset(offset);
    setplayHeadPos(offset);
    steps = (6 * offset) / 30;
  };

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const [state, dispatch] = useContext(UserContext);

  let jwtToken = `${user.jwtToken}`;

  const uploadFIle = async (file) => {
    setIsLoading(true);
    const formData = new FormData();

    formData.append("fileName", "hello");
    let _file = null;
    console.log(file.blob);
    if (file.blob) {
      _file = new File([file.blob], "audio.mp3");
    } else if (typeof file == "string") {
      console.log(file.substring(5));
      _file = new File([new Blob(file.substring(5))], "audio.mp3");
    } else {
      _file = file;
    }
    formData.append("file", _file);

    formData.append("sessionId", session.sessionId);

    formData.append("bucketName", session.bucketName);

    formData.append("owner", state.user.firstName);

    formData.append("email", state.user.emailId);

    let requestsParams =
      "fileName=hello&file=" +
      file +
      "&sessionId=" +
      session.sessionId +
      "&bucketName=" +
      session.bucketName;
    await axios.post(url + "/studioSession", formData, {
      headers: {
        // axios.post(url+"/studioSession",formData,{headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        Authorization: "Bearer " + jwtToken,
      },
    });
    setIsLoading(false);
  };

  const onFileChange = (event) => {
    pushFile(URL.createObjectURL(event.target.files[0]));
    uploadFIle(event.target.files[0]);
  };

  const onMicInput = (file) => {
    pushFile(file);
    uploadFIle(file);
  };

  const pushFile = (file) => {
    setFiles([...files, file]);
    setPlayTracks([...playTracks, false]);
    setSelected([...selected, false]);
    setCropRegion([...cropRegion, false]);
    setCutRegion([...cutRegion, 0]);
    setPlayRegion([...playRegion, 0]);
  };

  const remove = (index) => {
    if (index !== -1) {
      setFiles(
        files.filter(function (file) {
          return file !== files[index];
        })
      );
      var temp = selected;
      temp.splice(index, 1);
      setPlayTracks(temp);
      temp = playTracks;
      temp.splice(index, 1);
      setSelected(temp);
      const formData = new FormData();
      formData.append("fileId", session.audioTracks[index]?.audioTrackId);
      formData.append("sessionId", session.sessionId);
      formData.append("fileName", session.audioTracks[index]?.file);

      axios.put(url + "/removeFile", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          Authorization: "Bearer " + jwtToken,
        },
      });
    }
  };

  const stopPlayTracks = () => {
    rulerRef.current.scrollLeft = 0;
    stopHanlder();
    setBarOffset(0);
    setplayHeadPos(0);
    steps = 0;
  };

  const fileVersionHandler = (index, prevName) => {
    let temp = fileVersions;
    temp[index] = prevName;
    setFileVersions([...temp]);
    localStorage.setItem("versions", JSON.stringify([...temp]));
  };

  let transportPlayButton;

  if (!isPlaying) {
    transportPlayButton = (
      <IconButton onClick={playHandler}>
        <PlayArrowIcon />
      </IconButton>
    );
  } else {
    transportPlayButton = (
      <IconButton onClick={stopHanlder}>
        <PauseIcon />
      </IconButton>
    );
  }

  const toggleSelectAll = (event) => {
    var temp = [];
    if (allSelected) {
      selected.forEach((t) => {
        temp.push(false);
      });
      setAllSelected(false);
    } else {
      selected.forEach((t) => {
        temp.push(true);
      });
      setAllSelected(true);
    }
    setSelected(temp);
  };

  const toggleSelectOne = (event, index) => {
    let temp = [];
    // temp[index]=event.target.checked;
    for (var i = 0; i < selected.length; i++) {
      if (i != index) {
        temp.push(selected[i]);
      } else {
        temp.push(!selected[i]);
      }
    }
    setSelected(temp);
  };

  function concatAudioBuffer(buffers) {
    let crunker = new Crunker();
    return crunker.concatAudio(buffers);
  }

  async function getAudioBuffer(file) {
    let crunker = new Crunker();

    let x = await crunker.fetchAudio(file).then((buffers) => {
      return buffers;
    });

    return x;
  }

  async function download() {
    var initBuffer = null;
    var tempBuffer = null;
    //    var x=[audioFile1,audioFile,audioFile2,audioFile3];
    var x = soundsPLayed;
    for (var i = 0; i < x.length; i++) {
      if (i == 0) {
        initBuffer = await getAudioBuffer(x[i]);
      } else {
        tempBuffer = await getAudioBuffer(x[i]);
        console.log(initBuffer);
        var x1 = new Array();
        if (i == 1) {
          x1.push(initBuffer[0]);
        } else {
          x1.push(initBuffer);
        }
        x1.push(tempBuffer[0]);
        initBuffer = concatAudioBuffer(x1);
      }
    }

    let crunker = new Crunker();
    var ds = crunker.export(initBuffer, "audio/mp3");
    pushFile(ds);

    uploadFIle(ds);

    const formData = new FormData();

    const file = new File([ds.blob], "audio.mp3");

    formData.append("file", file);

    formData.append("bucket", "myawsbucket-3");
  }

  const handleKeydown = (e) => {
    if (recording == true) {
      console.log(map1.get(e.which));
      if (map1.has(e.which)) {
        soundsPLayed.push(map1.get(e.which));
        console.log(soundsPLayed.length);
      }
    }
  };

  const handleHotKeys = useCallback(
    (e) => {
      const keyCode = e.which;
      console.log(keyCode);

      switch (keyCode) {
        case 32:
          if (isPlaying) {
            stopHanlder();
          } else {
            playHandler();
          }
          break;
        case 82:
          if (!recording) handleRecord();
          break;
      }
    },
    [isPlaying]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleHotKeys);
    return () => document.removeEventListener("keydown", handleHotKeys);
  }, [handleHotKeys]);

  const handleRecord = () => {
    recording = !recording;
    setChangeRecordLabel(!changeRecordLabel);

    if (recording == true) {
      document.removeEventListener("keydown", handleHotKeys);
      document.addEventListener("keydown", handleKeydown);
      console.log("Recording");
    }

    if (recording == false) {
      document.removeEventListener("keydown", handleKeydown);
      document.addEventListener("keydown", handleHotKeys);
      if (soundsPLayed.length) {
        download();
        setError("Please wait while the recorded track renders!!");
      }
      soundsPLayed = new Array();
    }
  };

  const enteredTitleBlurHandler = (index, newFileDisplayName) => {
    changekeystrokeSubscribe(true);
    updateFileDisplayName(index, newFileDisplayName);
  };

  const enteredTitleFocusHandler = () => {
    changekeystrokeSubscribe(false);
  };

  const updateFileDisplayName = (index, newFileDisplayName) => {
    document.addEventListener("keydown", handleKeydown);
    const formData = new FormData();
    formData.append("fileId", session.audioTracks[index].audioTrackId);
    formData.append("sessionId", session.sessionId);
    formData.append("newFileDisplayName", newFileDisplayName);

    axios.put(url + "/updateFileDisplayName", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        Authorization: "Bearer " + jwtToken,
      },
    });
  };

  async function exportAsWav() {
    setIsLoading(true);
    let crunker = new Crunker();
    let temp = [];
    files.forEach((f, index) => {
      if (f.url) {
        temp.push(f.url);
      } else if (typeof f == "string") {
        temp.push(f);
      } else if (f.blob) {
        let _file = URL.createObjectURL(f.blob);
        temp.push(_file);
      } else {
        let _file = URL.createObjectURL(f);
        temp.push(_file);
      }
    });
    let expBuffer = await crunker.fetchAudio(...temp);
    const tempBuffer = expBuffer.map((buffer, index) => {
      return crunker.padAudio(buffer, 0, session.audioTracks[index]?.offset / 30)
    });
    let mergedBuffer = await crunker.mergeAudio(tempBuffer);
    let exportedAudio = await crunker.export(mergedBuffer, "audio/wav");
    await crunker.download(exportedAudio.blob, "merged");
    setIsLoading(false);
  }

  async function getAllFiles() {
    if (session.noRefresh == true) {
      setIsLoading(false);
      return;
    }
    setFiles([]);
    setPlayTracks([]);
    setSelected([]);
    setIsLoading(true);
    let fileArray = [];
    let boolArray = [];
    let regionArray = [];
    for (var i = 0; i < session.audioTracks.length; i++) {
      const formData = new FormData();
      // console.log(s.file);
      formData.append("fileName", session.audioTracks[i].file);
      formData.append("bucketName", session.bucketName);
      let encodeString = "test@test.com:test1234";
      const encodedString = Buffer.from(encodeString).toString("base64");

      let res = await axios.post(url + "/getFile", formData, {
        responseType: "arraybuffer",
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "Content-Type": "audio/mpeg",

          Authorization: "Bearer " + jwtToken,
        },
      });
      const _file = new Blob([res.data], {
        type: "audio/mp3",
      });
      fileArray.push(_file);
      boolArray.push(false);
      regionArray.push(0);
    }
    setFiles(fileArray);
    setPlayTracks(boolArray);
    setSelected(boolArray.map((r) => true));
    setCropRegion(regionArray);
    setPlayRegion(regionArray);
    setCutRegion(regionArray);
    const temp = regionArray.map((r) => 1);
    setVolumes([...temp]);
    console.log([...temp]);
    // setFileVersions(regionArray.map((r) => ""));
    setIsLoading(false);
  }

  async function getSpotifyUserDetails(token, email) {
    console.log("get getSpotifyUserDetails");
    await dispatch2(setUserToken(token));
    await dispatch2(setUserEmail(email));
    axios
      .get(url + "/getUserDetails?emailId=" + email, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .then((response1) => {
        if (response1.data.status == 207) {
        } else if (response1.data) {
          dispatch({
            type: "LOAD_USER",
            payload: response1.data.data,
          });
          console.log(response1.data.data);
        }
      });
    let sessionId = null;
    if (search) {
      sessionId = new URLSearchParams(search).get("sessionId");
      connect(sessionId);
    }
    let formdata = JSON.stringify({
      sessionId: sessionId,
      email: email,
    });
    console.log(formdata);

    axios
      .post(url + "/connect", formdata, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers": "Content-Type",
          // "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          Authorization: "Bearer " + jwtToken,
        },
      })
      .then((response) => {
        console.log(response.data);
        dispatch2(setSessionId(response.data.sessionId));
        dispatch2(setSessionName(response.data.sessionName));
        dispatch2(setParticipants(response.data.participants));
        dispatch2(setBucketName(response.data.bucketName));
        getFileNames(sessionId);
      })
      .catch((_error) => {
        console.log(_error);
      });
  }

  useEffect(() => {
    if (jwtToken && jwtToken != "undefined") {
      connect();
      getFileNames();
    } else {
      let token = localStorage.getItem("auth-token");
      if (token) {
        let email = localStorage.getItem("emailId");
        getSpotifyUserDetails(token, email);
      } else {
        window.location.href = "/login";
      }
    }
  }, []);

  useEffect(() => {
    getAllFiles();
  }, [session.audioTracks]);

  useEffect(() => {
    let preVersions = JSON.parse(localStorage.getItem("versions") || "[]");
    if (preVersions.length) {
      setFileVersions([...preVersions]);
      console.log(preVersions[0] && preVersions[0].length > 0);
    }
  }, []);

  function getFileNames(sessionId = session.sessionId) {
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    axios
      .get(url + "/getStudioSession?sessionId=" + sessionId, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          Authorization: "Bearer " + jwtToken,
        },
      })
      .then((res) => {
        console.log(res);
        if (res.data) {
          dispatch2(setAudioTracks(res.data.audioTracks));
          // dispatch2(setAudioTrackOffsets(res.data.audioTracks));
        }
      })
      .catch((_error) => {
        console.log(_error);
      });
  }

  const connect = (sessionId = session.sessionId) => {
    if (subscription) {
      subscription.unsubscribe();
    }
    let socket = new SockJS(url + "/studioSession");
    //{headers : {"Access-Control-Allow-Origin": "*" }}
    let stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
      console.log("connected to the frame: " + frame);
      const subscription = stompClient.subscribe(
        "/topic/session-progress/" + sessionId,
        function (response) {
          let data = JSON.parse(response.body);
          console.log(data);
          if (data.participants) {
            dispatch2(setParticipants(data.participants));
          }
          dispatch2(setNoRefresh(data.noRefresh));
          getFileNames(session.sessionId || data.sessionId);
          // getFileOffsets();
          // displayResponse(data);
        }
      );
      setSubscription(subscription);
    });
  };

  const playRegionHandler = (index) => {
    let temp = [...playRegion];
    temp[index] = temp[index] + 1;
    setPlayRegion(temp);
  };
  const cutRegionHandler = (index) => {
    setIsLoading(true);
    let temp = [...cutRegion];
    temp[index] = temp[index] + 1;
    setCutRegion(temp);
  };
  const cropRegionHandler = (index) => {
    setIsLoading(true);
    let temp = [...cropRegion];
    temp[index] = temp[index] + 1;
    setCropRegion(temp);
  };

  const updadeFileOffsets = (data) => {
    const reqData = {
      ...data,
      sessionId: session.sessionId,
    };

    axios.put(url + "/updateFileOffset", reqData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        Authorization: "Bearer " + jwtToken,
      },
    });
    console.log(data);
    // dispatch2(setAudioTrackOffsets([audioTr]));
  };

  const undoChange = async (index) => {
    if (!fileVersions[index].length) {
      return;
    }
    const formData = new FormData();
    formData.append("fileId", session.audioTracks[index]?.audioTrackId);
    formData.append("prevFileName", fileVersions[index]);
    formData.append("sessionId", session.sessionId);

    const res = await axios.put(url + "/undoFileChange", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        Authorization: "Bearer " + jwtToken,
      },
    });
    if (res.data == true) {
      fileVersionHandler(index, "");
    }
  };

  const handleVolumeChange = (index, value) => {
    const temp = [...volumes];
    temp[index] = value;
    setVolumes(temp);
  };
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  const handleClick=(device)=>{
    setVal(device);
    [...device_name].map(device=>{
      console.log(device);
  })
  };
  const handleChange = (device) =>{
    setVal(device);
    selected_device = device;
  };
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );
  const vertical = 'top';
  const horizontal = 'right'

  const midiRecordHandle = ()=>{
    setRecord(prev =>{
      return !prev;
    });
    setOpen(true);
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        action={action}
        message={`Please start recording`}
        key={vertical + horizontal}
    />
      <LoadingOverlay active={isLoading} spinner text="Please wait...">
        <div style={divStyle}>
          <div
            className={`flex flex-row ${classes.controlButtons}`}
            style={{ marginLeft: "250px" }}
          >
            <div>
              <Microphone style={{}} pushFile={onMicInput} />
            </div>
            <div className="p-2 ml-0.5 pt-5">
              <label for={"file-upload"} className=" cursor-pointer">
                Import
              </label>
              <input
                id={"file-upload"}
                className="text-xs hidden"
                style={{ maxWidth: "100%" }}
                type="file"
                accept="audio/*"
                onChange={onFileChange}
              />
            </div>
            {/* <Fileupload/> */}
            <div className=" p-2 ml-0.5 flex flex-row">
              <Checkbox
                style={{ color: "#00e676" }}
                checked={allSelected || false}
                onChange={(e) => toggleSelectAll(e)}
              />
              <p className="pt-3 pr-1">Select All</p>
            </div>
            <div className=" ml-0.5 pt-2">{transportPlayButton}</div>
            <div className=" ml-0.5 pt-2">
              <IconButton onClick={stopPlayTracks}>
                <StopIcon smooth={true} />
              </IconButton>
            </div>
            
              {!visible &&
            <div className="p-4 pt-5 ml-0.5">
              <button
                onClick={() => {
                  setmidi(!mid);
                  setVisible(!visible);
                }}
                style={{ height: "100%" }}
                
              >Midi

                {/* {!changeRecordLabel ? "Record Instrument" : "Stop Recording"} */}
              </button>
            </div>}
              {visible &&
              <div className=" p-4 mx-0.5 pt-5">
                <label>
                          <select value = {val} onClick={(e)=>handleClick(e.target.value)} onChange={(e) => handleChange(e.target.value)}>
                            <option>Pick a midi device</option>
                            {console.log([...device_name])}
                              {[...device_name].map(device=>{
                                  return <option value={device}>{device}</option>
                              })}
                              {/*<option value="device">{device_name}</option>*/}

                          </select>
                </label>

              </div>}

              {visible &&
            <div>
              <button
                onClick={midiRecordHandle}
                style={{ height: "100%" }}
                className=" p-4 pt-5 ml-0.5"
              >{!record ? 'record midi' : 'stop'}

                {/* {!changeRecordLabel ? "Record Instrument" : "Stop Recording"} */}
              </button>
            </div>}
           
            <div className=" p-4 ml-0.5 pt-5">
              <button onClick={handleRecord} style={{ height: "100%" }}>
                {!changeRecordLabel ? "Record Instrument" : "Stop Recording"}
              </button>
            </div>
            <div className="p-4 pt-5 ml-0.5">
              <button onClick={exportAsWav}>Export as WAV</button>
            </div>
          </div>

          <div className={classes.container}>
            <div className={classes.leftpane}>
              <div
                style={{
                  height: "25px",
                  backgroundColor: "#10b981",
                  position: "sticky",
                  top: 0,
                }}
              ></div>
              {files.map((file, index) => (
                <div key={`contoller+${index}`} style={{ height: "100px" }}>
                  <Checkbox
                    style={{ color: "#10b981" }}
                    checked={selected[index] || false}
                    onChange={(e) => toggleSelectOne(e, index)}
                  />
                  <Tooltip title="delete">
                  <button onClick={() => remove(index)} className="mx-5 mt-1">
                    <CancelIcon />
                    </button>
                  </Tooltip>
                  <div className="px-3">
                    <span>
                      <input
                        type="text"
                        id="title"
                        defaultValue={
                          session.audioTracks[index]?.fileDisplayName ||
                          session.audioTracks[index]?.file.slice(13)
                        }
                        onFocus={enteredTitleFocusHandler}
                        onBlur={(e) =>
                          enteredTitleBlurHandler(index, e.target.value)
                        }
                        placeholder="Title"
                        // readOnly
                        key={session.audioTracks[index]?.fileDisplayName}
                      />
                    </span>
                    <span className="float-right">
                      {session.audioTracks[index]?.owner}
                    </span>
                  </div>
                  <div style={{ height: "30px" }}>
                    <span className="float-left px-2 mt-1">
                      <Tooltip title="Play region">
                        <button onClick={() => playRegionHandler(index)}>
                          <PlayArrowIcon />
                        </button>
                      </Tooltip>
                      {/* <button
                        className="ml-3"
                        onClick={() => cutRegionHandler(index)}
                      >
                        <ContentCutIcon />
                      </button> */}
                      <Tooltip title="crop">
                        <button
                          className="ml-3"
                          onClick={() => cropRegionHandler(index)}
                        >
                          <CropIcon />
                        </button>
                      </Tooltip>
                      {fileVersions[index] && fileVersions[index].length > 0 && (
                        <span className="ml-3">
                          <Tooltip title="Undo crop">
                            <button onClick={(e) => undoChange(index)}>
                              <UndoIcon />
                            </button>
                          </Tooltip>
                        </span>
                      )}
                    </span>
                    <VolumeDown style={{ verticalAlign: "super" }} />
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      style={{ width: "20%", margin: "5px" }}
                      value={volumes[index] != undefined ? volumes[index] : 1}
                      onChangeCommitted={(event, value) =>
                        handleVolumeChange(index, value)
                      }
                    />
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            <div>
              <Box
                component="div"
                sx={{
                  my: 2,
                  backgroundColor: "#9ca3af",
                  height: "500px",
                  overflow: "auto",
                  whiteSpace: "nowrap",
                }}
                ref={rulerRef}
              >
                <div className={classes.timerBar}>
                  <h1
                    style={{
                      left: `${steps < 100 ? barOffset : barOffset + 250}px`,
                      height: "480px",
                      borderRight: "2px solid red",
                      position: `${steps < 100 ? "absolute" : "fixed"}`,
                      zIndex: 20,
                    }}
                  ></h1>
                  {arr.map((item, index) => (
                    <Box
                      component="div"
                      sx={{
                        display: "inline-block",
                        color: "black",
                        border: "1px solid #575757",
                        width: "30px",
                        textAlign: "center",
                        height: "25px",
                        backgroundColor: "#10b981",
                      }}
                      className={isPlaying ? "" : "cursor-pointer"}
                      onClick={(e) => !isPlaying && changeBarStartHandler(e)}
                      key={`timer+${index}`}
                    >
                      <span>{index + 1}</span>
                    </Box>
                  ))}
                  {files.map((file, index) => (
                    <div key={`song+${index}`}>
                      <AudioPlayer
                        isSelected={selected[index]}
                        isMusicPlaying={isPlaying}
                        file={file}
                        playHeadPos={playHeadPos}
                        playRegion={playRegion[index]}
                        cutRegion={cutRegion[index]}
                        cropRegion={cropRegion[index]}
                        updateFileOffsets={updadeFileOffsets}
                        fileVersionHandler={fileVersionHandler}
                        fileId={session.audioTracks[index]?.audioTrackId}
                        initOffset={session.audioTracks[index]?.offset}
                        fileName={session.audioTracks[index]?.file}
                        index={index}
                        volume={volumes[index]}
                        seek={seekValue}
                        zoom={zoom}
                        owner={
                          session.audioTracks[index]
                            ? session.audioTracks[index].owner
                            : null
                        }
                      />
                    </div>
                  ))}
                </div> 
              </Box>
            </div>
          </div>
          <Snackbar
            TransitionComponent="Fade"
            autoHideDuration={6000}
            onClose={(e) => setError(null)}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                sx={{ p: 0.5 }}
                onClick={(e) => setError(null)}
              >
                <CloseIcon />
              </IconButton>
            }
            message={error}
            open={error}
          />
        </div>
      </LoadingOverlay>
    </>
  );
}

export default Tracks;