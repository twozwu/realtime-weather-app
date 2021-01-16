//import './App.css';
import React, { useState, useEffect, useCallback, useMemo } from "react";
//import { ThemeProvider } from "emotion-theming";
import { useTheme, ThemeProvider, withTheme } from "@emotion/react";
import { getMoment } from "./utils/helpers";
import WeatherCard from "./views/WeatherCard";
import styled from "@emotion/styled";

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282",
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc",
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AUTHORIZATION_KEY = "CWB-162A49ED-7604-4411-9750-1DBB6E4CC83F";
const LOCATION_NAME = "古坑";
const LOCATION_NAME_FORECAST = "雲林縣";

const fetchCurrentWeather = () => {
  // setWeatherElement((prevState) => ({
  //   ...prevState,
  //   isLoading: true,
  // }));

  return (
    fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`
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

const fetchWeatherForecast = () => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME_FORECAST}`
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

function App() {
  const [currentTheme, setCurrentTheme] = useState("light");

  //這裡用useMemo讓日夜沒有改變時，不用再去龐大資料裡找值
  //TODO：
  const moment = useMemo(() => getMoment(LOCATION_NAME_FORECAST), []);

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
      fetchCurrentWeather(),
      fetchWeatherForecast(),
    ]);
    // console.log(currentWeather);

    setWeatherElement((prevState) => ({
      ...prevState,
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    }));
  }, []);

  useEffect(() => {
    console.log("execute function in useEffect");

    fetchData();
    // fetchCurrentWeather();
    // fetchWeatherForecast();
  }, [fetchData]);

  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  //用解構賦值方法把變數名稱從currentWeather取出來，就可以直接取用
  const { isLoading, weatherCode } = weatherElement;

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log("render, isLoading:", isLoading)}
        <WeatherCard
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
