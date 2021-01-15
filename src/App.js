//import './App.css';
import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { ReactComponent as DayCloudy } from "./images/day-cloudy.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as AirFlowIcon } from "./images/airFlow.svg";
import { ReactComponent as RefreshIcon } from "./images/refresh.svg";
//import { ThemeProvider } from "emotion-theming";
import { useTheme, ThemeProvider, withTheme } from "@emotion/react";
import dayjs from "dayjs";
import { ReactComponent as LoadingIcon } from "./images/loading.svg";

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

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};
  cursor: pointer;
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? "1.5s" : "0s")};
  }
`;

const DayCloudyIcon = styled(DayCloudy)`
  flex-basis: 30%;
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

  //用解構賦值方法把變數名稱從currentWeather取出來，就可以直接取用
  const {
    observationTime,
    locationName,
    description,
    windSpeed,
    temperature,
    rainPossibility,
    isLoading,
    comfortability,
  } = weatherElement;

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log("render, isLoading:", isLoading)}
        <WeatherCard>
          <Location>{locationName}</Location>
          <Description>
            {description} -{comfortability}
          </Description>

          <CurrentWeather>
            <Temperature>
              {Math.round(temperature)} <Celsius>°C</Celsius>
            </Temperature>
            <DayCloudyIcon />
          </CurrentWeather>
          <AirFlow>
            <AirFlowIcon /> {windSpeed} m/h
          </AirFlow>
          <Rain>
            <RainIcon /> {rainPossibility}%
          </Rain>
          <Refresh onClick={fetchData} isLoading={isLoading}>
            最後觀測時間：
            {new Intl.DateTimeFormat("zh-TW", {
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(observationTime))}{" "}
            {isLoading ? <LoadingIcon /> : <RefreshIcon />}
          </Refresh>
        </WeatherCard>
      </Container>
    </ThemeProvider>
  );
}

export default App;
