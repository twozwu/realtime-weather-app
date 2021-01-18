//import './App.css';
import React, { useState, useEffect, useMemo } from "react";
//import { ThemeProvider } from "emotion-theming";
import { ThemeProvider } from "@emotion/react";
import { getMoment, findLocation } from "./utils/helpers";
import WeatherCard from "./views/WeatherCard";
import styled from "@emotion/styled";
import useWeatherAPI from "./hooks/useWeatherAPI";
import WeatherSetting from "./views/WeatherSetting";

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
// const LOCATION_NAME = "古坑";
// const LOCATION_NAME_FORECAST = "雲林縣";

function App() {
  const [currentTheme, setCurrentTheme] = useState("light");

  const storageCity = localStorage.getItem("cityName") || "臺北市"; //從localStorage取出儲存值
  const [currentCity, setCurrentCity] = useState(storageCity);

  //這裡可以用useMemo，只要currentCity沒有改變就不需要重新取值
  const currentLocation = useMemo(() => findLocation(currentCity), [
    currentCity,
  ]); //可以找出所有需要的地名，如cityName:臺北市，locationName:臺北

  const { cityName, locationName, sunriseCityName } = currentLocation; //取出currentLocation裡的值

  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY,
  });

  //判斷目前是哪個頁面，預設是WeatherCard
  const [currentPage, setCurrentPage] = useState("WeatherCard");

  //換頁的函式
  const handleCurrentPageChange = (currentPage) => {
    //把setCurrentPage包成一個函式才能放入參數
    setCurrentPage(currentPage);
  };

  //要切換城市的函式
  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity);
  };

  //這裡用useMemo讓日夜沒有改變時，不用再去龐大資料裡找值
  //TODO：
  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName]);

  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            handleCurrentPageChange={handleCurrentPageChange}
            cityName={cityName}
          />
        )}

        {currentPage === "WeatherSetting" && (
          <WeatherSetting
            handleCurrentPageChange={handleCurrentPageChange}
            cityName={cityName}
            handleCurrentCityChange={handleCurrentCityChange}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
