import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = ({ authorizationKey, locationName }) => {
  // setWeatherElement((prevState) => ({
  //   ...prevState,
  //   isLoading: true,
  // }));

  return (
    fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`
    )
      //回傳.json()格式檔案
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            //neededElements初始值為空物件，item為目前值
            if (["WDSD", "TEMP"].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
              //把elementName當key，Value當值，塞到neededElements裡面
            }
            return neededElements;
          },
          {}
        );
        // setWeatherElement((prevState) => ({
        //   ...prevState,
        return {
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
        };
        // }));
      })
  );
};

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      //取出某縣市的預報資料
      const locationData = data.records.location[0];
      //用reduce只保留需要用到的資料(天氣現象、降雨機率、舒適度)
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            // 只取time裡的第一筆資料time[0]
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );
      // setWeatherElement((prevState) => ({
      //   //如果沒展開會出錯
      //   ...prevState,
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
        isLoading: false,
        // }));
      };
    });
};

const useWeatherAPI = ({ locationName, cityName, authorizationKey }) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    description: "",
    windSpeed: 0,
    temperature: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));
    //使用await等待兩份資料回傳，Promise.all不用管先後順序。ps：要使用await就需要接在async裡面
    //回傳的兩隻API為"fetch()"
    const [currentWeather, weatherForecast] = await Promise.all([
      fetchCurrentWeather({ authorizationKey, locationName }),
      fetchWeatherForecast({ authorizationKey, cityName }),
    ]);
    // console.log(currentWeather);

    setWeatherElement((prevState) => ({
      ...prevState,
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    }));
  }, [authorizationKey, locationName, cityName]);

  useEffect(() => {
    console.log("execute function in useEffect");

    fetchData();
    // fetchCurrentWeather();
    // fetchWeatherForecast();
  }, [fetchData]);

  //此處不是回傳JSX，而是要讓其他元件使用的資料或方法
  return [weatherElement, fetchData];
};

export default useWeatherAPI;
