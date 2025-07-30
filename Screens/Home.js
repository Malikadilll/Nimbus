import { StyleSheet, Text, View, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import { fetchLocations, fetchWeatherForecast } from '../api/api';
import * as Progress from 'react-native-progress';
import { storeData } from '../asyncStorage';
import { getData } from '../asyncStorage';
import LottieView from 'lottie-react-native';
import { weatherAnimations } from '../constants/constants';

const WeatherAnimation = ({ condition }) => {
  const animation = weatherAnimations[condition] || weatherAnimations['other'];

  return (
    <LottieView
      source={animation}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
  );
};

const WeatherAnimationSmall = ({ condition }) => {
  const animation = weatherAnimations[condition] || weatherAnimations['other'];

  return (
    <LottieView
      source={animation}
      autoPlay
      loop
      style={{ width: 60, height: 60 }}
    />
  );
};

export default function HomeScreen() {

  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([1,2,3]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) =>{
    // console.log('location: ', loc);
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city',loc.name);
      // console.log('got forecast: ',data)
    })

  }
  const handleSearch = value=>{
    //fetch locations
    if(value.length>2){
      fetchLocations({cityName: value}).then(data=>{
      setLocations(data);
    })
    }

    
  }


  useEffect(()=>{
    fetchMyWeatherData();
  },[])

  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Islamabad';
    if(myCity) cityName=myCity;
    fetchWeatherForecast({
      cityName : cityName,
      days:'7'
    }).then(data=>{
      setWeather(data);
      setLoading(false)
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

  const{current, location} = weather;

  return (
     <View style={styles.body}>
      <StatusBar style='light'/>
      <Image blurRadius={70} source={require('../assets/bg3.jpg')}  style={styles.image} />

      {
        loading? (
          <View style={styles.loading} >
            <Progress.CircleSnail thickness={10} size={140} color="white"/>
          </View>
        ):(

          <View style={styles.container}>


      {/* search section */}

      <View style={styles.search}>
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: showSearch ? 'rgba(255,255,255,0.2)' : 'transparent',
          },
        ]}
      >
        
        {showSearch ? (
          <TextInput
            onChangeText={handleTextDebounce}
            placeholder="Search City"
            placeholderTextColor="lightgrey"
            style={styles.input}
          />
        ) : (
          <View style={{ flex: 1 }} /> 
        )}

        <TouchableOpacity style={styles.searchbutton} onPress={() => toggleSearch(!showSearch)}>
          <Icon name="search" size={20} color="lightgrey" />
        </TouchableOpacity>
    </View>
        {
          locations.length>0 && showSearch?(
            <View style={styles.location}>
              {
                locations.map((loc,index)=>{
                  let showBorder = index+1 !=locations.length;
                 
                  return(
                    
                    <TouchableOpacity
                      onPress={()=> handleLocation(loc)}
                      key={index}
                      style={styles.loc}
                    >
                      <Icon name="map-marker" size={24} color="lightgrey" />
                      <Text style={styles.text}> {loc?.name}, {loc?.country}</Text>
                      
                    </TouchableOpacity>
                  )
                })
              }
            </View>
          ):null
        }
    </View>

        {/* forecast section */}
      <View style={styles.forecast}>
        {/* Location */}
        <Text style={styles.locationtext}>
          {location?.name},
          <Text style={styles.locationtext2}>
          {" "+location?.country}
          </Text>
        </Text>
        {/* Location */}
        <View style={styles.imgbox}>
          {/* <Image style={styles.img} source={require('../assets/Cloudy.png')} /> */}
          <WeatherAnimation condition={current?.condition?.text} />
        </View>

        {/* Celsius */}
        <View style={styles.celciusbox}>
          <Text style={styles.celcius}>{current?.temp_c}&deg;</Text>
          <Text style={styles.weathercondition}>{current?.condition?.text}</Text>
        </View>
        {/* other stats */}
        <View style={styles.stats}> 
          <View style={styles.wind}>
            <Feather name="wind" size={24} color="white" />
            <Text style={styles.windtext}>{current?.wind_kph}km</Text>
          </View>
          <View style={styles.wind}>
             <MaterialCommunityIcons name="water" size={24} color="white" />
            <Text style={styles.windtext}>{current?.humidity}%</Text>
          </View>
          <View style={styles.wind}>
            <Feather name="sun" size={24} color="white" />
            <Text style={styles.windtext}>{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
          </View>
        </View>
        
      </View>

        {/* next days forecast */}
        <View style={styles.nextbox}>
          <View style={styles.next}>
               <Feather name="calendar" size={24} color="white" />
               <Text style={styles.nexttext}>Daily Forecast</Text>
          </View>

                <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 15 }} showsHorizontalScrollIndicator={false}>
        {
          weather?.forecast?.forecastday?.map((item, index) => {
            let date = new Date(item.date);
            let options = { weekday: 'long' };
            let dayName = date.toLocaleDateString('en-US', options);

            return (
              <View key={index} style={styles.day}>
                <WeatherAnimationSmall condition={item?.day?.condition?.text} />
                <Text style={styles.daytext}>{dayName}</Text>
                <Text style={styles.daytext2}>{item?.day?.avgtemp_c}&deg;</Text>
              </View>
            );
          })
        }
      </ScrollView>
        </View>

      </View>
        )
      }

      

    </View>
  )
}

