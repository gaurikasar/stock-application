import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import LogoutButton from "../auth/LogoutButton";
import "../../css/NavBar.css";
import logoIcon from "../../css/images/risinghoodblackicon.png";
import HomeNavBar from "./HomeNavBar";
import "../../css/HomePage.css";
import "../../css/marketNews.css";
import Watchlists from "../Watchlists/watchlists";
import { useSelector } from "react-redux";

const HomePage = () => {
  const history = useHistory();
  const user = useSelector((state) => state.session.user);
  const [regularMarketPrice, setRegularMarketPrice] = useState(false);
  const [price, setPrice] = useState("");
  const [tooltipPrice, setToolTipPrice] = useState("0");
  const [marketNews, setMarketNews] = useState([]);
  const historicalData = useSelector((state) => state.stocks.historicalData);
  const allUserStocks = useSelector(
    (state) => state.transactions.allUserStocks
  );

  useEffect(() => {
    const finnhub = require("finnhub");
    const api_key = finnhub.ApiClient.instance.authentications["api_key"];
    api_key.apiKey = process.env.REACT_APP_FINNHUB_API_KEY_FIRST;
    const finnhubClient = new finnhub.DefaultApi();
    finnhubClient.marketNews("general", {}, (error, data, response) => {
      setMarketNews(data);
    });
  }, []);

  useEffect(() => {
  }, [marketNews]);
  

  function getTimeAgo(timestamp) {
    const currentTime = Date.now();
    const articlePublished = new Date(timestamp * 1000);
    const difference = currentTime - articlePublished;
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const oneMinute = 60 * 1000;

    if (difference >= oneDay) {
      const daysAgo = Math.floor(difference / oneDay);
      return daysAgo + (daysAgo === 1 ? " day ago" : " days ago");
    } else if (difference >= oneHour) {
      const hoursAgo = Math.floor(difference / oneHour);
      return hoursAgo + (hoursAgo === 1 ? " hour ago" : " hours ago");
    } else {
      const minutesAgo = Math.floor(difference / oneMinute);
      return minutesAgo + (minutesAgo === 1 ? " minute ago" : " minutes ago");
    }
  }

  const marketNewsComponents = marketNews?.map((article, index) => {
    return (
      <a key={index} href={`${article.url}`}>
        <div className="market-news-article">
          <div className="market-news-header">
            <div className="market-news-source">{article.source}</div>
            <div className="market-news-date">
              {getTimeAgo(article.datetime)}
            </div>
          </div>
          <div className="market-news-middle-content">
            <div className="market-news-content">
              <div className="market-news-description">
                <div className="market-news-headline">{article.headline}</div>
                <div className="market-news-summary">{article.summary}</div>
              </div>
            </div>
            <div className="market-news-image">
              <img src={article.image} alt="market news image" />
            </div>
          </div>
        </div>
      </a>
    );
  });

  return (
    <div className="home-container" >
      <div className="nav-bar-home">
        <HomeNavBar />
      </div>
      <div className="home-body-container">
        <div className="left-content">
          
            <div className="investment-container">
              <div className="investment">
                {"Total Amount Invested: "}
                $
                {
                  user.total_investment
                  }
              </div>
            </div>
          
          <div className="investment-container">
          <div className="investment"> Buying Power <span>${user.buying_power}</span>
          </div>
          </div>
          <div className="market-news-container">
            <div className="market-news-title">News</div>
            {marketNewsComponents}
          </div>
        </div>
        <Watchlists />
      </div>
    </div>
  );
};

export default HomePage;
