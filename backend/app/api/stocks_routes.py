from flask import Blueprint, jsonify, request, json
from flask_login import login_required, current_user
from app.models import db, User, Watchlist, Stock, Transaction
from app.forms import WatchlistForm, StocksSearchForm, TickerPricesForm, HistoricalDataForm
from app.utils import companyInfo, keyStatistics
from sqlalchemy import or_
import yfinance as yf
from yahoo_fin import stock_info as si
from bs4 import BeautifulSoup, SoupStrainer
import threading
import requests
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

stocks_routes = Blueprint('stocks', __name__)

@stocks_routes.route('/<stock_symbol>')
@login_required
def get_stock_info(stock_symbol):
    try:
        symbol = stock_symbol.upper()
        session = requests.Session()
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'}

        stock= Stock.query.filter(Stock.stock_symbol == symbol).first()
        if not stock:
            return jsonify({"error": "Stock not found"}), 404

        x = threading.Thread(target=keyStatistics, args=(symbol, session))
        x.start()
        
        company_info_dict = companyInfo(symbol, session, headers)
        formatted_res = {
            'id': stock.id,
            'stockDescription': company_info_dict.get("stockDescription", '_'),
            'employees': company_info_dict.get("employees", '_'),
            'headquarters': company_info_dict.get("headquarters", '_'),
            'Sector': company_info_dict.get("sector", '_'),
            'marketCap': company_info_dict.get("Market Cap", '_'),
            'priceEarningsRatio': company_info_dict.get("PE Ratio (TTM)", '_'),
            'dividendYield': company_info_dict.get("Forward Dividend & Yield", '_').split(" ")[0] if "Forward Dividend & Yield" in company_info_dict else '_',
            'averageVolume': company_info_dict.get("Avg. Volume", '_'),
            'highToday': company_info_dict.get("Day's Range", '_').split(" - ")[1] if "Day's Range" in company_info_dict else '_',
            'lowToday': company_info_dict.get("Day's Range", '_').split(" - ")[0] if "Day's Range" in company_info_dict else '_',
            'openPrice': company_info_dict.get("Open", '_'),
            'volume': company_info_dict.get("Volume", '_'),
            'fiftyTwoWeekHigh': company_info_dict.get("52 Week Range", '_').split(" - ")[1] if "52 Week Range" in company_info_dict else '_',
            'fiftyTwoWeekLow': company_info_dict.get("52 Week Range", '_').split(" - ")[0] if "52 Week Range" in company_info_dict else '_',
        }
        return jsonify(formatted_res), 200
    except Exception as e:
        logger.error(f"Error in get_stock_info: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@stocks_routes.route('/price/<stock_symbol>')
@login_required
def get_stock_price(stock_symbol):
    try:
        price = si.get_live_price(stock_symbol)
        return {"liveStockPrice": price}, 200
    except Exception as e:
        logger.error(f"Error in get_stock_price: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@stocks_routes.route('/prices', methods=['POST'])
@login_required
def get_stocks_prices():
    try:
        form = TickerPricesForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        stocks = json.loads(form.data['stock_symbols'])
        prices = {}
        for stock in stocks:
            price = si.get_live_price(stock)
            prices[stock] = price
        return {"liveStockPrices": prices}, 200
    except Exception as e:
        logger.error(f"Error in get_stocks_prices: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@stocks_routes.route('/historical', methods=['POST'])
@login_required
def get_stocks_historical_data():
    try:
        form = HistoricalDataForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        data = json.loads(form.data['stocks_info'])
        stock_symbols = data["stock_symbols"]
        now = datetime.now()
        one_week_ago = now - timedelta(days=1)

        new_data = {}
        if 'tickers' in data:
            tickers = data["tickers"]
            if len(tickers) == 1 or (len(tickers) == 2 and tickers[0] == tickers[1]):
                historical_data = yf.download(tickers=tickers[0], period='1wk', interval='30m')
                close_prices = historical_data['Close']
                new_data[tickers[0]] = json.loads(close_prices.to_json())
                return jsonify(new_data), 200

            historical_data = yf.download(tickers=tickers, period='1wk', interval='30m', threads=True)
            close_prices = historical_data['Close']
            return jsonify(json.loads(close_prices.to_json())), 200

        for stock in stock_symbols:
            symbol = stock[0]
            interval = stock[1]
            period = stock[2]
            time_period = None

            if period == '1wk':
                time_period = now - timedelta(weeks=1)
            elif period == '1d':
                time_period = now - timedelta(days=1)
            elif period == '1mo':
                time_period = now - timedelta(weeks=4)
            elif period == '3mo':
                time_period = now - timedelta(weeks=12)
            elif period == '1y':
                time_period = now - timedelta(days=365)
            elif period == '5y':
                time_period = now - timedelta(days=1825)

            start_date = time_period
            end_date = now
            if period == '1d':
                historical_data = yf.download(tickers=symbol, period=period, interval=interval)
            else:
                historical_data = yf.download(tickers=symbol, start=start_date, end=end_date, interval=interval)
            
            close_prices = historical_data['Close']
            new_data[symbol] = json.loads(close_prices.to_json())

        return jsonify(new_data), 200
    except Exception as e:
        logger.error(f"Error in get_stocks_historical_data: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@stocks_routes.route('/', methods=["POST"])
@login_required
def find_stocks():
    try:
        form = StocksSearchForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        stocks = Stock.query.filter(or_(Stock.company_name.ilike(f'%{form.data["name"]}%'), Stock.stock_symbol.ilike(f'{form.data["name"]}%'))).order_by(Stock.company_name).limit(6)
        if len(list(stocks)) > 0:
            return jsonify({'stocks': [stock.to_dict() for stock in stocks]}), 200
        else:
            return jsonify({"errors": "could not find stocks"}), 404
    except Exception as e:
        logger.error(f"Error in find_stocks: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
