import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../../css/Watchlists.css";
import Chart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistoricalData } from "../../store/stocks";
import { useParams } from "react-router-dom";

const HomeStockChart = ({ stockSymbol }) => {
  const dispatch = useDispatch();
  const allUserStocks = useSelector(
    (state) => state.transactions.allUserStocks
  );
  const watchlists = useSelector((state) => state.lists.watchlists);
  const historicalData = useSelector((state) => state.stocks.historicalData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wait, setWait] = useState(false);

  setTimeout(() => {
    setWait(true);
  }, 100);

  const [data, setData] = useState({
    options: {
      chart: {
        id: "basic-bar",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      grid: {
        show: false,
      },
      stroke: {
        width: 2,
      },
      colors: ["#00C805"],
      xaxis: {
        categories: [],
        labels: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
      noData: {
        text: "Loading...",
        align: "center",
        verticalAlign: "center",
        style: {
          color: "black",
          fontSize: "13px",
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        show: false,
      },
    },
    series: [],
  });

  useEffect(() => {
    console.log({ stock_symbols: [stockSymbol] }, "STOCKINFOOOOOOOOOOOOOOOOOOOOO");

    // Log the historical data to inspect the format
    console.log(historicalData, "Historical Data");

    if (Object.keys(historicalData).length) {
      const categories = Object.keys(historicalData[stockSymbol] ? historicalData[stockSymbol] : []);
      const seriesData = Object.values(historicalData[stockSymbol] ? historicalData[stockSymbol] : []);

      // Convert timestamps to readable dates
      const formattedCategories = categories.map(timestamp => new Date(parseInt(timestamp)).toLocaleDateString());

      setData({
        options: {
          chart: {
            id: "basic-bar",
            type: "line",
            toolbar: {
              show: false,
            },
            zoom: {
              enabled: false,
            },
            animations: {
              enabled: false,
            },
          },
          grid: {
            show: false,
          },
          stroke: {
            width: 1.75,
          },
          colors: ["#00C805"],
          xaxis: {
            tickAmount: 0,
            position: "top",
            categories: formattedCategories,
            labels: {
              show: false,
            },
          },
          yaxis: [
            {
              tickAmount: 0,
              show: false,
              labels: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
              axisTicks: {
                show: false,
              },
            },
          ],
          annotations: {
            yaxis: [
              {
                y: seriesData[0],
              },
            ],
          },
          noData: {
            text: "Loading...",
            align: "center",
            verticalAlign: "center",
            style: {
              color: "black",
              fontSize: "8px",
            },
          },
          tooltip: {
            show: false,
          },
          dataLabels: {
            enabled: false,
          },
        },
        series: [
          {
            name: "price",
            data: seriesData,
          },
        ],
      });
    }
  }, [stockSymbol, historicalData]);

  return (
    <div className="home-stocks-chart-container">
      {Object.keys(historicalData).length ? (wait && <Chart options={data.options} series={data.series} width={100} height={80} />) : "...Loading"}
    </div>
  );
};

export default HomeStockChart;