const styles = StyleSheet.create({
  body:{ 
    flex: 1,
    backgroundColor: 'white',
    position:"relative"
  },
  loading:{
    flex: 1,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  image:{
    position:"absolute",
    width:1000,
    height: "100%"
  },
  stats:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginHorizontal:4,
  },
  wind:{
    flexDirection:"row",
    alignItems:"center",
    marginHorizontal:20,
  },
  windimg:{
    width:30,
    height:30,
    marginRight:10,
  },
  windtext:{
    color:"white",
    fontWeight:"semibold",

  },
  container: {
    flex: 1
  }, 
  searchbutton:{
    backgroundColor:"rgba(255, 255, 255, 0.3)", 
    borderRadius:100,
    padding:10,
    margin:5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 1,
    width: '100%',       
    overflow: 'hidden',  
  },
input: {
  flex: 1,
  fontSize: 17,
  color: 'lightgrey',
  paddingLeft: 10,
},
search: {
  marginTop: 40,
  marginHorizontal: 10,
},
location:{
  position:"absolute",
  width:"100%",
  backgroundColor:"lightgrey", 
  borderRadius:20,
  top:53,
  zIndex: 10,
elevation: 10,
},
loc:{
  flexDirection: "row",
  alignItems:"center",
  borderWidth:0,
  padding:3,
  paddingHorizontal:4,
  marginBottom:4,
  
  
},
text:{
  color:"black",
  zIndex:10
},
forecast:{
  marginHorizontal: 4,
  flex:1,
  justifyContent:"space-around",
  marginbottom:2,


},
locationtext:{
  color:"white",
  textAlign:"center",
  fontSize:30,
  fontWeight:"bold"
},
locationtext2:{
  color:"white",
  textAlign:"center",
  fontSize:20,
  fontWeight:200,
  
},
imgbox:{
  flexDirection:"row",
  justifyContent:"center"
},
img:{
  width:200,
  height:200,

},
celciusbox:{
  
},
celcius:{
  textAlign:"center",
  fontWeight:"bold",
  color:"white",
  fontSize:40,
},
weathercondition:{
  textAlign:"center",
  letterSpacing:3,
  color:"white",
  fontSize:20,
},
nextbox:{
  
  marginTop:10,
  marginBottom:20,
},
next:{
  marginHorizontal:20,
  flexDirection:"row",

},
nexttext:{
  color:"white",
  marginHorizontal:10,
},
day:{
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    width:90,
    borderRadius:20,
    paddingVertical:5,
    marginRight:5,
    marginTop:10,
    backgroundColor:"rgba(255, 255, 255, 0.15)",
},
dayimg:{
  width:60,
  height:60,
},
daytext:{
  color:"white"
},
daytext2:{
  color:"white",
  fontWeight:"bold",
  fontSize:18,
  paddingBottom:8,
},
})