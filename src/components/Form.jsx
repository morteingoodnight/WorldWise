// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Form.module.css";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useUrlPosition } from "../hooks/useUrlPosition";
import ButtonBack from "./ButtonBack";
import Message from './Message'
import Spinner from './Spinner'
import { useCities } from "../contexts/CitiesContext";


const BASE_URL = `https://us1.locationiq.com/v1/reverse`;
const KEY = import.meta.env.VITE_KEY;

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

export default function Form() {
  const [cityName, setCityName] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const {createCity,isLoading} = useCities()
 
  // state variables to implement the reactiveness to the click on map opening the form with the cities details.
  const {lat, lng} = useUrlPosition();
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [countryName, setCountryName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [geocodingError,setGeocodingError] = useState('')
  const navigate = useNavigate()
 
  async function handleSubmit(e){
    e.preventDefault()

    if(!cityName || !date) return;

    const newCity = {
      cityName,
      countryName,
      emoji,
      date,
      notes,
      position: {lat,lng}
    }
    await createCity(newCity)
    navigate("/app/cities")
  }
  useEffect(() => {
    if(!lat || !lng) return;


    async function fetchCityData() {
      try {
        setIsLoadingGeocoding(true);
        setGeocodingError('')
        const res = await fetch(
          `${BASE_URL}?key=${KEY}&lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();

        if(data.error){
          throw new Error('That is not a city click somewhere else🤷‍♂️')
        }
        const address = data.address
        setCityName(address.city || address.village || address.town);
        // console.log(cityName)
        setCountryName(data.address.country);
        setEmoji(convertToEmoji(data.address.country_code));
      } catch (err) {
        setGeocodingError(err.message)
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [lat, lng]);

  if(!lat || !lng) return <Message message="Start by clicking on the map somewhere"/>

  if(isLoadingGeocoding) return <Spinner/>

  if(geocodingError) return <Message message={geocodingError}/>
 
  return (
    <form className={`${styles.form} ${isLoading?styles.loading:''}`} onClick={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>
 
      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <DatePicker onChange={(date)=>setDate(date)} selected={date} dateFormat={"dd/MM/yyyy"}/>
      </div>
 
      <div className={styles.row}>
        {/* not working wth????? */}
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>
 
      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <ButtonBack />
      </div>
    </form>
  );
}

