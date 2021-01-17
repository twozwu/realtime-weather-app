//import './App.css';
import React, { useState, useEffect, useCallback, useMemo } from "react";
//import { ThemeProvider } from "emotion-theming";
import { useTheme, ThemeProvider, withTheme } from "@emotion/react";
import { getMoment } from "./utils/helpers";
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
const LOCATION_NAME = "古坑";
const LOCATION_NAME_FORECAST = "雲林縣";

function App() {
  const [currentTheme, setCurrentTheme] = useState("light");

  const [weatherElement, fetchData] = useWeatherAPI({
    locationName: LOCATION_NAME,
    cityName: LOCATION_NAME_FORECAST,
    authorizationKey: AUTHORIZATION_KEY,
  });

  //判斷目前是哪個頁面，預設是WeatherCard
  const [currentPage, setCurrentPage] = useState("WeatherCard");
  const handleCurrentPageChange = (currentPage) => {
    //把setCurrentPage包成一個函式才能放入參數
    setCurrentPage(currentPage);
  };

  //這裡用useMemo讓日夜沒有改變時，不用再去龐大資料裡找值
  //TODO：
  const moment = useMemo(() => getMoment(LOCATION_NAME_FORECAST), []);

  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  //用解構賦值方法把變數名稱從currentWeather取出來，就可以直接取用
  const { isLoading, weatherCode } = weatherElement;

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log("render, isLoading:", isLoading)}
        {currentPage === "WeatherCard" && (
          <WeatherCard
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            handleCurrentPageChange={handleCurrentPageChange}
          />
        )}

        {currentPage === "WeatherSetting" && (
          <WeatherSetting handleCurrentPageChange={handleCurrentPageChange} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
