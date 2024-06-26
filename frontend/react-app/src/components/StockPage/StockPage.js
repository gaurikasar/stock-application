import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import HomeNavBar from "../HomePage/HomeNavBar";
import "../../css/StockPage.css";
import "../../css/companyNews.css";
import {
  fetchStockInfo,
  clearStockInfo,
  fetchStockPrice,
} from "../../store/stocks";
import { Modal } from "../context/Modal";
import WatchlistStockModal from "./WatchlistStockModal.js";
import {
  fetchAllUserStocks,
  fetchBuyNewStocks,
  fetchSellAllStocks,
  fetchUpdateStocks,
} from "../../store/transactions";
import { fetchUser } from "../../store/session";
import StockChart from "./StockChart";

const StockPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const stockInfo = useSelector((state) => state.stocks.stockInfo);
  const watchlists = useSelector((state) => state.lists.watchlists);
  const { stockSymbol } = useParams();
  const allUserStocks = useSelector(
    (state) => state.transactions.allUserStocks
  );
  const liveStockPrice = useSelector((state) => state.stocks.liveStockPrice);
  const [clickedBuyIn, setClickedBuyIn] = useState("shares");
  const [clickedDropdown, setClickedDropDown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isBuy, setIsBuy] = useState(true);
  const [sharesInput, setSharesInput] = useState(0);
  const [dollarsInput, setDollarsInput] = useState(0);
  const [errors, setErrors] = useState([]);
  const [companyNews, setCompanyNews] = useState([]);
  const [success, setSuccess] = useState([]);
  const [click, setClick] = useState(false);
  const [priceLive, setPriceLive] = useState(liveStockPrice?.liveStockPrice?.toFixed(2));
  const [sellAll, setSellAll] = useState(false);
  const [percentChange, setPercentChange] = useState('');
  const [priceChange, setPriceChange] = useState('');
  const [regularMarketPrice, setRegularMarketPrice] = useState(true);
  const [tooltipPrice, setToolTipPrice] = useState("");
  const livePrice = liveStockPrice?.liveStockPrice?.toFixed(2);
  // console.log(errors, "ERRRRRRRRRRRRRORSSS");
  //   console.log(allUserStocks, "ALLUSER STOCKSSS")



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

  const handleSelect = (e) => {
    return setClickedBuyIn(e.target.value);
  };

  const handleSellAll = () => {
    const sellTransaction = {
      stock_symbol: stockSymbol,
      price_per_share_sold: livePrice,
    };
    let userStockId = allUserStocks[stockSymbol].id
    dispatch(fetchSellAllStocks(user.id, userStockId, sellTransaction)).then((data) => {
      setSellAll(false);
      setIsBuy(true);
      setSuccess(["All shares sold successfully"]);
      dispatch(fetchUser());
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess([]);
    setErrors([]);

    let shares;

    if (clickedBuyIn === "dollars") {
      let dollarsToShares = dollarsInput / livePrice;
      shares = dollarsToShares;
    } else shares = sharesInput;

    const buyNewStock = {
      stock_symbol: stockSymbol,
      stock_shares: shares,
      price_per_share: livePrice,
    };

    if (allUserStocks[stockSymbol]) {
      const updateBuyStock = {
        stock_symbol: stockSymbol,
        stock_shares_bought: shares,
        price_per_share: livePrice,
      };
      const updateSellStock = {
        stock_symbol: stockSymbol,
        stock_shares_sold: shares,
        price_per_share: livePrice,
      };

      if (isBuy) {
        let userStockId = allUserStocks[stockSymbol].id
        const data = await dispatch(fetchUpdateStocks(user.id, userStockId ,updateBuyStock));
        if (data.error) {
          setErrors([data.error]);
        }
        if (data.success) {
          setSuccess([]);
          setSuccess([data.success]);
        }
      } else {
        if (
          sharesInput > allUserStocks[stockSymbol].totalShares ||
          sharesInput > allUserStocks[stockSymbol].totalShares
        ) {
          return setErrors(["You do not have enough shares"]);
        }
        let userStockId = allUserStocks[stockSymbol].id
        console.log(userStockId, "USERSTOCKIDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
        const data = await dispatch(fetchUpdateStocks(user.id, userStockId, updateSellStock));
        if (data.error) {
          setErrors([data.error]);
        }
        if (data.success) {
          setIsBuy(true);
          setSuccess([]);
          setSuccess([data.success]);
        }
      }
    } else {
      const userId = user.id
      const data = await dispatch(fetchBuyNewStocks(userId, stockSymbol, buyNewStock));
      if (data.error) {
        setErrors([data.error]);
      }
      if (data.success) {
        setSuccess([]);
        setSuccess([data.success]);
      }
    }
    setClick(!click);
    dispatch(fetchUser());
  };

 
  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchAllUserStocks(user.id));
  }, [click]);

  useEffect(() => {
    dispatch(clearStockInfo());
    dispatch(fetchStockInfo(stockSymbol));
    liveStockPrice.liveStockPrice = 0;
  }, [ stockSymbol]);

  useEffect(() => {
    dispatch(fetchStockPrice(stockSymbol))
    .then((data) => setPriceLive(data.liveStockPrice?.toFixed(2)))
    const interval = setInterval(() => {
      dispatch(fetchStockPrice(stockSymbol));
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, stockSymbol, livePrice]);

  useEffect(() => {
    const finnhub = require("finnhub");
    const api_key = finnhub.ApiClient.instance.authentications["api_key"];
    api_key.apiKey = process.env.REACT_APP_FINNHUB_API_KEY_FIRST;
    const finnhubClient = new finnhub.DefaultApi();
    const today = new Date()
    const todayFormatted = today.toISOString().split("T")[0];
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const midnightFormatted = midnight.toISOString().split("T")[0];
    finnhubClient.companyNews(stockSymbol, midnightFormatted, todayFormatted, (error, data, response) => {
      setCompanyNews(data)
      console.log(data)
    });
  }, []);

  useEffect(() => {
    console.log(companyNews, "INITIALLLL MARKETTTT NEWSSSSSSSSSSSSSS USEEFECTT");
  }, [companyNews]);



  const companyNewsComponents = companyNews?.map((article, index) => {
    return (
      <a href={`${article.url}`}>
        <div className="company-news-article">
          <div className="company-news-header">
            <div className="company-news-source">{article.source}</div>
            <div className="company-news-date">
              {getTimeAgo(article.datetime)}
            </div>
          </div>
          <div className="company-news-middle-content">
            <div className="company-news-content">
              <div className="company-news-description">
                <div className="company-news-headline">{article.headline}</div>
                <div className="company-news-summary">{article.summary}</div>
              </div>
            </div>
            <div className="company-news-image">
              <img src={article.image} alt="companyet news image" />
            </div>
          </div>
        </div>
      </a>
    );
  });




  return (
    <div className="stock-page-container">
      <div className="stock-page-nav">
        <HomeNavBar />
      </div>
      <div className="stock-page-body">
        <div className="first-column">
          <div className="chart-container">
            <div className="chart-header">
              <div className="main-name">{stockSymbol}</div>
              <div className="stock-page-price">
                ${regularMarketPrice
                  ? livePrice
                  : Number(tooltipPrice).toFixed(2)}
              </div>
              <div className={percentChange < 0 ? "negative" : "positive" }><span >${priceChange}</span> &nbsp; <span>({percentChange}%)</span> </div>
            </div>
            <div className="chart">
              
              <StockChart
                setToolTipPrice={setToolTipPrice}
                setRegularMarketPrice={setRegularMarketPrice}
                setPercentChange={setPercentChange}
                setPriceChange={setPriceChange}
              />
            </div>
          </div>
          <div className="stock-info-container">
            <div className="about-title">
              <div className="about">About</div>
            </div>
            <div className="stock-description">
              {stockInfo?.stockDescription
                ? stockInfo?.stockDescription
                : "...Loading"}
            </div>
            <div className="company-info-container">
             
              <div className="info-container">
                <div className="info-title">Employees</div>
                <div className="info-name">
                  {stockInfo?.employees ? stockInfo?.employees : "...Loading"}
                </div>
              </div>
              <div className="info-container">
                <div className="info-title">Headquarters</div>
                <div className="info-name">
                  {stockInfo?.headquarters
                    ? stockInfo?.headquarters
                    : "...Loading"}
                </div>
              </div>
              <div className="info-container">
                <div className="info-title">Sector</div>
                <div className="info-name">
                  {stockInfo?.Sector ? stockInfo?.Sector : "...Loading"}
                </div>
              </div>
            </div>
            <div className="key-statistics-container">
              <div className="key-statistics-title">Key statistics</div>
              <div className="key-container">
                <div className="key-info-container">
                  <div className="key-info-title">Market cap</div>
                  <div className="key-info-name">{stockInfo?.marketCap ? stockInfo?.marketCap : "...Loading"}</div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">Price-Earnings ratio</div>
                  <div className="key-info-name">
                    {stockInfo?.priceEarningsRatio ? stockInfo?.priceEarningsRatio : "...Loading"}
                  </div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">Dividend yield</div>
                  <div className="key-info-name">{stockInfo?.dividendYield ? stockInfo?.dividendYield : "...Loading" }</div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">Average volume</div>
                  <div className="key-info-name">{stockInfo?.averageVolume ? stockInfo?.averageVolume : "...Loading"}</div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">High today</div>
                  <div className="key-info-name">${stockInfo?.highToday ? stockInfo?.highToday : "...Loading"}</div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">Low today</div>
                  <div className="key-info-name">${stockInfo?.lowToday ? stockInfo?.lowToday : "...Loading" }</div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">Open price</div>
                  <div className="key-info-name">${stockInfo?.openPrice ? stockInfo?.openPrice : "...Loading"}</div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">Volume</div>
                  <div className="key-info-name">{stockInfo?.volume ? stockInfo?.volume : "...Loading"}</div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">52 Week high</div>
                  <div className="key-info-name">
                    ${stockInfo?.fiftyTwoWeekHigh ? stockInfo?.fiftyTwoWeekHigh : "...Loading"}
                  </div>
                </div>
                <div className="key-info-container">
                  <div className="key-info-title">52 Week low</div>
                  <div className="key-info-name">
                    ${stockInfo?.fiftyTwoWeekLow ? stockInfo?.fiftyTwoWeekLow : "...Loading"}
                  </div>
                </div>
              </div>
            </div>
            <div className="company-news-container">
              {companyNewsComponents}
            </div>
          </div>
        </div>

        <div className="second-column">
          <div className="stock-transaction-container">
            <div className="stock-transaction">
              {!allUserStocks[stockSymbol] ? (
                <div className="transaction-header">
                  <div
                    className={
                      isBuy ? "clicked-transaction-type" : "buy-stock-title"
                    }
                    onClick={() => {
                      setIsBuy(true);
                      setSellAll(false);
                    }}
                  >
                    Buy {stockSymbol}
                  </div>
                </div>
              ) : (
                <div className="transaction-header">
                  <div
                    className={
                      isBuy ? "clicked-transaction-type" : "buy-stock-title"
                    }
                    onClick={() => {
                      setIsBuy(true);
                      setSellAll(false);
                    }}
                  >
                    Buy {stockSymbol}
                  </div>
                  <div
                    className={
                      isBuy ? "buy-stock-title" : "clicked-transaction-type"
                    }
                    onClick={() => setIsBuy(false)}
                  >
                    Sell {stockSymbol}
                  </div>
                </div>
              )}

              <div className="transaction-form">
                <div className="order-type">
                  Order Type <span>Market Order</span>
                </div>
                <div className="buy-in">
                  {isBuy ? <span>Buy In </span> : <span>Sell In </span>}
                
                  <div className="buy-type-dropdown">
                    <select
                      name="buyType"
                      id="buy-type-select"
                      onChange={handleSelect}
                    >
                      <option value="shares" selected>
                        Shares
                      </option>
                      <option value="dollars">Dollars</option>
                    </select>
                  </div>
                </div>

                {clickedBuyIn === "dollars" ? (
                  <div className="amount">
                    <div className="amount-text">Amount</div>
                    <div className="amount-input">
                      <input
                        name="amount"
                        placeholder="$0.00"
                        type="number"
                        min="0"
                        value={dollarsInput}
                        onChange={(e) => setDollarsInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="share-amount">
                    <div className="share-amount-text">Shares</div>
                    <div className="share-amount-input">
                      <input
                        placeholder="0"
                        type="number"
                        min="0"
                        value={sharesInput}
                        onChange={(e) => setSharesInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="market-price">
                  <div className="market-price-text">Market Price</div>
                  <div className="market-price-amount">${livePrice}</div>
                </div>
                {isBuy ? (
                  <div className="transaction-total">
                    <div className="estimated-text">
                      {clickedBuyIn === "shares"
                        ? "Estimated Cost"
                        : "Estimated Qty."}
                    </div>
                    <div className="estimated-price">
                      {clickedBuyIn === "shares"
                        ? `$${(livePrice * sharesInput).toFixed(2)}`
                        : `${(dollarsInput / livePrice).toFixed(2)}`}
                    </div>
                  </div>
                ) : (
                  <div className="transaction-total">
                    <div className="estimated-text">
                      {clickedBuyIn === "shares"
                        ? "Estimated Credit"
                        : "Estimated Qty."}
                    </div>
                    <div className="estimated-price">
                      {clickedBuyIn === "shares"
                        ? `$${(livePrice * sharesInput).toFixed(2)}`
                        : `${(dollarsInput / livePrice).toFixed(2)}`}
                    </div>
                  </div>
                )}

                {!sellAll ? (
                  <div className="transactions-submit-button">
                    <div className="errors">
                      {errors?.map((error, ind) => (
                        <div key={ind}>{error}</div>
                      ))}
                    </div>
                    <div className="success">
                      {success?.map((message, ind) => (
                        <div key={ind}>{message}</div>
                      ))}
                    </div>
                    <div className="review-order-button" onClick={handleSubmit}>
                      Review Order
                    </div>
                  </div>
                ) : null}

                {sellAll ? (
                  <div className="sell-all-confirmation">
                    <div className="sell-all-message">
                      You are placing an order to sell all your shares of{" "}
                      {stockSymbol}
                    </div>
                    <div className="accept-sell-all" onClick={handleSellAll}>
                      Sell All
                    </div>
                    <div
                      className="cancel-sell-all"
                      onClick={() => setSellAll(false)}
                    >
                      Cancel
                    </div>
                  </div>
                ) : null}
                
              </div>
              {isBuy ? (
                <div className="transactions-power">
                  <div className="transactions-power-text">
                    ${user?.buying_power} buying power avaialable
                  </div>
                </div>
              ) : (
                <div className="transactions-power">
                  <div className="transactions-power-text-sell">
                    {clickedBuyIn === "shares" ? (
                      <>
                        <div className="investment-power">
                          About{" "}
                          {allUserStocks[stockSymbol]?.totalShares.length > 1
                            ? allUserStocks[stockSymbol]?.totalShares?.toFixed(
                                4
                              )
                            : allUserStocks[stockSymbol]?.totalShares}{" "}
                          Shares Avaialable
                        </div>
                        <div
                          className="sell-all"
                          onClick={() => setSellAll(true)}
                        >
                          -<span>Sell All</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="investment-power">
                          About $
                          {(
                            allUserStocks[stockSymbol]?.totalShares * livePrice
                          )?.toFixed(4)}{" "}
                          Avaialable
                        </div>
                        <div
                          className="sell-all"
                          onClick={() => setSellAll(true)}
                        >
                          - <span>Sell All</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className="add-stock-watchlist"
              onClick={() => setShowAddModal(true)}
            >
              <div className="add-stock-button">Add to Lists</div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
         
          <WatchlistStockModal
           
            setShowAddModal={setShowAddModal}
          
          />
        </Modal>
      )}
    </div>
  );
};

export default StockPage;
